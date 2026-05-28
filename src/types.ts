export type ButtonSize = 'small' | 'medium' | 'large' | 'xl';

export interface AppButton {
  id: string;
  name: string;
  url: string;
  color: string; // 'emerald' | 'blue' | 'purple' | 'indigo' | 'rose' | 'amber' | 'slate' | 'violet'
  size: ButtonSize;
  icon: string; // E.g. '📊', '✉️', '📂', '🛡️', '🚒', '🔨', '⏰'
  category: string; // 'All' | 'OPD' | 'IPD' | 'IV' | 'DIS' | 'ผู้ช่วย'
  isPriority: boolean;
  clicks: number;
  description?: string;
  lastActive?: string;
}

export interface SystemMetrics {
  totalVisits: number;
  averageLatency: number;
  servicesReachable: number;
}
