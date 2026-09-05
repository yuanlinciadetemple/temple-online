export type Account = {
  account_no: string;
  display_name: string | null;
  points: number; // 單位：CDTB
  is_admin: boolean;
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
