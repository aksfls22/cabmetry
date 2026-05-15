export type PaymentMethod = "cash" | "card" | "uber" | "bolt";

export interface Ride {
  id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  notes: string | null;
  created_at: string;
}

export interface TodayStats {
  totalEarnings: number;
  totalRides: number;
  totalExpenses: number;
  netProfit: number;
}

export interface DashboardInsights {
  topPaymentMethod: PaymentMethod | null;
  averageRideValue: number;
}

export interface DashboardData extends TodayStats {
  recentRides: Ride[];
  insights: DashboardInsights;
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "uber", label: "Uber" },
  { value: "bolt", label: "Bolt" },
];

export const EXPENSE_CATEGORIES = [
  "Combustible",
  "Lavado",
  "Mantenimiento",
  "Peajes",
  "Seguro",
  "Comida",
  "Otros",
] as const;
