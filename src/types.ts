export type UserRole = 
  | 'Администратор' 
  | 'Старший бармен' 
  | 'Старший повар' 
  | 'Бармен' 
  | 'Повар' 
  | 'Официант';

export type ZoneType = 'Бар' | 'Кухня' | 'Зал';
export type ChecklistType = 'Утренний' | 'Вечерний' | 'Составной';

export interface User {
  id: string;
  name: string;
  login: string;
  role: UserRole;
  avatar: string;
  establishmentCode: string;
  assignedPoint: string;
}

export interface ChecklistSubItem {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  note?: string;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: ChecklistSubItem[];
}

export interface Checklist {
  id: string;
  title: string;
  description: string;
  zone: ZoneType;
  type: ChecklistType;
  isPinned: boolean;
  pointId: string;
  updatedAt: string;
  assignedRole?: string;
  // For standard checklists:
  items?: ChecklistSubItem[];
  // For compound (составной) checklists:
  groups?: ChecklistGroup[];
}

export interface Task {
  id: string;
  title: string;
  zone: ZoneType;
  priority: 'Высокий' | 'Средний' | 'Низкий';
  status: 'К выполнению' | 'В работе' | 'Выполнено';
  assigneeRole: UserRole;
  deadline: string;
  pointId: string;
  createdByName: string;
}

export interface SupplyOrder {
  id: string;
  code: string;
  supplier: string;
  category: 'Алкоголь' | 'Безалкогольное' | 'Кухня' | 'Хозтовары';
  itemsSummary: string;
  totalAmount: number;
  status: 'Черновик' | 'На согласовании' | 'В пути' | 'Принято';
  createdAt: string;
  pointId: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'Крепкий алкоголь' | 'Пиво & Сидр' | 'Сиропы & Кордиалы' | 'Кухня & Бакалея' | 'Инвентарь';
  currentQty: number;
  minQty: number;
  unit: string;
  pointId: string;
  pricePerUnit: number;
  lastChecked: string;
}

export interface AppNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  unread: boolean;
  type: 'alert' | 'info' | 'success';
}
