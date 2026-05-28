export interface GasResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

function getGasConfig() {
  const url = process.env.GAS_WEB_APP_URL?.trim();
  const secret = process.env.GAS_API_SECRET?.trim();
  return { url, secret };
}

/** บังคับใช้ URL แบบ /exec (ไม่ใช่ /dev จาก Test deployment) */
export function normalizeGasUrl(url: string): string {
  const u = url.trim();
  if (/\/dev(\?|$)/i.test(u)) {
    return u.replace(/\/dev(\?.*)?$/i, '/exec$1');
  }
  return u;
}

export function isGasConfigured(): boolean {
  const { url, secret } = getGasConfig();
  return !!(url && secret);
}

/**
 * fetch ไปยัง Google Apps Script Web App
 * GAS มักตอบ 302 redirect — ต้อง follow เองและคง method + body (POST)
 */
async function fetchGas(url: string, init: RequestInit): Promise<Response> {
  const normalizedUrl = normalizeGasUrl(url);
  const method = init.method || 'GET';
  const body = init.body;

  let currentUrl = normalizedUrl;
  let response = await fetch(currentUrl, { ...init, redirect: 'manual' });

  for (let hop = 0; hop < 6; hop++) {
    if (response.status < 300 || response.status >= 400) {
      break;
    }
    const location = response.headers.get('Location');
    if (!location) break;

    currentUrl = location.startsWith('http')
      ? location
      : new URL(location, currentUrl).toString();

    response = await fetch(currentUrl, {
      method,
      headers: init.headers,
      body: method !== 'GET' && method !== 'HEAD' ? body : undefined,
      redirect: 'manual',
    });
  }

  return response;
}

export async function callGas<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
  method: 'GET' | 'POST' = 'POST'
): Promise<GasResponse<T>> {
  const { url, secret } = getGasConfig();

  if (!url || !secret) {
    return {
      ok: false,
      error: 'GAS_WEB_APP_URL หรือ GAS_API_SECRET ยังไม่ได้ตั้งค่าใน Environment Variables',
    };
  }

  try {
    let response: Response;

    if (method === 'GET') {
      const params = new URLSearchParams({
        action,
        secret,
        ...Object.fromEntries(
          Object.entries(payload).map(([k, v]) => [k, String(v)])
        ),
      });
      const gasUrl = `${normalizeGasUrl(url)}?${params.toString()}`;
      response = await fetchGas(gasUrl, { method: 'GET' });
    } else {
      response = await fetchGas(normalizeGasUrl(url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, secret, ...payload }),
      });
    }

    return parseGasResponse<T>(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `เชื่อมต่อ Google Apps Script ไม่สำเร็จ: ${message}` };
  }
}

async function parseGasResponse<T>(response: Response): Promise<GasResponse<T>> {
  const text = await response.text();
  const trimmed = text.trim();

  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<HTML')) {
    return {
      ok: false,
      error:
        'Apps Script ส่งหน้า HTML กลับมา (มักเกิดจาก URL ผิด, ยังไม่ Deploy, หรือสิทธิ์ไม่ใช่ Anyone) — ตรวจ GAS_WEB_APP_URL ต้องลงท้าย /exec',
    };
  }

  let parsed: { ok?: boolean; data?: T; error?: string } = {};

  try {
    parsed = trimmed ? JSON.parse(trimmed) : {};
  } catch {
    return {
      ok: false,
      error: `Apps Script ตอบกลับไม่ใช่ JSON (HTTP ${response.status}): ${trimmed.slice(0, 300)}`,
    };
  }

  if (!response.ok || parsed.ok === false) {
    return {
      ok: false,
      error: parsed.error || `HTTP ${response.status}: ${trimmed.slice(0, 200)}`,
    };
  }

  return { ok: true, data: parsed.data as T };
}
