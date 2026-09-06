export type Account = {
  account_no: string;
  display_name: string | null;
  real_name?: string | null;
  lunar_birth_year?: number | null;
  lunar_birth_month?: number | null;
  lunar_birth_day?: number | null;
  lunar_birth_leap_month?: boolean;
  address?: string | null;
  line_display_name?: string | null;
  line_user_id?: string | null;  points: number;
  is_admin: boolean;
  created_at: string;
};

export type PrayerRecipient = {
  id: number;
  account_no: string;
  relationship: string | null;
  name: string;
  lunar_birth_year: number | null;
  lunar_birth_month: number | null;
  lunar_birth_day: number | null;
  lunar_birth_leap_month: boolean;
  address: string | null;
  is_default: boolean;
  created_at: string;
};

export type Offering = {
  id: number;
  name: string;
  icon_key: "flower" | "fruit" | "incense" | "joss_small" | "joss" | "treasury" | "ingot" | "snack" | "pastry";
  cost: number;
  position: number;
  is_active: boolean;
};

export type WorshipOrderItem = {
  id: number;
  offering_id: number;
  offering_name: string;
  points_spent: number;
};

export type WorshipOrder = {
  id: number;
  order_no: string;
  account_no: string;
  recipient_id: number | null;
  prayer_name: string;
  prayer_lunar_birth_year: number | null;
  prayer_lunar_birth_month: number | null;
  prayer_lunar_birth_day: number | null;
  prayer_lunar_birth_leap_month: boolean;
  prayer_address: string | null;
  total_points: number;
  status: "pending" | "completed";
  created_at: string;
  completed_at: string | null;
  completed_by: string | null;
  admin_note: string | null;
  items?: WorshipOrderItem[];
  member?: Pick<Account, "display_name" | "real_name" | "line_display_name"> | null;
};

export const OFFERING_ICON_OPTIONS: { value: Offering["icon_key"]; label: string }[] = [
  { value: "flower", label: "鮮花" },
  { value: "fruit", label: "水果" },
  { value: "incense", label: "清香" },
  { value: "joss_small", label: "金紙（小）" },
  { value: "joss", label: "金紙（大）" },
  { value: "treasury", label: "補財庫" },
  { value: "ingot", label: "金元寶" },
  { value: "snack", label: "零食" },
  { value: "pastry", label: "糕點" },
];
