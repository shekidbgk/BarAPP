import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  CheckSquare,
  ShoppingBag,
  Boxes,
  Settings,
  Bell,
  MapPin,
  Pin,
  PinOff,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  LogOut,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Clock,
  MessageSquare,
  Camera,
  Smartphone,
  Maximize2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Store,
  Flame,
  Coffee,
  UtensilsCrossed,
  Layers,
  ArrowRight
} from 'lucide-react';

import {
  User,
  UserRole,
  ZoneType,
  ChecklistType,
  Checklist,
  ChecklistSubItem,
  ChecklistGroup,
  Task,
  SupplyOrder,
  StockItem,
  AppNotification,
} from './types';

import {
  DEMO_USERS,
  INITIAL_CHECKLISTS,
  INITIAL_TASKS,
  INITIAL_ORDERS,
  INITIAL_STOCK,
  INITIAL_NOTIFICATIONS,
  POINTS,
} from './mockData';

type TabType = 'checklists' | 'tasks' | 'orders' | 'stock' | 'settings';

export default function App() {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('barops_user');
    return saved ? JSON.parse(saved) : DEMO_USERS['Бармен'];
  });

  const [activePoint, setActivePoint] = useState<string>(() => {
    return localStorage.getItem('barops_point') || 'Бар Центр';
  });

  const [activeTab, setActiveTab] = useState<TabType>('checklists');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // App data state with local storage persistence
  const [checklists, setChecklists] = useState<Checklist[]>(() => {
    const saved = localStorage.getItem('barops_checklists');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLISTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('barops_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [orders, setOrders] = useState<SupplyOrder[]>(() => {
    const saved = localStorage.getItem('barops_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem('barops_stock');
    return saved ? JSON.parse(saved) : INITIAL_STOCK;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('barops_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // UI Modals & Panels
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Note Modal state for Checklist items
  const [activeNoteItem, setActiveNoteItem] = useState<{
    checklistId: string;
    groupId?: string;
    itemId: string;
    title: string;
    currentNote?: string;
  } | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');
  const [hasPhotoAttached, setHasPhotoAttached] = useState(false);

  // Expanded Checklists state (accordion)
  const [expandedChecklistIds, setExpandedChecklistIds] = useState<Record<string, boolean>>({
    'chk-1': true,
    'chk-2': true,
  });

  // Expanded Groups inside Compound checklists
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'g1': true,
    'g2': true,
    'g3': false,
  });

  // Filter states
  const [zoneFilter, setZoneFilter] = useState<'Все' | ZoneType>('Все');
  const [typeFilter, setTypeFilter] = useState<'Все' | ChecklistType>('Все');
  const [taskFilter, setTaskFilter] = useState<'Все' | 'К выполнению' | 'В работе' | 'Выполнено'>('Все');
  const [stockSearch, setStockSearch] = useState('');

  // Login Form States (when logged out)
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
  const [inputOrgCode, setInputOrgCode] = useState('BAR-770');
  const [inputLogin, setInputLogin] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [regOrgName, setRegOrgName] = useState('');
  const [regOrgCode, setRegOrgCode] = useState('BAR-');
  const [regAdminName, setRegAdminName] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Persist key state
  useEffect(() => {
    localStorage.setItem('barops_checklists', JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem('barops_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('barops_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('barops_stock', JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('barops_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('barops_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('barops_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('barops_point', activePoint);
  }, [activePoint]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Helper for Role color and icon
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Администратор':
        return { bg: 'bg-purple-950/80 border-purple-500/40 text-purple-300', dot: 'bg-purple-400' };
      case 'Старший бармен':
      case 'Бармен':
        return { bg: 'bg-amber-950/80 border-amber-500/40 text-amber-300', dot: 'bg-amber-400' };
      case 'Старший повар':
      case 'Повар':
        return { bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300', dot: 'bg-emerald-400' };
      case 'Официант':
        return { bg: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300', dot: 'bg-cyan-400' };
    }
  };

  // Quick Demo Login for the 6 roles
  const handleQuickDemoLogin = (role: UserRole) => {
    const user = DEMO_USERS[role];
    setCurrentUser(user);
    showToast(`Вход выполнен: ${user.name} (${role})`);
  };

  // Standard Login
  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!inputOrgCode.trim() || !inputLogin.trim() || !inputPassword.trim()) {
      setLoginError('Пожалуйста, заполните все 3 обязательных поля.');
      return;
    }

    // Match with existing demo users or create custom user
    const matchedRole = (Object.keys(DEMO_USERS) as UserRole[]).find(
      (r) => DEMO_USERS[r].login.toLowerCase() === inputLogin.trim().toLowerCase()
    );

    if (matchedRole) {
      const u = { ...DEMO_USERS[matchedRole], establishmentCode: inputOrgCode.trim().toUpperCase() };
      setCurrentUser(u);
      showToast(`Добро пожаловать, ${u.name}!`);
    } else {
      // Default to custom Barman or Admin
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: inputLogin,
        login: inputLogin,
        role: 'Бармен',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        establishmentCode: inputOrgCode.trim().toUpperCase(),
        assignedPoint: activePoint,
      };
      setCurrentUser(newUser);
      showToast(`Добро пожаловать в ${inputOrgCode.trim().toUpperCase()}!`);
    }
  };

  // Register New Establishment
  const handleRegisterEstablishment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOrgName.trim() || !regOrgCode.trim() || !regAdminName.trim() || !regPassword.trim()) {
      setLoginError('Заполните обязательные поля для регистрации заведения.');
      return;
    }

    const code = regOrgCode.trim().toUpperCase();
    const newUser: User = {
      id: `u-admin-${Date.now()}`,
      name: regAdminName.trim(),
      login: 'admin',
      role: 'Администратор',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      establishmentCode: code,
      assignedPoint: 'Бар Центр',
    };

    setCurrentUser(newUser);
    showToast(`Заведение «${regOrgName}» (${code}) успешно создано! Вы вошли как Администратор.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Вы вышли из системы');
  };

  // Toggle Checklist Pin
  const togglePinChecklist = (checklistId: string) => {
    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id === checklistId) {
          const next = !c.isPinned;
          showToast(next ? '📌 Чек-лист закреплен сверху' : 'Булавка снята');
          return { ...c, isPinned: next };
        }
        return c;
      })
    );
  };

  // Toggle Item Completion in Simple Checklist
  const toggleSimpleItem = (checklistId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id !== checklistId || !c.items) return c;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const updatedItems = c.items.map((item) => {
          if (item.id === itemId) {
            const nextCompleted = !item.completed;
            return {
              ...item,
              completed: nextCompleted,
              completedBy: nextCompleted ? (currentUser?.name || 'Сотрудник') : undefined,
              completedAt: nextCompleted ? timeStr : undefined,
            };
          }
          return item;
        });

        return { ...c, items: updatedItems, updatedAt: `Сегодня, ${timeStr}` };
      })
    );
  };

  // Toggle Group Item in Compound Checklist
  const toggleCompoundItem = (checklistId: string, groupId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id !== checklistId || !c.groups) return c;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const updatedGroups = c.groups.map((group) => {
          if (group.id !== groupId) return group;
          const updatedItems = group.items.map((item) => {
            if (item.id === itemId) {
              const nextCompleted = !item.completed;
              return {
                ...item,
                completed: nextCompleted,
                completedBy: nextCompleted ? (currentUser?.name || 'Сотрудник') : undefined,
                completedAt: nextCompleted ? timeStr : undefined,
              };
            }
            return item;
          });
          return { ...group, items: updatedItems };
        });

        return { ...c, groups: updatedGroups, updatedAt: `Сегодня, ${timeStr}` };
      })
    );
  };

  // Reset Checklist (clear all checks for new shift)
  const resetChecklist = (checklistId: string) => {
    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id !== checklistId) return c;
        if (c.items) {
          return {
            ...c,
            updatedAt: 'Только что сброшено',
            items: c.items.map((it) => ({ ...it, completed: false, completedBy: undefined, completedAt: undefined })),
          };
        }
        if (c.groups) {
          return {
            ...c,
            updatedAt: 'Только что сброшено',
            groups: c.groups.map((grp) => ({
              ...grp,
              items: grp.items.map((it) => ({ ...it, completed: false, completedBy: undefined, completedAt: undefined })),
            })),
          };
        }
        return c;
      })
    );
    showToast('Смена сброшена: чек-лист готов к заполнению заново');
  };

  // Complete All Items in Checklist
  const completeAllChecklist = (checklistId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const author = currentUser?.name || 'Сотрудник';

    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id !== checklistId) return c;
        if (c.items) {
          return {
            ...c,
            updatedAt: `Сегодня, ${timeStr}`,
            items: c.items.map((it) => ({ ...it, completed: true, completedBy: author, completedAt: timeStr })),
          };
        }
        if (c.groups) {
          return {
            ...c,
            updatedAt: `Сегодня, ${timeStr}`,
            groups: c.groups.map((grp) => ({
              ...grp,
              items: grp.items.map((it) => ({ ...it, completed: true, completedBy: author, completedAt: timeStr })),
            })),
          };
        }
        return c;
      })
    );
    showToast('Все пункты отмечены как выполненные!');
  };

  // Save Note for Checklist Item
  const handleSaveNote = () => {
    if (!activeNoteItem) return;
    const { checklistId, groupId, itemId } = activeNoteItem;
    const noteText = tempNoteText.trim() + (hasPhotoAttached ? ' 📷 [Фото-фиксация прикреплена]' : '');

    setChecklists((prev) =>
      prev.map((c) => {
        if (c.id !== checklistId) return c;
        if (c.items) {
          return {
            ...c,
            items: c.items.map((it) => (it.id === itemId ? { ...it, note: noteText || undefined } : it)),
          };
        }
        if (c.groups && groupId) {
          return {
            ...c,
            groups: c.groups.map((grp) => {
              if (grp.id !== groupId) return grp;
              return {
                ...grp,
                items: grp.items.map((it) => (it.id === itemId ? { ...it, note: noteText || undefined } : it)),
              };
            }),
          };
        }
        return c;
      })
    );

    setActiveNoteItem(null);
    setTempNoteText('');
    setHasPhotoAttached(false);
    showToast('Примечание сохранено');
  };

  // Calculate Checklist Progress
  const getChecklistStats = (c: Checklist) => {
    let total = 0;
    let completed = 0;

    if (c.items) {
      total = c.items.length;
      completed = c.items.filter((it) => it.completed).length;
    } else if (c.groups) {
      c.groups.forEach((grp) => {
        total += grp.items.length;
        completed += grp.items.filter((it) => it.completed).length;
      });
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  // Filtered Checklists
  const filteredChecklists = useMemo(() => {
    return checklists.filter((c) => {
      if (zoneFilter !== 'Все' && c.zone !== zoneFilter) return false;
      if (typeFilter !== 'Все' && c.type !== typeFilter) return false;
      return true;
    });
  }, [checklists, zoneFilter, typeFilter]);

  // Pinned vs Regular Checklists
  const pinnedChecklists = useMemo(() => {
    return filteredChecklists.filter((c) => c.isPinned);
  }, [filteredChecklists]);

  const regularChecklists = useMemo(() => {
    return filteredChecklists.filter((c) => !c.isPinned);
  }, [filteredChecklists]);

  // Task actions
  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        let nextStatus: Task['status'] = 'В работе';
        if (t.status === 'К выполнению') nextStatus = 'В работе';
        else if (t.status === 'В работе') nextStatus = 'Выполнено';
        else nextStatus = 'К выполнению';
        return { ...t, status: nextStatus };
      })
    );
  };

  // Stock actions
  const adjustStockQty = (itemId: string, delta: number) => {
    setStock((prev) =>
      prev.map((st) => {
        if (st.id !== itemId) return st;
        const nextQty = Math.max(0, parseFloat((st.currentQty + delta).toFixed(1)));
        return { ...st, currentQty: nextQty, lastChecked: 'Только что' };
      })
    );
  };

  // Unread count
  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAllNotifs = () => {
    setNotifications([]);
  };

  const addTestNotif = () => {
    const newN: AppNotification = {
      id: `n-${Date.now()}`,
      title: 'Оперативный алертинг смены',
      text: `Барная станция: проверка льдогенератора выполнена (${currentUser?.name})`,
      time: 'Только что',
      unread: true,
      type: 'info',
    };
    setNotifications((prev) => [newN, ...prev]);
    showToast('Уведомление добавлено');
  };

  // If NOT logged in: Show Login / Register Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-black">
        {/* Glow Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Card */}
        <div className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-zinc-950 shadow-lg shadow-amber-500/20 mb-3 font-black text-2xl tracking-tighter">
              B
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              BarOps <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">v2.4</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Мобильная операционная система бара и кухни
            </p>
          </div>

          {/* Form Tabs: Вход vs Регистрация */}
          <div className="flex p-1 bg-zinc-950 rounded-xl mb-5 border border-zinc-800/80">
            <button
              onClick={() => { setLoginTab('login'); setLoginError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                loginTab === 'login'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Вход персонала
            </button>
            <button
              onClick={() => { setLoginTab('register'); setLoginError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                loginTab === 'register'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Регистрация заведения
            </button>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* TAB 1: 3-Field Login */}
          {loginTab === 'login' ? (
            <form onSubmit={handleStandardLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  1. Код заведения
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={inputOrgCode}
                    onChange={(e) => setInputOrgCode(e.target.value)}
                    placeholder="Например: BAR-770"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 uppercase tracking-wider font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  2. Логин сотрудника
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={inputLogin}
                    onChange={(e) => setInputLogin(e.target.value)}
                    placeholder="admin, bar_lead, barmen_1..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  3. Пароль
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Войти в BarOps
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* TAB 2: Register New Establishment */
            <form onSubmit={handleRegisterEstablishment} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Название бара / заведения *</label>
                <input
                  type="text"
                  required
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  placeholder="The Tipsy Craft Bar"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Код точки *</label>
                  <input
                    type="text"
                    required
                    value={regOrgCode}
                    onChange={(e) => setRegOrgCode(e.target.value)}
                    placeholder="BAR-990"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white placeholder-zinc-600 uppercase font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Город</label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Санкт-Петербург"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">ФИО Управляющего / Владельца *</label>
                <input
                  type="text"
                  required
                  value={regAdminName}
                  onChange={(e) => setRegAdminName(e.target.value)}
                  placeholder="Михаил Романов"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Телефон / Email</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Пароль Админа *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Зарегистрировать заведение и начать
              </button>
            </form>
          )}

          {/* QUICK DEMO LOGIN (6 ROLES) */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Быстрый демо-вход (1 клик)
              </span>
              <span className="text-[10px] text-zinc-500">6 ролей</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((role) => {
                const u = DEMO_USERS[role];
                const badge = getRoleBadge(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickDemoLogin(role)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/60 transition-all text-left group cursor-pointer"
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-8 h-8 rounded-lg object-cover border border-zinc-700/60 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 truncate">
                        {role}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {u.name.split(' ')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active User Roles helper
  const roleBadge = getRoleBadge(currentUser.role);
  const isAdmin = currentUser.role === 'Администратор';

  return (
    <div
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-black ${
        isMobileFrame ? 'items-center justify-center p-0 md:p-6 bg-zinc-900/40' : ''
      }`}
    >
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 text-white border border-amber-500/40 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container - either standard full-screen or simulated mobile frame */}
      <div
        className={`w-full flex-1 flex flex-col bg-zinc-950 transition-all ${
          isMobileFrame
            ? 'max-w-md h-[92vh] max-h-[880px] rounded-[40px] border-4 border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative'
            : 'max-w-3xl mx-auto border-x border-zinc-800/60 shadow-xl'
        }`}
      >
        {/* =========================================================================
            HEADER (ШАПКА): Выбор точки («Бар Центр», «Бар Север»), Роль, Колокольчик
        ========================================================================= */}
        <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Point Selector */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 font-black text-sm shrink-0 shadow-md shadow-amber-500/20">
                B
              </div>
              <div className="relative">
                <div className="flex items-center gap-1.5 cursor-pointer bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 py-1 px-2.5 rounded-xl transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <select
                    value={activePoint}
                    onChange={(e) => {
                      setActivePoint(e.target.value);
                      showToast(`Точка изменена: ${e.target.value}`);
                    }}
                    className="bg-transparent text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer appearance-none pr-3"
                  >
                    {POINTS.map((pt) => (
                      <option key={pt} value={pt} className="bg-zinc-900 text-white">
                        {pt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none -ml-2" />
                </div>
              </div>
            </div>

            {/* Right Header Area: Role badge + Notification Bell */}
            <div className="flex items-center gap-2">
              {/* Role Badge & Switcher Trigger */}
              <button
                type="button"
                onClick={() => setShowRoleSwitcher(true)}
                title="Нажмите для быстрой смены роли"
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${roleBadge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${roleBadge.dot} animate-pulse`} />
                <span className="truncate max-w-[100px]">{currentUser.role}</span>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifPanel(!showNotifPanel)}
                  className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors relative cursor-pointer"
                  title="Уведомления смены"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-zinc-950">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifPanel && (
                  <div className="absolute right-0 top-10 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white">Уведомления смены</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadNotifCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotifsRead}
                            className="text-[10px] text-amber-400 hover:underline"
                          >
                            Прочитать
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowNotifPanel(false)}
                          className="text-zinc-400 hover:text-zinc-200 text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-xs text-zinc-500">
                          Нет новых уведомлений
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl border text-xs transition-colors ${
                              n.unread
                                ? 'bg-zinc-800/70 border-amber-500/30'
                                : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className="font-semibold text-white flex items-center gap-1">
                                {n.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                                {n.type === 'info' && <Bell className="w-3.5 h-3.5 text-blue-400" />}
                                {n.type === 'success' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                {n.title}
                              </span>
                              <span className="text-[10px] text-zinc-500 shrink-0">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{n.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={addTestNotif}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Тестовый алерт
                      </button>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAllNotifs}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          Очистить
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle mobile view simulation */}
              <button
                type="button"
                onClick={() => setIsMobileFrame(!isMobileFrame)}
                className="hidden md:flex w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 items-center justify-center text-zinc-400 hover:text-white transition-colors"
                title={isMobileFrame ? 'Развернуть на весь экран' : 'Переключить в мобильный фрейм'}
              >
                {isMobileFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* =========================================================================
            MAIN CONTENT AREA: 5 TABS
        ========================================================================= */}
        <main className="flex-1 overflow-y-auto pb-20 p-4 space-y-4">
          {/* TAB 1: ЧЕК-ЛИСТЫ (ПОЛНОСТЬЮ РАБОЧАЯ С ВЫБОРОМ ЗОН И ЗАКРЕПЛЕНИЕМ) */}
          {activeTab === 'checklists' && (
            <div className="space-y-4">
              {/* Header stats & Quick actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-amber-400" />
                    Чек-листы смены
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {activePoint} • Контроль стандартов бара, кухни и сервиса
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddChecklistModal(true)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Новый чек-лист
                </button>
              </div>

              {/* Zone Filter (Бар / Кухня / Зал) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <span className="text-[11px] text-zinc-500 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Зона:
                  </span>
                  {(['Все', 'Бар', 'Кухня', 'Зал'] as const).map((z) => (
                    <button
                      key={z}
                      onClick={() => setZoneFilter(z)}
                      className={`py-1 px-3 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
                        zoneFilter === z
                          ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {z === 'Бар' && '🍸 '}
                      {z === 'Кухня' && '👨‍🍳 '}
                      {z === 'Зал' && '🤵 '}
                      {z}
                    </button>
                  ))}
                </div>

                {/* Type Filter (Утренний / Вечерний / Составной) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  <span className="text-[11px] text-zinc-500 mr-1 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Тип:
                  </span>
                  {(['Все', 'Утренний', 'Вечерний', 'Составной'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`py-1 px-2.5 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                        typeFilter === t
                          ? 'bg-zinc-200 text-zinc-950 font-semibold'
                          : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {t === 'Утренний' && '🌅 '}
                      {t === 'Вечерний' && '🌙 '}
                      {t === 'Составной' && '🧩 '}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* -------------------------------------------------------------
                  SECTION 1: PINNED CHECKLISTS (ЗАКРЕПЛЕННЫЕ БУЛАВКОЙ СВЕРХУ)
              ------------------------------------------------------------- */}
              {pinnedChecklists.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5 rotate-45" />
                      Закрепленные сверху ({pinnedChecklists.length})
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">Приоритет смены</span>
                  </div>

                  <div className="space-y-3">
                    {pinnedChecklists.map((c) => renderChecklistCard(c, true))}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------------
                  SECTION 2: ALL / REGULAR CHECKLISTS
              ------------------------------------------------------------- */}
              <div className="space-y-3 pt-2">
                {pinnedChecklists.length > 0 && (
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Остальные чек-листы ({regularChecklists.length})</span>
                  </div>
                )}

                {regularChecklists.length === 0 && pinnedChecklists.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-3xl bg-zinc-900/40 border border-zinc-800/80">
                    <ClipboardCheck className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-zinc-300">Чек-листы не найдены</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Попробуйте сбросить фильтры зоны или создать новый чек-лист
                    </p>
                    <button
                      type="button"
                      onClick={() => { setZoneFilter('Все'); setTypeFilter('Все'); }}
                      className="mt-3 text-xs text-amber-400 hover:underline"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                ) : (
                  regularChecklists.map((c) => renderChecklistCard(c, false))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ЗАДАЧИ */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-amber-400" />
                    Задачи смены
                  </h2>
                  <p className="text-xs text-zinc-400">Поручения и оперативный таймлайн</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(true)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Поручение
                </button>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['Все', 'К выполнению', 'В работе', 'Выполнено'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTaskFilter(st)}
                    className={`py-1 px-3 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
                      taskFilter === st
                        ? 'bg-zinc-200 text-zinc-950 font-bold'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5">
                {tasks
                  .filter((t) => taskFilter === 'Все' || t.status === taskFilter)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                              task.status === 'Выполнено'
                                ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                                : task.status === 'В работе'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                : 'border-zinc-700 bg-zinc-950/60'
                            }`}
                          >
                            {task.status === 'Выполнено' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            {task.status === 'В работе' && <Clock className="w-3 h-3" />}
                          </button>
                          <div>
                            <p
                              className={`text-xs font-semibold ${
                                task.status === 'Выполнено' ? 'line-through text-zinc-500' : 'text-zinc-100'
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                              <span>Зона: {task.zone}</span>
                              <span>•</span>
                              <span>Кому: {task.assigneeRole}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                            task.priority === 'Высокий'
                              ? 'bg-red-950/80 text-red-300 border border-red-500/30'
                              : task.priority === 'Средний'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-800/60 text-zinc-500">
                        <span>Дедлайн: <strong className="text-zinc-300">{task.deadline}</strong></span>
                        <button
                          type="button"
                          onClick={() => toggleTaskStatus(task.id)}
                          className="text-amber-400 hover:text-amber-300 font-medium"
                        >
                          Статус: {task.status} ➔
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: ЗАЯВКИ ПОСТАВЩИКАМ */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    Заявки поставщикам
                  </h2>
                  <p className="text-xs text-zinc-400">Алкоголь, продукты кухни и расходники</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(true)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Новая заявка
                </button>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400">{ord.code}</span>
                          <span className="text-xs text-zinc-400">• {ord.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">{ord.supplier}</h4>
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
                          ord.status === 'Принято'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : ord.status === 'В пути'
                            ? 'bg-blue-950 text-blue-300 border-blue-500/40 animate-pulse'
                            : ord.status === 'На согласовании'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 bg-zinc-950/70 p-2 rounded-xl border border-zinc-800/70 font-mono">
                      {ord.itemsSummary}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-zinc-400">
                        Сумма: <strong className="text-white font-bold">{ord.totalAmount.toLocaleString('ru-RU')} ₽</strong>
                      </span>
                      {ord.status !== 'Принято' && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrders((prev) =>
                              prev.map((o) =>
                                o.id === ord.id
                                  ? { ...o, status: o.status === 'На согласовании' ? 'В пути' : 'Принято' }
                                  : o
                              )
                            );
                            showToast('Статус заказа обновлен');
                          }}
                          className="py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-medium text-[11px] border border-zinc-700 transition-colors cursor-pointer"
                        >
                          {ord.status === 'На согласовании' ? 'Согласовать ➔ В путь' : 'Принять на склад ✔'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: СКЛАД И ОСТАТКИ */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-amber-400" />
                    Склад и остатки
                  </h2>
                  <p className="text-xs text-zinc-400">Быстрая инвентаризация и неснижаемый запас</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(true)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Позиция
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder="Поиск по названию или категории..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Stock Items Grid */}
              <div className="space-y-2.5">
                {stock
                  .filter((item) =>
                    item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
                    item.category.toLowerCase().includes(stockSearch.toLowerCase())
                  )
                  .map((item) => {
                    const isLow = item.currentQty <= item.minQty;
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl bg-zinc-900/90 border transition-all ${
                          isLow ? 'border-red-500/40 bg-red-950/10' : 'border-zinc-800/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                              {item.category}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-0.5">{item.name}</h4>
                          </div>
                          {isLow && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/40 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              Мало!
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60">
                          <div className="text-xs">
                            <span className="text-zinc-400">Остаток: </span>
                            <strong className={`font-mono text-sm ${isLow ? 'text-red-400' : 'text-amber-400'}`}>
                              {item.currentQty} {item.unit}
                            </strong>
                            <span className="text-zinc-500 text-[10px] ml-1.5">
                              (мин: {item.minQty} {item.unit})
                            </span>
                          </div>

                          {/* Quick adjust buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => adjustStockQty(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center text-xs active:scale-90"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustStockQty(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center text-xs active:scale-90"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 5: НАСТРОЙКИ (ДЛЯ АДМИНА) */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {!isAdmin ? (
                /* Access Restricted for Non-Admins */
                <div className="py-12 px-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Доступ ограничен</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Вкладка «Настройки» предназначена исключительно для роли <strong className="text-purple-300">Администратор</strong>. Текущая роль: {currentUser.role}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('Администратор')}
                    className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Переключиться на Администратора в 1 клик
                  </button>
                </div>
              ) : (
                /* Admin Settings Panel */
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-amber-400" />
                      Панель администратора
                    </h2>
                    <p className="text-xs text-zinc-400">Управление точками сети, штатом и интеграциями</p>
                  </div>

                  {/* Establishment Info Card */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Параметры заведения</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {currentUser.establishmentCode}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">Текущая точка:</span>
                        <strong className="text-white text-xs">{activePoint}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px]">Администратор:</span>
                        <strong className="text-white text-xs">{currentUser.name}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Quick Role Switcher for Testing */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                      Быстрое тестирование под другими ролями
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleQuickDemoLogin(r)}
                          className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all ${
                            currentUser.role === r
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* System Actions */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                      Сброс и восстановление
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setChecklists(INITIAL_CHECKLISTS);
                        setTasks(INITIAL_TASKS);
                        setOrders(INITIAL_ORDERS);
                        setStock(INITIAL_STOCK);
                        setNotifications(INITIAL_NOTIFICATIONS);
                        showToast('Данные сброшены до начальных эталонов');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      Сбросить данные к эталонным демо
                    </button>
                  </div>

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-3 px-4 rounded-2xl bg-red-950/60 hover:bg-red-950 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти из аккаунта BarOps
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* =========================================================================
            BOTTOM NAVIGATION (НИЖНЕЕ МЕНЮ НА 5 ВКЛАДОК)
        ========================================================================= */}
        <nav className="sticky bottom-0 z-30 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-2 shrink-0">
          <div className="grid grid-cols-5 gap-1">
            {/* Tab 1: Чек-листы */}
            <button
              type="button"
              onClick={() => setActiveTab('checklists')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                activeTab === 'checklists'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ClipboardCheck className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Чек-листы</span>
            </button>

            {/* Tab 2: Задачи */}
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <CheckSquare className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Задачи</span>
            </button>

            {/* Tab 3: Заявки */}
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Заявки</span>
            </button>

            {/* Tab 4: Склад */}
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                activeTab === 'stock'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Boxes className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold">Склад</span>
            </button>

            {/* Tab 5: Настройки (для Админа) */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Settings className="w-5 h-5 mb-0.5" />
                {!isAdmin && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-500" title="Требуются права админа" />
                )}
              </div>
              <span className="text-[10px] font-semibold flex items-center gap-0.5">
                Настройки
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* =========================================================================
          MODAL: ROLE SWITCHER POPUP
      ========================================================================= */}
      {showRoleSwitcher && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white">Смена роли сотрудника</h3>
                <p className="text-xs text-zinc-400">Быстрое переключение для тестирования</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleSwitcher(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => {
                const u = DEMO_USERS[r];
                const isCurrent = currentUser.role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      handleQuickDemoLogin(r);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{r}</span>
                        {isCurrent && <span className="text-[10px] text-amber-400 font-bold">Активен</span>}
                      </div>
                      <span className="text-[11px] text-zinc-400 block truncate">{u.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NOTE / PHOTO TO CHECKLIST ITEM
      ========================================================================= */}
      {activeNoteItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> Примечание к пункту
              </span>
              <button
                type="button"
                onClick={() => setActiveNoteItem(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 font-medium">{activeNoteItem.title}</p>

            <textarea
              rows={3}
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              placeholder="Введите комментарий или отчет смены..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />

            {/* Simulated photo attach */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setHasPhotoAttached(!hasPhotoAttached)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  hasPhotoAttached
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                {hasPhotoAttached ? '📷 Фото прикреплено' : 'Прикрепить фото-фиксацию'}
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveNoteItem(null)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW CHECKLIST
      ========================================================================= */}
      {showAddChecklistModal && (
        <CreateChecklistModal
          onClose={() => setShowAddChecklistModal(false)}
          activePoint={activePoint}
          currentUserRole={currentUser.role}
          onCreated={(newChecklist) => {
            setChecklists((prev) => [newChecklist, ...prev]);
            setShowAddChecklistModal(false);
            showToast(`Чек-лист «${newChecklist.title}» успешно создан!`);
          }}
        />
      )}

      {/* =========================================================================
          MODAL: ADD NEW TASK
      ========================================================================= */}
      {showAddTaskModal && (
        <CreateTaskModal
          onClose={() => setShowAddTaskModal(false)}
          activePoint={activePoint}
          currentUserName={currentUser.name}
          onCreated={(newTask) => {
            setTasks((prev) => [newTask, ...prev]);
            setShowAddTaskModal(false);
            showToast('Новая задача назначена');
          }}
        />
      )}

      {/* =========================================================================
          MODAL: ADD NEW ORDER
      ========================================================================= */}
      {showAddOrderModal && (
        <CreateOrderModal
          onClose={() => setShowAddOrderModal(false)}
          activePoint={activePoint}
          onCreated={(newOrder) => {
            setOrders((prev) => [newOrder, ...prev]);
            setShowAddOrderModal(false);
            showToast('Заявка поставщику сформирована');
          }}
        />
      )}

      {/* =========================================================================
          MODAL: ADD NEW STOCK ITEM
      ========================================================================= */}
      {showAddStockModal && (
        <CreateStockModal
          onClose={() => setShowAddStockModal(false)}
          activePoint={activePoint}
          onCreated={(newItem) => {
            setStock((prev) => [newItem, ...prev]);
            setShowAddStockModal(false);
            showToast(`Позиция «${newItem.name}» добавлена на склад`);
          }}
        />
      )}
    </div>
  );

  // Helper render method for a checklist card (Simple or Compound)
  function renderChecklistCard(c: Checklist, isPinnedSection: boolean) {
    const stats = getChecklistStats(c);
    const isExpanded = expandedChecklistIds[c.id] ?? false;

    return (
      <div
        key={c.id}
        className={`rounded-2xl transition-all border ${
          c.isPinned
            ? 'bg-zinc-900/95 border-amber-500/50 shadow-lg shadow-amber-500/5'
            : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
        }`}
      >
        {/* Header of Checklist card */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {/* Zone Badge */}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  {c.zone}
                </span>

                {/* Type Badge */}
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    c.type === 'Утренний'
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                      : c.type === 'Вечерний'
                      ? 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {c.type}
                </span>

                {c.isPinned && (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    <Pin className="w-3 h-3 fill-amber-400" /> Закреплен
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{c.title}</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{c.description}</p>
            </div>

            {/* Pin Toggle Button */}
            <button
              type="button"
              onClick={() => togglePinChecklist(c.id)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                c.isPinned
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              title={c.isPinned ? 'Открепить чек-лист' : 'Закрепить булавкой сверху'}
            >
              {c.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Progress Bar & Stats */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">
                Выполнено: <strong className="text-white">{stats.completed}</strong> из{' '}
                <strong className="text-white">{stats.total}</strong>
              </span>
              <span
                className={`font-mono font-bold ${
                  stats.percentage === 100
                    ? 'text-emerald-400'
                    : stats.percentage > 0
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }`}
              >
                {stats.percentage}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/60">
              <div
                className={`h-full transition-all duration-300 ${
                  stats.percentage === 100
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-amber-500 to-amber-300'
                }`}
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Card footer buttons: Toggle expand, Reset shift */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800/60 text-xs">
            <span className="text-[10px] text-zinc-500">{c.updatedAt}</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => resetChecklist(c.id)}
                className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                title="Очистить отметки для новой смены"
              >
                <RotateCcw className="w-3 h-3" />
                Сброс
              </button>

              <button
                type="button"
                onClick={() =>
                  setExpandedChecklistIds((prev) => ({ ...prev, [c.id]: !isExpanded }))
                }
                className="py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <>Свернуть <ChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>Открыть ({stats.total - stats.completed}) <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Items Section */}
        {isExpanded && (
          <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/60 space-y-3 bg-zinc-950/40">
            {/* Quick action: complete all */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => completeAllChecklist(c.id)}
                className="text-[10px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Отметить все выполненными
              </button>
            </div>

            {/* Standard Checklist Items */}
            {c.items && (
              <div className="space-y-2">
                {c.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      item.completed
                        ? 'bg-zinc-950/70 border-zinc-800/80'
                        : 'bg-zinc-900/90 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleSimpleItem(c.id, item.id)}
                        className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          item.completed
                            ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-sm shadow-emerald-500/30'
                            : 'border-zinc-700 bg-zinc-950 hover:border-amber-500'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs leading-snug cursor-pointer select-none ${
                            item.completed ? 'line-through text-zinc-500' : 'text-zinc-200 font-medium'
                          }`}
                          onClick={() => toggleSimpleItem(c.id, item.id)}
                        >
                          {item.title}
                        </p>

                        {/* Completed info & Notes */}
                        <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-500">
                          {item.completed && item.completedBy ? (
                            <span className="text-emerald-400/90 flex items-center gap-1">
                              ✓ {item.completedBy} • {item.completedAt}
                            </span>
                          ) : (
                            <span className="text-zinc-500">Не выполнено</span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveNoteItem({
                                checklistId: c.id,
                                itemId: item.id,
                                title: item.title,
                                currentNote: item.note,
                              });
                              setTempNoteText(item.note || '');
                            }}
                            className="text-amber-400/80 hover:text-amber-300 flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            {item.note ? 'Заметка (1)' : 'Заметка'}
                          </button>
                        </div>

                        {item.note && (
                          <div className="mt-1.5 p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-amber-300/90 font-mono">
                            {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Compound Checklist (Составной с вложенными подпунктами) */}
            {c.groups && (
              <div className="space-y-2.5">
                {c.groups.map((group) => {
                  const grpTotal = group.items.length;
                  const grpCompleted = group.items.filter((it) => it.completed).length;
                  const isGrpExpanded = expandedGroups[group.id] ?? true;

                  return (
                    <div
                      key={group.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden"
                    >
                      {/* Group Header */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGroups((prev) => ({ ...prev, [group.id]: !isGrpExpanded }))
                        }
                        className="w-full flex items-center justify-between p-2.5 bg-zinc-900/60 hover:bg-zinc-800/40 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-bold text-zinc-200">{group.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {grpCompleted}/{grpTotal}
                          </span>
                          {isGrpExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                        </div>
                      </button>

                      {/* Group Items */}
                      {isGrpExpanded && (
                        <div className="p-2 space-y-1.5 bg-zinc-950/60">
                          {group.items.map((subItem) => (
                            <div
                              key={subItem.id}
                              className={`p-2 rounded-lg border transition-all ${
                                subItem.completed
                                  ? 'bg-zinc-950 border-zinc-800/80'
                                  : 'bg-zinc-900/40 border-zinc-800'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleCompoundItem(c.id, group.id, subItem.id)}
                                  className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                    subItem.completed
                                      ? 'bg-emerald-500 border-emerald-400 text-zinc-950'
                                      : 'border-zinc-700 bg-zinc-950 hover:border-amber-500'
                                  }`}
                                >
                                  {subItem.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p
                                    onClick={() => toggleCompoundItem(c.id, group.id, subItem.id)}
                                    className={`text-[11px] leading-snug cursor-pointer select-none ${
                                      subItem.completed
                                        ? 'line-through text-zinc-500'
                                        : 'text-zinc-200'
                                    }`}
                                  >
                                    {subItem.title}
                                  </p>
                                  {subItem.completed && subItem.completedBy && (
                                    <span className="text-[9px] text-emerald-400/80 block mt-0.5">
                                      ✓ {subItem.completedBy}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

/* =========================================================================
   SUB-COMPONENT: CREATE CHECKLIST MODAL
========================================================================= */
function CreateChecklistModal({
  onClose,
  activePoint,
  currentUserRole,
  onCreated,
}: {
  onClose: () => void;
  activePoint: string;
  currentUserRole: UserRole;
  onCreated: (newChk: Checklist) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState<ZoneType>('Бар');
  const [type, setType] = useState<ChecklistType>('Утренний');
  const [itemsText, setItemsText] = useState(
    'Проверить чистоту станции\nВключить освещение и музыку\nСверить остатки перед открытием'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const items: ChecklistSubItem[] = itemsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((t, idx) => ({
        id: `ci-${Date.now()}-${idx}`,
        title: t,
        completed: false,
      }));

    const newChk: Checklist = {
      id: `chk-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Пользовательский чек-лист смены',
      zone,
      type,
      isPinned: false,
      pointId: activePoint,
      updatedAt: 'Только что создан',
      assignedRole: currentUserRole,
      items: items.length > 0 ? items : [{ id: '1', title: 'Основная проверка', completed: false }],
    };

    onCreated(newChk);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-white">Создать новый чек-лист</h3>
            <p className="text-xs text-zinc-400">Точка: {activePoint}</p>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Название чек-листа *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Закрытие летней террасы"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Описание / регламент</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткая инструкция для смены..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Зона заведения</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as ZoneType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Бар">🍸 Бар</option>
                <option value="Кухня">👨‍🍳 Кухня</option>
                <option value="Зал">🤵 Зал</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Тип чек-листа</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ChecklistType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Утренний">🌅 Утренний</option>
                <option value="Вечерний">🌙 Вечерний</option>
                <option value="Составной">🧩 Составной</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Пункты чек-листа (каждый пункт с новой строки)
            </label>
            <textarea
              rows={4}
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Создать чек-лист
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   SUB-COMPONENT: CREATE TASK MODAL
========================================================================= */
function CreateTaskModal({
  onClose,
  activePoint,
  currentUserName,
  onCreated,
}: {
  onClose: () => void;
  activePoint: string;
  currentUserName: string;
  onCreated: (t: Task) => void;
}) {
  const [title, setTitle] = useState('');
  const [zone, setZone] = useState<ZoneType>('Бар');
  const [priority, setPriority] = useState<Task['priority']>('Высокий');
  const [assigneeRole, setAssigneeRole] = useState<UserRole>('Бармен');
  const [deadline, setDeadline] = useState('До 17:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: title.trim(),
      zone,
      priority,
      status: 'К выполнению',
      assigneeRole,
      deadline,
      pointId: activePoint,
      createdByName: currentUserName,
    };

    onCreated(newTask);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white">Новое поручение смены</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Текст поручения *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Заготовить кордиал бузина-лайм"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Зона</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as ZoneType)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Бар">Бар</option>
                <option value="Кухня">Кухня</option>
                <option value="Зал">Зал</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Приоритет</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Высокий">Высокий</option>
                <option value="Средний">Средний</option>
                <option value="Низкий">Низкий</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Исполнитель</label>
              <select
                value={assigneeRole}
                onChange={(e) => setAssigneeRole(e.target.value as UserRole)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Бармен">Бармен</option>
                <option value="Старший бармен">Старший бармен</option>
                <option value="Повар">Повар</option>
                <option value="Старший повар">Старший повар</option>
                <option value="Официант">Официант</option>
                <option value="Администратор">Администратор</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Дедлайн</label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="До 18:00"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold cursor-pointer"
            >
              Назначить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   SUB-COMPONENT: CREATE ORDER MODAL
========================================================================= */
function CreateOrderModal({
  onClose,
  activePoint,
  onCreated,
}: {
  onClose: () => void;
  activePoint: string;
  onCreated: (ord: SupplyOrder) => void;
}) {
  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState<SupplyOrder['category']>('Алкоголь');
  const [itemsSummary, setItemsSummary] = useState('');
  const [amount, setAmount] = useState('25000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim() || !itemsSummary.trim()) return;

    const newOrder: SupplyOrder = {
      id: `ord-${Date.now()}`,
      code: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: supplier.trim(),
      category,
      itemsSummary: itemsSummary.trim(),
      totalAmount: parseInt(amount, 10) || 0,
      status: 'На согласовании',
      createdAt: 'Только что',
      pointId: activePoint,
    };

    onCreated(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white">Новая заявка поставщику</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Поставщик *</label>
            <input
              type="text"
              required
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Simple Wine, Волковская, HoReCa..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupplyOrder['category'])}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Алкоголь">Алкоголь</option>
                <option value="Безалкогольное">Безалкогольное</option>
                <option value="Кухня">Кухня</option>
                <option value="Хозтовары">Хозтовары</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Оценка суммы (₽)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Список позиций *</label>
            <textarea
              rows={3}
              required
              value={itemsSummary}
              onChange={(e) => setItemsSummary(e.target.value)}
              placeholder="Джин 6 бут, Тоник 24 бут, Сироп мята 2 бут..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold cursor-pointer"
            >
              Отправить заявку
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   SUB-COMPONENT: CREATE STOCK ITEM MODAL
========================================================================= */
function CreateStockModal({
  onClose,
  activePoint,
  onCreated,
}: {
  onClose: () => void;
  activePoint: string;
  onCreated: (item: StockItem) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StockItem['category']>('Крепкий алкоголь');
  const [qty, setQty] = useState('5');
  const [minQty, setMinQty] = useState('2');
  const [unit, setUnit] = useState('бут');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: StockItem = {
      id: `st-${Date.now()}`,
      name: name.trim(),
      category,
      currentQty: parseFloat(qty) || 0,
      minQty: parseFloat(minQty) || 0,
      unit,
      pointId: activePoint,
      pricePerUnit: 1500,
      lastChecked: 'Только что',
    };

    onCreated(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white">Добавить позицию на склад</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Наименование позиции *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Текила Espolon Blanco (0.75 л)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StockItem['category'])}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Крепкий алкоголь">Крепкий алкоголь</option>
              <option value="Пиво & Сидр">Пиво & Сидр</option>
              <option value="Сиропы & Кордиалы">Сиропы & Кордиалы</option>
              <option value="Кухня & Бакалея">Кухня & Бакалея</option>
              <option value="Инвентарь">Инвентарь</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Текущий</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Мин. остаток</label>
              <input
                type="number"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Ед. изм.</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="бут">бут</option>
                <option value="кег">кег</option>
                <option value="кг">кг</option>
                <option value="л">л</option>
                <option value="шт">шт</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold cursor-pointer"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
