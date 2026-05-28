import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Laptop,
  Smartphone, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Activity, 
  Shield, 
  CheckCircle, 
  RefreshCw, 
  Sliders, 
  Sparkles, 
  ArrowUpRight, 
  Check, 
  Clock,
  FileText, 
  LayoutGrid,
  Info,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Radio,
  ServerCrash,
  Lock,
  Unlock,
  LogOut,
  AlertTriangle,
  Key,
  TrendingUp,
  BarChart3,
  Bell,
  X
} from 'lucide-react';
import { AppButton, ButtonSize } from './types';
import { COLOR_PRESETS, CATEGORIES, EMOJI_PICKER } from './data';
import { BangkokHospitalLogo } from './components/BangkokHospitalLogo';
import { AdminAuthModal } from './components/AdminAuthModal';
import { RedirectionModal } from './components/RedirectionModal';
import { NotificationModal } from './components/NotificationModal';
import { ButtonFormModal } from './components/ButtonFormModal';
import { AppButtonCard } from './components/AppButtonCard';
import { DashboardAnalytics } from './components/DashboardAnalytics';

export default function App() {
  // --- STATE ---
  const [buttons, setButtons] = useState<AppButton[]>([]);

  // Global Session States for Security Gate
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('appportal_logged_in') === 'true';
  });
  
  // Login Inputs
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginShaking, setLoginShaking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Admin Verification 3-Step States
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('appportal_admin_authorized') === 'true';
  });
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminAuthStep, setAdminAuthStep] = useState(1); // Steps 1, 2, 3
  const [adminAuthInput, setAdminAuthInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthShaking, setAdminAuthShaking] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Admin Mode activation state, can only toggle to ON if isAdminAuthorized
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return sessionStorage.getItem('appportal_admin_mode') === 'true';
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'PC' | 'iPhone'>('PC');

  // Popup Notification States
  const [notification, setNotification] = useState<{ enabled: boolean, message: string }>({ enabled: false, message: '' });
  const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState<boolean>(false);
  const [isSavingNotification, setIsSavingNotification] = useState<boolean>(false);
  const [notificationFormMessage, setNotificationFormMessage] = useState<string>('');
  const [notificationFormEnabled, setNotificationFormEnabled] = useState<boolean>(false);
  const [notificationSaveStatus, setNotificationSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Custom Form State for Button configurator
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formColor, setFormColor] = useState('navy');
  const [formSize, setFormSize] = useState<ButtonSize>('medium');
  const [formIcon, setFormIcon] = useState('💊');
  const [formCategory, setFormCategory] = useState('OPD');
  const [formDescription, setFormDescription] = useState('');
  const [formIsPriority, setFormIsPriority] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Router Modal state (connecting diagnostics tunnel)
  const [activeRoutingApp, setActiveRoutingApp] = useState<AppButton | null>(null);
  const [routingStep, setRoutingStep] = useState(0); // 0: Idle, 1: Checking Protocol, 2: DNS & Health, 3: Launching
  const [routingLog, setRoutingLog] = useState<string[]>([]);

  const [sheetSyncing, setSheetSyncing] = useState(false);
  const [sheetSaveError, setSheetSaveError] = useState<string>('');

  const [sheetStatus, setSheetStatus] = useState<{
    configured: boolean;
    connected: boolean;
    spreadsheetId: string | null;
    error: string;
    rowCount: number;
  }>({
    configured: false,
    connected: false,
    spreadsheetId: null,
    error: '',
    rowCount: 0
  });

  // --- CUSTOM IN-APP CONFIRMATION MODAL STATE ---
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    return CATEGORIES.filter(c => c !== 'All');
  });

  const [categorySyncStatus, setCategorySyncStatus] = useState<{
    status: 'idle' | 'syncing' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  const updateCategoriesList = async (newCategories: string[]) => {
    setCategoriesList(newCategories);
    
    setCategorySyncStatus({ status: 'syncing' });
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategories)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.syncedWithSheet) {
          setCategorySyncStatus({
            status: 'success',
            message: 'บันทึกหมวดหมู่ลง Google Sheet สำเร็จแล้ว'
          });
        } else {
          setCategorySyncStatus({
            status: 'error',
            message: 'บันทึก Google Sheet ไม่สำเร็จ: ' + (result.error || 'ไม่มีรายละเอียดข้อผิดพลาด')
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setCategorySyncStatus({
          status: 'error',
          message: errorData.error || 'เซิร์ฟเวอร์ปฏิเสธการเซฟหมวดหมู่'
        });
      }
    } catch (err: any) {
      console.error('Failed to sync master categories list to backend:', err);
      setCategorySyncStatus({
        status: 'error',
        message: 'การเชื่อมต่อขัดข้อง: ' + (err.message || err)
      });
    }
  };

  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    if (showCategoryManager) {
      setCategorySyncStatus({ status: 'idle' });
    }
  }, [showCategoryManager]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const handleSyncFromSheet = async () => {
    setSheetSyncing(true);
    try {
      const response = await fetch('/api/buttons/sync-sheet', { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result.buttons) && result.buttons.length > 0) {
          setButtons(result.buttons);
        }
      }
      const statusRes = await fetch('/api/sheet-status');
      if (statusRes.ok) {
        setSheetStatus(await statusRes.json());
      }
    } catch (err) {
      console.error('Failed to sync from Google Sheet:', err);
    } finally {
      setSheetSyncing(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categoriesList.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('มีหมวดหมู่นี้อยู่แล้ว');
      return;
    }
    const updated = [...categoriesList, trimmed];
    updateCategoriesList(updated);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (catToDelete: string) => {
    triggerConfirm(
      'ลบหมวดหมู่',
      `คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "${catToDelete}"? การลบจะไม่ลบปุ่มที่มีอยู่ แต่ปุ่มเหล่านั้นจะไม่เชื่อมโยงกับหมวดหมู่นี้หากไม่มีการเลือกหมวดหมู่อื่น`,
      () => {
        const updated = categoriesList.filter(c => c !== catToDelete);
        updateCategoriesList(updated);
      },
      { confirmText: 'ยืนยันลบ', cancelText: 'ยกเลิก', type: 'danger' }
    );
  };

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; type?: 'danger' | 'warning' | 'info' }
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText: options?.confirmText || 'ยืนยัน',
      cancelText: options?.cancelText || 'ยกเลิก',
      type: options?.type || 'info',
      onConfirm: () => {
        onConfirm();
        setConfirmConfig(null);
      }
    });
  };

  // Automatically filter out 'Operations' from buttons
  useEffect(() => {
    let changed = false;
    const cleanedButtons = buttons.map(b => {
      if (!b.category) return b;
      const catsList = b.category.split(',').map(c => c.trim()).filter(Boolean);
      const isOperationsPresent = catsList.some(c => c.toLowerCase() === 'operations');
      if (isOperationsPresent) {
        changed = true;
        const cleanedArr = catsList.filter(c => c.toLowerCase() !== 'operations');
        const finalCategory = cleanedArr.length > 0 ? cleanedArr.join(', ') : 'OPD';
        return { ...b, category: finalCategory };
      }
      return b;
    });

    if (changed) {
      setButtons(cleanedButtons);
    }
  }, [buttons]);

  // Keep categoriesList fully synchronized with all active button categories and default templates
  useEffect(() => {
    const uniqueCategories = new Set<string>();
    const seenLower = new Set<string>();

    const addCategory = (c: string) => {
      const trimmed = c.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (lower !== 'all' && lower !== 'operations' && !seenLower.has(lower)) {
        seenLower.add(lower);
        uniqueCategories.add(trimmed);
      }
    };
    
    // Add default templates first, excluding All and Operations
    ['OPD', 'IPD', 'IV', 'DIS', 'ผู้ช่วย'].forEach(addCategory);
    
    // Force loaded categoriesList items (except Operations and All)
    categoriesList.forEach(addCategory);

    // Merge categories currently derived from loaded buttons
    buttons.forEach((b: AppButton) => {
      if (b.category) {
        b.category.split(',').forEach(addCategory);
      }
    });

    const newList = Array.from(uniqueCategories);
    
    // Check if newList is structurally different from current categoriesList
    const isDifferent = newList.length !== categoriesList.length || 
      newList.some((val, idx) => categoriesList[idx]?.toLowerCase() !== val.toLowerCase());

    if (isDifferent) {
      updateCategoriesList(newList);
    }
  }, [buttons, categoriesList]);

  // Load buttons and categories from Google Sheet via API
  useEffect(() => {
    const loadConfigFromBackend = async () => {
      try {
        const response = await fetch('/api/buttons');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setButtons(data);
          }
        }
      } catch (error) {
        console.error('Failed to auto-fetch buttons from backend:', error);
      }

      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const catData = await response.json();
          if (Array.isArray(catData) && catData.length > 0) {
            setCategoriesList(catData);
          }
        }
      } catch (error) {
        console.error('Failed to auto-fetch categories from backend:', error);
      }

      try {
        const response = await fetch('/api/notification');
        if (response.ok) {
          const data = await response.json();
          setNotification(data);
          setNotificationFormMessage(data.message || '');
          setNotificationFormEnabled(!!data.enabled);
          
          // Check if this notification has been dismissed previously
          const dismissedMessage = sessionStorage.getItem('appportal_dismissed_notification');
          if (data.enabled && data.message && data.message !== dismissedMessage) {
            setIsNotificationPopupOpen(true);
          }
        }
      } catch (error) {
        console.error('Failed to auto-fetch notification from backend:', error);
      }
    };
    loadConfigFromBackend();
  }, []);

  // Fetch Google Sheet connection status
  useEffect(() => {
    const fetchSheetStatus = async () => {
      try {
        const response = await fetch('/api/sheet-status');
        if (response.ok) {
          setSheetStatus(await response.json());
        }
      } catch (err) {
        console.error('Failed to query sheet status:', err);
      }
    };
    fetchSheetStatus();
    const interval = setInterval(fetchSheetStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateButtonsAndSync = async (newButtons: AppButton[] | ((prev: AppButton[]) => AppButton[])) => {
    const saveToSheet = async (data: AppButton[]) => {
      try {
        const response = await fetch('/api/buttons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === false) {
          const msg = result.error || `บันทึกไม่สำเร็จ (HTTP ${response.status})`;
          setSheetSaveError(msg);
          console.error('Google Sheet save failed:', msg);
          return false;
        }
        setSheetSaveError('');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setSheetSaveError('เชื่อมต่อ API ไม่ได้: ' + msg);
        console.error('Failed to auto-save to Google Sheet API:', err);
        return false;
      }
    };

    if (typeof newButtons === 'function') {
      setButtons(prev => {
        const resolved = newButtons(prev);
        void saveToSheet(resolved);
        return resolved;
      });
    } else {
      setButtons(newButtons);
      await saveToSheet(newButtons);
    }
  };

  // UTC Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close category dropdown on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const container = document.getElementById('category-picker-wrapper');
      if (container && !container.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // --- LOGIN ACTION ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === '123456') {
      sessionStorage.setItem('appportal_logged_in', 'true');
      setIsLoggedIn(true);
      setLoginError('');
      setLoginPassword('');
      
      // Force popup notification to open upon successful login if an active notification is configured
      if (notification && notification.enabled && notification.message) {
        setIsNotificationPopupOpen(true);
      }
    } else {
      setLoginError('รหัสผ่านเข้าสู่ระบบไม่ถูกต้อง!');
      setLoginShaking(true);
      setTimeout(() => setLoginShaking(false), 500);
    }
  };

  const handleLogout = () => {
    if (isAdminMode || isAdminAuthorized) {
      triggerConfirm(
        'ต้องการลงชื่อออกจากระบบ?',
        'ต้องการลงชื่อออกจากระบบผู้ดูแลระบบ (Admin Log out) และออกจากเวชระเบียนจริงหรือไม่?',
        () => {
          sessionStorage.removeItem('appportal_logged_in');
          sessionStorage.removeItem('appportal_admin_authorized');
          sessionStorage.removeItem('appportal_admin_mode');
          setIsLoggedIn(false);
          setIsAdminAuthorized(false);
          setIsAdminMode(false);
          setEditingId(null);
        },
        { confirmText: 'ออกจากระบบ', cancelText: 'ยกเลิก', type: 'warning' }
      );
    } else {
      sessionStorage.removeItem('appportal_logged_in');
      sessionStorage.removeItem('appportal_admin_authorized');
      sessionStorage.removeItem('appportal_admin_mode');
      setIsLoggedIn(false);
      setIsAdminAuthorized(false);
      setIsAdminMode(false);
      setEditingId(null);
    }
  };

  // --- ADMIN MODE TOGGLE WITH 3-STEP SECURITY CHECK ---
  const handleAdminModeToggleClick = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setIsAdminAuthorized(false);
      sessionStorage.removeItem('appportal_admin_authorized');
      sessionStorage.removeItem('appportal_admin_mode');
    } else {
      const isAuthorized = sessionStorage.getItem('appportal_admin_authorized') === 'true';
      if (isAuthorized) {
        setIsAdminAuthorized(true);
        setIsAdminMode(true);
        sessionStorage.setItem('appportal_admin_mode', 'true');
      } else {
        setAdminAuthStep(1);
        setAdminAuthInput('');
        setAdminAuthError('');
        setShowAdminAuthModal(true);
      }
    }
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = adminAuthInput.trim();

    if (adminAuthStep === 1) {
      if (cleanInput === '221008') {
        setAdminAuthStep(2);
        setAdminAuthInput('');
        setAdminAuthError('');
      } else {
        setAdminAuthError('รหัสผ่านสำหรับ Admin ขั้นที่ 1 ไม่ถูกต้อง!กรุณาลองใหม่อีกครั้ง');
        setAdminAuthShaking(true);
        setTimeout(() => setAdminAuthShaking(false), 500);
      }
    } else if (adminAuthStep === 2) {
      if (cleanInput === '25031998') {
        setAdminAuthStep(3);
        setAdminAuthInput('');
        setAdminAuthError('');
      } else {
        setAdminAuthError('รหัสผ่านสำหรับ Admin ขั้นที่ 2 ไม่ถูกต้อง!กรุณาลองใหม่อีกครั้ง');
        setAdminAuthShaking(true);
        setTimeout(() => setAdminAuthShaking(false), 500);
      }
    } else if (adminAuthStep === 3) {
      if (cleanInput === '0891707117a') {
        sessionStorage.setItem('appportal_admin_authorized', 'true');
        sessionStorage.setItem('appportal_admin_mode', 'true');
        setIsAdminAuthorized(true);
        setIsAdminMode(true);
        setShowAdminAuthModal(false);
        setAdminAuthStep(1);
        setAdminAuthInput('');
        setAdminAuthError('');
      } else {
        setAdminAuthError('รหัสผ่านสำหรับ Admin ขั้นที่ 3 ไม่ถูกต้อง!กรุณาลองใหม่อีกครั้ง');
        setAdminAuthShaking(true);
        setTimeout(() => setAdminAuthShaking(false), 500);
      }
    }
  };

  // Revoke Admin session manually
  const handleRevokeAdminAuthority = () => {
    sessionStorage.removeItem('appportal_admin_authorized');
    sessionStorage.removeItem('appportal_admin_mode');
    setIsAdminAuthorized(false);
    setIsAdminMode(false);
    setEditingId(null);
  };

  // --- BUTTON OPERATIONS ---
  const selectForEditing = (btn: AppButton) => {
    setEditingId(btn.id);
    setFormName(btn.name);
    setFormUrl(btn.url);
    setFormColor(btn.color);
    setFormSize(btn.size);
    setFormIcon(btn.icon);
    setFormCategory(btn.category);
    setFormDescription(btn.description || '');
    setFormIsPriority(btn.isPriority);
  };

  const startAddNew = () => {
    setEditingId('NEW');
    setFormName('New Department App');
    setFormUrl('https://app.bph-corp.com');
    setFormColor('blue');
    setFormSize('medium');
    setFormIcon('💊');
    setFormCategory('OPD');
    setFormDescription('คำอธิบายเครื่องมือตรวจจับย่อยระบบเชื่อมสมาพันธ์เพื่อสุขภาพโรงพยาบาล');
    setFormIsPriority(false);
  };

  const toggleFormCategory = (cat: string) => {
    const currentCats = formCategory.split(',')
      .map(c => c.trim())
      .filter(Boolean);
    
    const lowerCat = cat.toLowerCase();
    const existsIdx = currentCats.findIndex(c => c.toLowerCase() === lowerCat);
    
    if (existsIdx !== -1) {
      currentCats.splice(existsIdx, 1);
    } else {
      currentCats.push(cat);
    }
    
    setFormCategory(currentCats.join(', '));
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUrl.trim()) return;

    if (editingId === 'NEW') {
      const newBtn: AppButton = {
        id: Date.now().toString(),
        name: formName,
        url: formUrl,
        color: formColor,
        size: formSize,
        icon: formIcon,
        category: formCategory,
        isPriority: formIsPriority,
        clicks: 0,
        description: formDescription,
        lastActive: 'Added Just Now'
      };
      updateButtonsAndSync(prev => [...prev, newBtn]);
      setEditingId(newBtn.id); // set current editing target
    } else if (editingId) {
      updateButtonsAndSync(prev => prev.map(btn => {
        if (btn.id === editingId) {
          return {
            ...btn,
            name: formName,
            url: formUrl,
            color: formColor,
            size: formSize,
            icon: formIcon,
            category: formCategory,
            isPriority: formIsPriority,
            description: formDescription
          };
        }
        return btn;
      }));
    }
  };

  const handleDeleteButton = (id: string) => {
    triggerConfirm(
      'คุณต้องการนำปุ่มนี้ออกจากสารบัญจริงหรือไม่?',
      'การลบปุ่มนี้จะเป็นการนำลิงก์ระบบสารสนเทศออกจากหน้าสารบัญอย่างถาวร',
      () => {
        updateButtonsAndSync(prev => prev.filter(btn => btn.id !== id));
        if (editingId === id) {
          setEditingId(null);
        }
      },
      { confirmText: 'ลบปุ่มถาวร', cancelText: 'ยกเลิก', type: 'danger' }
    );
  };

  // Safe launcher triggers clean loader transition before redirecting to the target app
  const triggerRoutingModal = (btn: AppButton) => {
    setActiveRoutingApp(btn);
    setRoutingStep(1);
    
    // Increment click counts
    updateButtonsAndSync(prev => prev.map(item => {
      if (item.id === btn.id) {
        return { ...item, clicks: item.clicks + 1, lastActive: 'Active Now' };
      }
      return item;
    }));

    setTimeout(() => {
      window.open(btn.url, '_blank');
      setActiveRoutingApp(null);
    }, 700);
  };

  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotification(true);
    setNotificationSaveStatus('idle');
    try {
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: notificationFormEnabled,
          message: notificationFormMessage,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setNotification(result.notification);
        setNotificationSaveStatus('success');
        
        // Remove dismissed flag so that next visits will see this updated message
        sessionStorage.removeItem('appportal_dismissed_notification');
        
        // Open the popup modal immediately as a live preview for the Admin
        if (result.notification.enabled && result.notification.message) {
          setIsNotificationPopupOpen(true);
        }

        setTimeout(() => setNotificationSaveStatus('idle'), 3000);
      } else {
        setNotificationSaveStatus('error');
      }
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      setNotificationSaveStatus('error');
    } finally {
      setIsSavingNotification(false);
    }
  };

  const handleCloseNotificationPopup = () => {
    setIsNotificationPopupOpen(false);
    if (notification.message) {
      sessionStorage.setItem('appportal_dismissed_notification', notification.message);
    }
  };

  // Helper to map category names to distinct high-contrast vibrant themes for action feedback and transparent normal states
  const getCategoryTheme = (catKey: string) => {
    const norm = catKey.toUpperCase();
    if (catKey === 'All') {
      return {
        textColor: 'text-[#002D62]',
        normalBg: 'bg-transparent border-transparent hover:border-transparent',
        activeBg: 'bg-[#002D62]',
        activeText: 'text-white',
        activeBorder: 'border-transparent',
        hoverBg: 'hover:bg-[#002D62] hover:text-white',
        hoverScale: 'hover:scale-108 active:scale-95 hover:shadow-md hover:z-10',
        motionBg: '#002D62',
        motionBorder: 'transparent',
        shadowColor: 'rgba(0, 45, 98, 0.4)',
      };
    }
    
    if (norm.includes('OPD') || norm.includes('ผู้ป่วยนอก')) {
      return {
        textColor: 'text-emerald-600',
        normalBg: 'bg-transparent border-transparent hover:border-transparent',
        activeBg: 'bg-emerald-500',
        activeText: 'text-white',
        activeBorder: 'border-transparent',
        hoverBg: 'hover:bg-[#10b981] hover:text-white',
        hoverScale: 'hover:scale-108 active:scale-95 hover:shadow-emerald-250 hover:shadow-md hover:z-10',
        motionBg: '#10b981',
        motionBorder: 'transparent',
        shadowColor: 'rgba(16, 185, 129, 0.4)',
      };
    }

    if (norm.includes('IPD') || norm.includes('ผู้ป่วยใน')) {
      return {
        textColor: 'text-blue-600',
        normalBg: 'bg-transparent border-transparent hover:border-transparent',
        activeBg: 'bg-blue-600',
        activeText: 'text-white',
        activeBorder: 'border-transparent',
        hoverBg: 'hover:bg-[#2563eb] hover:text-white',
        hoverScale: 'hover:scale-108 active:scale-95 hover:shadow-blue-250 hover:shadow-md hover:z-10',
        motionBg: '#2563eb',
        motionBorder: 'transparent',
        shadowColor: 'rgba(37, 99, 235, 0.4)',
      };
    }

    if (norm.includes('IV') || norm.includes('ผสมยา') || norm.includes('สารน้ำ')) {
      return {
        textColor: 'text-[#b23b20]',
        normalBg: 'bg-transparent border-transparent hover:border-transparent',
        activeBg: 'bg-[#b23b20]',
        activeText: 'text-white',
        activeBorder: 'border-transparent',
        hoverBg: 'hover:bg-[#b23b20] hover:text-white',
        hoverScale: 'hover:scale-108 active:scale-95 hover:shadow-orange-250 hover:shadow-md hover:z-10',
        motionBg: '#b23b20',
        motionBorder: 'transparent',
        shadowColor: 'rgba(178, 59, 32, 0.4)',
      };
    }

    if (norm.includes('DIS') || norm.includes('DISCHARGE') || norm.includes('จำหน่าย')) {
      return {
        textColor: 'text-sky-600',
        normalBg: 'bg-transparent border-transparent hover:border-transparent',
        activeBg: 'bg-sky-500',
        activeText: 'text-white',
        activeBorder: 'border-transparent',
        hoverBg: 'hover:bg-[#0ea5e9] hover:text-white',
        hoverScale: 'hover:scale-108 active:scale-95 hover:shadow-sky-250 hover:shadow-md hover:z-10',
        motionBg: '#0ea5e9',
        motionBorder: 'transparent',
        shadowColor: 'rgba(14, 165, 233, 0.4)',
      };
    }

    if (norm.includes('HELP') || norm.includes('ผู้ช่วย') || norm.includes('ช่วยเหลือ') || norm.includes('ROSE') || norm.includes('ชมพู')) {
      return {
        textColor: 'text-purple-600',
        normalBg: 'bg-transparent border-transparent hover:border-transparent',
        activeBg: 'bg-purple-600',
        activeText: 'text-white',
        activeBorder: 'border-transparent',
        hoverBg: 'hover:bg-[#9333ea] hover:text-white',
        hoverScale: 'hover:scale-108 active:scale-95 hover:shadow-purple-250 hover:shadow-md hover:z-10',
        motionBg: '#9333ea',
        motionBorder: 'transparent',
        shadowColor: 'rgba(147, 51, 234, 0.4)',
      };
    }

    if (norm.includes('ADMIN') || norm.includes('จัดการ') || norm.includes('ระบบ') || norm.includes('ตั้งค่า')) {
      return {
        textColor: 'text-slate-700',
        normalBg: 'bg-transparent border-transparent hover:border-transparent',
        activeBg: 'bg-slate-800',
        activeText: 'text-white',
        activeBorder: 'border-transparent',
        hoverBg: 'hover:bg-[#1e293b] hover:text-white',
        hoverScale: 'hover:scale-108 active:scale-95 hover:shadow-slate-250 hover:shadow-md hover:z-10',
        motionBg: '#1e293b',
        motionBorder: 'transparent',
        shadowColor: 'rgba(30, 41, 59, 0.4)',
      };
    }

    // Default other category: Black (ดำ)
    return {
      textColor: 'text-slate-800',
      normalBg: 'bg-transparent border-transparent hover:border-transparent',
      activeBg: 'bg-slate-800',
      activeText: 'text-white',
      activeBorder: 'border-transparent',
      hoverBg: 'hover:bg-[#1e293b] hover:text-white',
      hoverScale: 'hover:scale-108 active:scale-95 hover:shadow-slate-250 hover:shadow-md hover:z-10',
      motionBg: '#1e293b',
      motionBorder: 'transparent',
      shadowColor: 'rgba(30, 41, 59, 0.4)',
    };
  };

  // Computed Values
  const dynamicCategories = useMemo(() => {
    const list = new Set<string>();
    list.add('All');
    categoriesList.forEach(c => list.add(c));
    buttons.forEach(b => {
      if (b.category) {
        b.category.split(',').map(c => c.trim()).filter(Boolean).forEach(cat => list.add(cat));
      }
    });
    return Array.from(list);
  }, [buttons, categoriesList]);

  const sortedAndFilteredButtons = useMemo(() => {
    let result = [...buttons];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.name.toLowerCase().includes(q) || 
        b.url.toLowerCase().includes(q) || 
        (b.description && b.description.toLowerCase().includes(q)) ||
        b.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') {
      result = result.filter(b => {
        if (!b.category) return false;
        return b.category.split(',').map(c => c.trim().toLowerCase()).includes(selectedCategory.toLowerCase());
      });
    }
    // Sort logic: priority first, then count of clicks desc, then name asc
    return result.sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      if (b.clicks !== a.clicks) return b.clicks - a.clicks;
      return a.name.localeCompare(b.name);
    });
  }, [buttons, searchQuery, selectedCategory]);

  const totalClicksMetric = useMemo(() => {
    return buttons.reduce((acc, b) => acc + (b.clicks || 0), 0);
  }, [buttons]);

  // Analytics helper lists for Dashboard Summation
  const dashboardAnalytics = useMemo(() => {
    const countsByCategory: { [key: string]: { count: number; clicks: number } } = {};
    let totalPriority = 0;
    
    buttons.forEach(b => {
      if (b.isPriority) totalPriority++;
      if (b.category) {
        const subCats = b.category.split(',').map(c => c.trim()).filter(Boolean);
        subCats.forEach(cat => {
          if (!countsByCategory[cat]) {
            countsByCategory[cat] = { count: 0, clicks: 0 };
          }
          countsByCategory[cat].count += 1;
          countsByCategory[cat].clicks += (b.clicks || 0);
        });
      }
    });

    const topButtons = [...buttons]
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 3);

    return {
      categoryRows: Object.entries(countsByCategory).map(([category, info]) => ({
        category,
        count: info.count,
        clicks: info.clicks
      })),
      totalPriority,
      topButtons
    };
  }, [buttons]);

  return (
    <AnimatePresence mode="wait">
      {!isLoggedIn ? (
        <motion.div
          key="login-view"
          initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="min-h-screen bg-slate-50 border-t-8 border-[#B82025] flex items-center justify-center p-4 relative overflow-hidden font-sans w-full"
        >
          {/* Subtle, minimal clinical brand background shapes */}
          <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-105-30 blur-2xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/3 w-[250px] h-[250px] rounded-full bg-red-100/10 blur-2xl pointer-events-none" />

          <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Logo badge and name */}
            <div className="text-center mb-6 flex flex-col items-center">
              <div className="inline-flex items-center justify-center p-5 bg-white rounded-2xl shadow-md border border-slate-200 mb-4 ring-4 ring-red-50/50 hover:scale-105 transition-transform duration-300">
                <BangkokHospitalLogo className="h-14" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center justify-center gap-2">
                AppPortal Gate <span className="text-[#B82025] text-[10px] font-bold px-2 py-0.5 bg-red-50 rounded border border-red-200 uppercase tracking-widest animate-pulse">Secure Access</span>
              </h1>
              <p className="text-slate-500 text-xs mt-1.5 font-medium">ระบบสารบรรณความปลอดภัยเภสัชกรรมด้านเวชระเบียนลิงก์</p>
            </div>

            <motion.div 
              id="login-form-container"
              className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md relative"
              animate={loginShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4, x: { type: 'tween', ease: 'easeInOut', duration: 0.4 } }}
            >
              
              {/* Minimal dual color brand header stripe */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#B82025] to-[#002D62] rounded-t-2xl" />

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5 mt-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-slate-700 text-sm font-bold uppercase tracking-wide">
                      รหัสผ่านเจ้าหน้าที่ (Password)
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-slate-500 hover:text-slate-900 font-bold"
                    >
                      {showPassword ? 'ซ่อน' : 'แสดง'}
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="ป้อนรหัสผ่าน" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl text-base placeholder:text-slate-400 focus:ring-2 focus:ring-[#002D62] focus:border-[#002D62] outline-none transition-all font-mono"
                    />
                    <Key className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#002D62] hover:bg-[#001D42] text-white font-extrabold rounded-xl text-base transition-all tracking-wider uppercase select-none cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <Unlock className="w-5 h-5 animate-pulse" />
                  <span>ตรวจสอบสิทธิเข้าระบบ</span>
                </button>

              </form>

            </motion.div>

            <div className="text-center mt-6 text-slate-500 text-sm font-sans tracking-wide font-semibold capitalize opacity-90 flex items-center justify-center gap-1">
              <span>powered by Chanunyu R. Pharmacist</span>
              <span className="text-sm select-none font-sans font-semibold">®</span>
              <span>2026</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="main-view"
          initial={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          id="app-root"
          className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-700 w-full"
        >
          
          {/* 1. BRAND NAVIGATION HEADER - Crisp White & Centered Centered Search */}
          <nav id="appportal-nav" className="flex flex-col xl:flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-xs gap-4 relative z-30 w-full">
            
            {/* Hospital Brand Badge and Title Info */}
            <div className="flex items-center gap-4 w-full xl:w-1/3 justify-start shrink-0">
              <BangkokHospitalLogo />
              <div className="h-8 w-px bg-slate-200 hidden md:block" />
              <div className="hidden md:block select-none">
                <h1 className="text-[16px] font-black text-slate-800 tracking-wider flex items-center gap-1.5 uppercase font-sans">
                  AppPortal
                  <span className="text-[10px] bg-red-50 text-[#B82025] px-2.5 py-0.5 rounded font-mono border border-red-200 font-extrabold tracking-widest">
                    CLINICAL PORT
                  </span>
                </h1>
                <p className="text-[12px] font-black text-slate-900 tracking-wide font-sans mt-0.5">
                  Powered by Chanunyu R. Pharmacist
                </p>
              </div>
            </div>

            {/* Dynamic Global Search Centered and Expanded */}
            <div className="w-full xl:w-1/3 flex justify-center">
              <div className="relative w-full max-w-lg">
                <input 
                  id="global-search-input"
                  type="text" 
                  placeholder="ค้นหาระบบโรงพยาบาล/ลิงก์ใช้งาน..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-2.5 bg-slate-50 border border-slate-250 text-slate-850 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#002D62] focus:border-[#002D62] outline-none transition-all font-semibold shadow-ns text-center"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3 text-slate-450 hover:text-slate-755 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Action Center on Right */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-1/3 justify-end shrink-0">
              
              <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
                
                {/* Live Mode Trigger requiring 3-Step Verification Mode */}
                <button 
                  id="admin-mode-toggle"
                  onClick={handleAdminModeToggleClick}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-bold cursor-pointer transition-all ${
                    isAdminMode 
                      ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                  }`}
                  title="สวิตช์เพิ่มแก้ไขบอร์ดปุ่มลิงก์ระบบพยาบาล"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isAdminMode ? 'bg-rose-600 animate-pulse' : 'bg-slate-400'}`}></span>
                  <span>{isAdminMode ? 'ผู้ดูแลระบบ (Admin On)' : 'Pharmacist'}</span>
                </button>
 
                {/* Account Log out */}
                <button 
                  onClick={handleLogout}
                  className="p-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-250 rounded-lg transition-all cursor-pointer shadow-sm animate-in fade-in duration-200"
                  title="ออกจากเซสชันปัจจุบัน (Log Out)"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>

              </div>
            </div>
          </nav>

      {/* 2. BODY COMPONENT CONTAINER */}
      <main id="appportal-main" className="flex-1 overflow-visible relative w-full animate-fade-in">
        
        {/* MAIN PANEL CONTENT SPACE */}
        <section id="portal-directory" className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50/50">

          {/* HEADER ROW WITH COUNTERS & PARAMETERS */}
          <div className="mb-6 pb-5 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 font-sans">
                📂 Internal Operations Gateway Platform
              </h2>
              {isAdminMode && (
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg border border-blue-200 font-sans">
                  {buttons.length} ลิงก์ระบบสารสนเทศ
                </div>
              )}
            </div>
            <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed max-w-3xl font-medium font-sans">
              ระบบอำนวยความสะดวกในการเข้าถึงเอกสาร ข้อมูล เว็บไซต์ แผนกเภสัชกรรม โรงพยาบาลกรุงเทพพัทยา
            </p>
            {isAdminMode && sheetSaveError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800 font-semibold">
                <strong>บันทึก Google Sheet ไม่สำเร็จ:</strong> {sheetSaveError}
                <span className="block text-xs text-rose-600 mt-1 font-normal">
                  ตรวจ env บน Vercel, Apps Script Deploy (/exec, Anyone), และเปิด{' '}
                  <code className="bg-white px-1 rounded">/api/health</code> เพื่อทดสอบ
                </span>
              </div>
            )}
          </div>

          {/* CATEGORIES BUTTON FILTER PANEL */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs font-sans">
            <div className="flex flex-wrap items-center gap-2 overflow-visible py-1.5 w-full sm:w-auto font-sans">
              {dynamicCategories.map((catKey) => {
                const isActive = selectedCategory === catKey;
                const theme = getCategoryTheme(catKey);
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`relative px-4 py-2.5 text-sm rounded-lg shrink-0 cursor-pointer transition-all duration-300 border border-transparent select-none 
                      ${theme.hoverScale}
                      ${isActive 
                        ? 'text-white' 
                        : `${theme.normalBg} ${theme.textColor} ${theme.hoverBg}`
                      }
                    `}
                    style={{
                      boxShadow: isActive ? `0px 4px 14px ${theme.shadowColor}` : undefined
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryTab"
                        className="absolute inset-0 rounded-lg border shadow-sm"
                        style={{
                          backgroundColor: theme.motionBg,
                          borderColor: theme.motionBorder,
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5 font-black uppercase tracking-wide">
                      {catKey === 'All' ? '📂 หมวดหมู่ทั้งหมด' : `🔖 ${catKey}`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-sm text-slate-500 font-bold flex items-center gap-1.5 font-sans justify-end">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>เรียงลำดับ: ความสำคัญ ➔ คลิกสูงสุด</span>
            </div>
          </div>

          {/* SEARCH CRITERIA ALERT WRAPPER */}
          {searchQuery && (
            <div className="mb-4 bg-blue-50 border border-blue-150 p-3.5 rounded-lg text-sm text-blue-900 flex justify-between items-center shadow-xs font-sans">
              <span>
                กำลังคัดกรองลิงก์โดยคำค้น "<strong>{searchQuery}</strong>" และหมวดหมู่ "<strong>{selectedCategory}</strong>" พบบันทึกในสารบบ <strong>{sortedAndFilteredButtons.length}</strong> แถว
              </span>
              <button onClick={() => setSearchQuery('')} className="text-blue-700 hover:underline font-bold text-sm cursor-pointer">
                ล้างคำค้นหา ✕
              </button>
            </div>
          )}

          {/* DIRECTORY DYNAMIC GRID - Light Clinical White Cards, Slate Borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" id="applications-grid">
            
            <AnimatePresence mode="popLayout">
              {sortedAndFilteredButtons.map((btn) => (
                <AppButtonCard
                  key={btn.id}
                  btn={btn}
                  isAdminMode={isAdminMode}
                  onEdit={selectForEditing}
                  onLaunch={triggerRoutingModal}
                />
              ))}

              {/* EMPTY CORNER SCREEN BADGE */}
              {sortedAndFilteredButtons.length === 0 && (
                <div id="no-search-results" className="col-span-full py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl p-6 font-sans">
                  <ServerCrash className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-700">ไม่มีข้อมูลที่ตรงกับการค้นหา</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                    ไม่พบระบบปลายทางที่ประสงค์หารองรับดัตช์เวิร์ด "{searchQuery}" กรุณาล้างคำคัดกรองหรือเปิดบัญชีสร้างปุ่มใหม่
                  </p>
                  {isAdminMode && (
                    <button 
                      onClick={startAddNew}
                      className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-sm animate-in"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      เปิดส่วนเพิ่มปุ่มใหม่ทันที
                    </button>
                  )}
                </div>
              )}

              {/* DASHED QUICK CONNECTOR ADD TARGET CARD FOR ADMIN */}
              {isAdminMode && (
                <motion.div
                  id="dashed-quick-add-card"
                  onClick={startAddNew}
                  className="p-5 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl bg-white hover:bg-blue-50/20 flex flex-col items-center justify-center gap-2 text-center cursor-pointer group transition-all h-[155px]"
                  layout
                  title="คลิกเพื่อเพิ่มลิงก์ระบบใหม่"
                >
                  <div className="w-9 h-9 bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-all border border-slate-200">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">เพิ่มปุ่มทางด่วนระบบสารสนเทศ</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Configure and append brand tab</p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ==================== 5. NEW DYNAMIC CLINICAL ANALYTICAL DASHBOARD (Only visible in admin mode) ==================== */}
          {isAdminMode && (
            <DashboardAnalytics
              buttons={buttons}
              sheetStatus={sheetStatus}
              dashboardAnalytics={dashboardAnalytics}
              totalClicksMetric={totalClicksMetric}
              onSyncFromSheet={handleSyncFromSheet}
              isSyncing={sheetSyncing}
            />
          )}

          {/* Spacer to push floating components */}
          <div className="h-6" />

          {/* ==================== POPUP ANNOUNCEMENT CONFIGURATION PANEL (Only visible in admin mode) ==================== */}
          {isAdminMode && (
            <div id="popup-announcement-config" className="mt-6 p-6 bg-white border border-slate-250 rounded-2xl shadow-ns relative overflow-hidden font-sans">
              
              {/* Header section */}
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">จัดการระบบการแจ้งเตือนประชาสัมพันธ์แบบ Pop-up (Popup Alert Control)</h4>
                  <p className="text-xs text-slate-500">
                    ตั้งค่าหรือแก้ไขข้อความที่แจ้งเตือนแบบ Pop-up ประชาสัมพันธ์ให้ผู้ใช้โรงพยาบาลเห็นเมื่อเข้าใช้งานระบบครั้งแรก
                  </p>
                </div>
              </div>

              {/* Form to configure message */}
              <form onSubmit={handleSaveNotification} className="space-y-4">
                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-black text-slate-800 block">เปิดใช้งานป๊อปอัปแจ้งเตือน (Enable Popup Notification)</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">เปิดหรือปิดการแสดงป๊อปอัปให้ผู้ใช้เมื่อเข้าชมหน้าหมวดหมู่โรงพยาบาล</span>
                  </div>
                  
                  {/* Styled toggle switch button with Status Badge */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${notificationFormEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-250'}`}>
                      {notificationFormEnabled ? 'เปิด (ON)' : 'ปิด (OFF)'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notificationFormEnabled}
                        onChange={(e) => setNotificationFormEnabled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-250 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-755">ข้อความประชาสัมพันธ์ที่แสดงใน Pop-up (Announcement Message)</label>
                  <textarea
                    rows={4}
                    value={notificationFormMessage}
                    onChange={(e) => setNotificationFormMessage(e.target.value)}
                    placeholder="พิมพ์ข้อความที่ต้องการแจ้งเตือนประชาสัมพันธ์ที่นี่..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-250 text-slate-850 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all font-semibold leading-relaxed"
                  />
                  <span className="text-[10px] text-slate-400 block pb-1 font-semibold">รองรับการเว้นบรรทัดและเขียนข้อความแบบอิสระ (Whitespace supported)</span>
                </div>

                {/* Submitting controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {notificationSaveStatus === 'success' && (
                      <motion.span 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs text-emerald-650 font-black flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> บันทึกและซิงค์ข้อมูลข้อความเรียบร้อย!
                      </motion.span>
                    )}
                    {notificationSaveStatus === 'error' && (
                      <span className="text-xs text-rose-650 font-black flex items-center gap-1">
                        ❌ บันทึกไม่สำเร็จ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
                      </span>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSavingNotification}
                    className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSavingNotification ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังดำเนินการบันทึก...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>อัปเดตประกาศ Pop-up</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          )}
        </section>

      </main>

      {/* ==================== 3. ADMIN AUTHORIZATION MODAL (3-STEP) ==================== */}
      <AnimatePresence>
        {showAdminAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/35 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 25 }}
              animate={adminAuthShaking ? { x: [-10, 10, -10, 10, 0], scale: 1, y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 25 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 relative overflow-hidden"
              transition={{ type: 'spring', damping: 22, stiffness: 280, x: { type: 'tween', ease: 'easeInOut', duration: 0.4 } }}
            >
              {/* Top accent border */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-[#002D62]" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4 font-sans">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-750" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    Admin Authenticator
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAdminAuthModal(false);
                    setAdminAuthStep(1);
                    setAdminAuthInput('');
                    setAdminAuthError('');
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress step dots */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={`w-10 h-2 rounded-full transition-all duration-300 ${adminAuthStep >= 1 ? 'bg-[#002D62]' : 'bg-slate-200'}`} />
                <div className={`w-10 h-2 rounded-full transition-all duration-300 ${adminAuthStep >= 2 ? 'bg-[#002D62]' : 'bg-slate-200'}`} />
                <div className={`w-10 h-2 rounded-full transition-all duration-300 ${adminAuthStep >= 3 ? 'bg-[#002D62]' : 'bg-slate-200'}`} />
              </div>

              <div className="text-center my-3 font-sans">
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-extrabold max-w-max inline-block mb-1.5">
                  🔑 สำหรับ ผู้ดูแลระบบ ({adminAuthStep}/3)
                </span>
                <div className="leading-relaxed px-1 font-bold">
                  {adminAuthStep === 1 && (
                    <span className="text-xs text-rose-600 block">สำหรับ admin เท่านั้น</span>
                  )}
                  {adminAuthStep === 2 && (
                    <span className="text-xs text-rose-600 block">สำหรับ admin เท่านั้นไง !!!!</span>
                  )}
                  {adminAuthStep === 3 && (
                    <span className="text-lg text-rose-600 font-extrabold block">ยังอีก !!!!</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-450 mt-1 font-semibold">
                  กรุณากรอกรหัสผ่านเพื่อยืนยันสิทธิ์เข้าใช้งานระบบแอดมิน
                </p>
              </div>

              {adminAuthError && (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-[11px] text-rose-700 text-center mb-4 flex items-center justify-center gap-1.5 font-sans font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <form 
                onSubmit={handleAdminAuthSubmit} 
                className="space-y-4 font-sans"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-center">
                    {adminAuthStep === 1 && 'ป้อนรหัสผ่านสำหรับ Admin ขั้นที่ 1'}
                    {adminAuthStep === 2 && 'ป้อนรหัสผ่านสำหรับ Admin ขั้นที่ 2'}
                    {adminAuthStep === 3 && 'ป้อนรหัสผ่านสำหรับ Admin ขั้นที่ 3'}
                  </label>
                  
                  <input 
                    type="password"
                    autoFocus
                    required
                    value={adminAuthInput}
                    onChange={(e) => setAdminAuthInput(e.target.value)}
                    placeholder="ป้อนรหัสผ่าน"
                    className="w-full text-center p-2.5 bg-slate-50 border border-slate-205 text-slate-800 rounded-xl focus:ring-2 focus:ring-blue-105 outline-none text-sm font-mono font-bold"
                  />
                </div>
                
                <div className="flex gap-2 font-sans pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-[#002D62] hover:bg-[#002D62]/90 text-white rounded-xl text-xs font-black cursor-pointer transition-all animate-pulse"
                  >
                    ยืนยัน (Confirm Step {adminAuthStep})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminAuthModal(false);
                      setAdminAuthStep(1);
                      setAdminAuthInput('');
                      setAdminAuthError('');
                    }}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-200"
                  >
                    ยกเลิก (Cancel)
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* ==================== 4. DYNAMIC PORTAL ACCORDION EDITOR MODAL ==================== */}
      <AnimatePresence>
        {isAdminMode && editingId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/35 flex items-center justify-center p-4 z-[110] backdrop-blur-sm"
            onClick={() => setEditingId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 25 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-150 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
                    <Edit className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight font-sans block">
                      {editingId === 'NEW' ? 'เพิ่มแอปพลิเคชันเชื่อมโยงยา' : 'ปรับแต่งแก้ไขปุ่มทางด่วน'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">BPH AppPortal Configurator</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditingId(null)} 
                  className="text-slate-400 hover:text-slate-650 cursor-pointer p-2 min-w-[44px] min-h-[44px] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center justify-center"
                  aria-label="ปิดหน้าต่างแก้ไข"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="button-settings-form" onSubmit={(e) => { handleSaveChanges(e); setEditingId(null); }} className="space-y-4">
                
                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 font-sans">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">วัตถุประสงค์สัจจะของปุ่ม (Button Name)</label>
                    <input 
                      type="text" 
                      value={formName} 
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="ระบบดึงฉลากยา" 
                      className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium font-sans animate-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ที่อยู่เว็บไซต์เชื่อมต่อ (Target URL)</label>
                    <input 
                      type="url" 
                      value={formUrl} 
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="https://service.bph.net" 
                      className="w-full p-2 bg-white border border-slate-250 text-blue-600 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Description Box */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">คำระบุบทบาทการเข้าถึง (Short Description)</label>
                  <textarea 
                    value={formDescription} 
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="ระบุวัตถุประสงค์งานระบบความปลอดภัยย่อย..." 
                    className="w-full p-2 bg-white border border-slate-250 text-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none font-sans"
                    rows={2}
                  />
                </div>

                {/* Category & Size Selection Grid */}
                <div className="space-y-1 relative" id="category-picker-wrapper font-sans">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">หมวดสิทธิ์สมาพันธ์ (Category - เลือกได้มากกว่า 1)</label>
                  <div className="relative">
                    <input 
                      type="text"
                      readOnly
                      value={formCategory}
                      placeholder="คลิกเพื่อเลือกหมวดหมู่..."
                      className="w-full p-2 pr-8 bg-slate-50 border border-slate-250 text-slate-800 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium cursor-pointer"
                      onFocus={() => setShowCategoryDropdown(true)}
                      onClick={() => setShowCategoryDropdown(prev => !prev)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(prev => !prev)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {showCategoryDropdown && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      {categoriesList.map((cat) => {
                        const isSelected = formCategory.split(',').map(c => c.trim().toLowerCase()).includes(cat.toLowerCase());
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleFormCategory(cat)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                              isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span>{cat}</span>
                            {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                          </button>
                        );
                      })}
                      {dynamicCategories.filter(cat => cat !== 'All' && !categoriesList.some(cl => cl.toLowerCase() === cat.toLowerCase())).map((cat) => {
                        const isSelected = formCategory.split(',').map(c => c.trim().toLowerCase()).includes(cat.toLowerCase());
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleFormCategory(cat)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                              isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-705'
                            }`}
                          >
                            <span>{cat}</span>
                            {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Short pills suggestions list for instant choice selection */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {categoriesList.map((cat) => {
                      const isSelected = formCategory.split(',').map(c => c.trim().toLowerCase()).includes(cat.toLowerCase());
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => toggleFormCategory(cat)}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200 text-blue-750 font-extrabold shadow-xs' 
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-805'
                          }`}
                        >
                          {isSelected ? `✓ ${cat}` : cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ขนาดบอร์ดปุ่มลัด (Size)</label>
                  <select 
                    value={formSize} 
                    onChange={(e) => setFormSize(e.target.value as ButtonSize)}
                    className="w-full p-2 bg-white border border-slate-250 text-slate-750 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
                  >
                    <option value="small">เล็ก (Small)</option>
                    <option value="medium">ปกติ (Medium)</option>
                    <option value="large">กว้าง (Large)</option>
                    <option value="xl">ใหญ่พิเศษ (X-Large)</option>
                  </select>
                </div>

                {/* Color Preset Config */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ปรับแต่งเฉดสีสัญลักษณ์ย่อย (Color Preset Style)</label>
                  <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected = formColor === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormColor(preset.id)}
                          className={`flex flex-col items-center justify-center p-1 border rounded-lg transition-all text-center cursor-pointer ${
                            isSelected 
                              ? 'bg-white border-blue-500 ring-2 ring-blue-100 text-blue-700 font-bold' 
                              : 'bg-transparent border-transparent hover:bg-white text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${preset.bgClass} inline-block mb-1 border border-slate-200`}></span>
                          <span className="text-[8px] font-mono tracking-tight truncate w-full">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Emoji Symbols Picker */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ภาพไอคอนปุ่มหลัก (Emoji)</label>
                    <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold">{formIcon}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1 p-1.5 bg-slate-50 border border-slate-200 rounded-lg max-h-20 overflow-y-auto">
                    {EMOJI_PICKER.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormIcon(emoji)}
                        className={`p-1 hover:bg-white text-xs rounded transition-colors cursor-pointer text-center ${
                          formIcon === emoji ? 'bg-white font-bold border border-blue-300 ring-2 ring-blue-50' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Switch */}
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="form-is-priority" 
                    checked={formIsPriority} 
                    onChange={(e) => setFormIsPriority(e.target.checked)}
                    className="w-4 h-4 text-blue-650 bg-white border-slate-350 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="form-is-priority" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    ปักหมุดเร่งด่วนพิเศษ (Hospital Priority)
                  </label>
                </div>

                {/* Saves & Deletes Actions */}
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <Check className="w-3.5 h-3.5" />
                    บันทึกตั้งค่าปุ่ม
                  </button>
                  {editingId !== 'NEW' && (
                    <button 
                      type="button" 
                      onClick={() => { handleDeleteButton(editingId); }}
                      className="py-2 px-4 border border-red-200 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors"
                      title="ลบปุ่มนี้ถาวร"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== SYSTEM REDIRECTION MODAL ==================== */}
      <AnimatePresence>
        {activeRoutingApp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/35 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 25 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 relative overflow-hidden font-sans text-center"
            >
              {/* Top accent line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600 animate-pulse" />
              
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <ExternalLink className="w-6 h-6" />
              </div>

              <h3 className="text-sm font-black text-slate-800 tracking-tight">
                กำลังเปลี่ยนเส้นทางความปลอดภัย
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-bold">
                เพื่อความปลอดภัยของระบบ กำลังเปิดลิงก์ {activeRoutingApp.name} ในหน้าต่างใหม่...
              </p>

              {/* Progress Bar Animation */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-6 mb-2 border border-slate-200/60 font-sans">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  className="bg-indigo-600 h-full rounded-full"
                  transition={{ duration: 0.65 }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                BPH SECURE ENVELOPE GATEWAY
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding of Bangkok Hospital */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 w-full">
        <div className="px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 self-start md:self-auto">
            <BangkokHospitalLogo className="scale-90 origin-left opacity-90" />
          </div>
          <div className="text-left md:text-right w-full md:w-auto">
            <div className="text-slate-600 text-[11px] font-bold font-sans">
              ระบบสนับสนุนการเข้าถึงเอกสาร ข้อมูล เว็บไซต์ แผนกเภสัชกรรม โรงพยาบาลกรุงเทพพัทยา | ภก.ชนัญญู ร.
            </div>
            <div className="text-slate-400 text-[9px] font-mono mt-1 uppercase tracking-wider">
              INTERNAL OPERATIONS GATEWAY PLATFORM &copy; 2026. ALL RIGHTS RESERVED. SECURED INTERNAL CLINICAL NETWORK.
            </div>
          </div>
        </div>
      </footer>

      {/* ==================== CUSTOM IN-APP CONFIRMATION MODAL (portal — อยู่เหนือ modal แก้ไข) ==================== */}
      {confirmConfig?.isOpen && createPortal(
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm"
            id="custom-confirm-overlay"
            onClick={() => setConfirmConfig(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 25 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-200 relative overflow-hidden"
              id="custom-confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`absolute top-0 inset-x-0 h-1.5 ${
                confirmConfig.type === 'danger' ? 'bg-rose-500' :
                confirmConfig.type === 'warning' ? 'bg-amber-500' : 'bg-blue-650'
              }`} />
              
              <div className="flex gap-4 items-start mt-2">
                <div className={`p-3 rounded-2xl shrink-0 flex items-center justify-center border ${
                  confirmConfig.type === 'danger' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  confirmConfig.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {confirmConfig.type === 'danger' ? (
                    <Trash2 className="w-5 h-5" />
                  ) : confirmConfig.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug font-sans">
                    {confirmConfig.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
                    {confirmConfig.message}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6 justify-end">
                <button
                  type="button"
                  id="confirm-cancel-btn"
                  onClick={() => setConfirmConfig(null)}
                  className="py-2 px-4 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black cursor-pointer transition-colors border border-slate-200"
                >
                  {confirmConfig.cancelText}
                </button>
                <button
                  type="button"
                  id="confirm-ok-btn"
                  onClick={() => {
                    confirmConfig.onConfirm();
                    setConfirmConfig(null);
                  }}
                  className={`py-2 px-4 min-h-[44px] text-white rounded-xl text-xs font-black cursor-pointer transition-all shadow-sm ${
                    confirmConfig.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' :
                    confirmConfig.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' :
                    'bg-blue-600 hover:bg-blue-750 shadow-blue-100'
                  }`}
                >
                  {confirmConfig.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}

      {/* ==================== 5. POPUP NOTIFICATION MODAL (For general users on visit) ==================== */}
      <AnimatePresence>
        {isNotificationPopupOpen && notification.enabled && notification.message && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/35 flex items-center justify-center p-4 z-[120] backdrop-blur-sm"
            id="popup-notification-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 25 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 relative overflow-hidden font-sans"
              id="popup-notification-modal"
            >
              {/* Colored top indicator line */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-505" />
              
              {/* Content Header */}
              <div className="flex items-start gap-4 mt-2">
                <div className="p-3 bg-blue-50 text-[#002D62] rounded-2xl border border-blue-100 shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    📢 ประกาศสำนักงาน / ประชาสัมพันธ์
                  </h3>
                  <p className="text-xs text-slate-400 font-bold font-mono uppercase tracking-wider mt-0.5">
                    Official Department Announcement
                  </p>
                </div>
              </div>

              {/* Message Body */}
              <div className="mt-5 p-4 bg-slate-50 border border-slate-150 rounded-2xl max-h-[250px] overflow-y-auto">
                <p className="text-slate-800 text-sm font-semibold leading-relaxed whitespace-pre-wrap select-text">
                  {notification.message}
                </p>
              </div>

              {/* Close Button container */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseNotificationPopup}
                  className="w-full sm:w-auto px-6 py-3 bg-[#002D62] text-white hover:bg-[#001D42] text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer text-center"
                >
                  รับทราบข้อความ (Dismiss)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
