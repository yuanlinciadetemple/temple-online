// 五種供品的插畫圖示，統一用廟宇紅金配色手繪風格
// 顏色對應 tailwind.config.ts 裡的 lacquer / gold / ember

export function FlowerIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="52" rx="14" ry="4" fill="#5A1620" opacity="0.25" />
      <path d="M32 50V30" stroke="#3F6B4F" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 40c-6-2-10 2-12 6" stroke="#3F6B4F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <g>
        <circle cx="32" cy="20" r="7" fill="#D8622A" />
        <circle cx="21" cy="24" r="7" fill="#C6A15B" />
        <circle cx="43" cy="24" r="7" fill="#C6A15B" />
        <circle cx="24" cy="14" r="7" fill="#7A1F2B" />
        <circle cx="40" cy="14" r="7" fill="#7A1F2B" />
        <circle cx="32" cy="19" r="5" fill="#E4CE9B" />
      </g>
    </svg>
  );
}

export function FruitIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="50" rx="20" ry="5" fill="#5A1620" opacity="0.2" />
      <path d="M14 46c-2-14 6-22 18-22s20 8 18 22" stroke="#C6A15B" strokeWidth="2" fill="#F4ECDC" />
      <circle cx="22" cy="34" r="9" fill="#D8622A" />
      <circle cx="34" cy="30" r="10" fill="#D8622A" />
      <circle cx="45" cy="35" r="8" fill="#D8622A" />
      <path d="M34 20c1-3 4-4 6-3" stroke="#3F6B4F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="34" cy="19" r="2.5" fill="#3F6B4F" />
    </svg>
  );
}

export function IncenseIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="54" rx="16" ry="4" fill="#5A1620" opacity="0.2" />
      <path d="M18 54c0-6 3-8 3-8H43s3 2 3 8" fill="#241812" />
      <rect x="21" y="44" width="22" height="6" rx="1" fill="#7A1F2B" />
      <rect x="27" y="14" width="2.4" height="32" fill="#C6A15B" />
      <rect x="32" y="10" width="2.4" height="36" fill="#C6A15B" />
      <rect x="37" y="16" width="2.4" height="30" fill="#C6A15B" />
      <path d="M28 12c2-3 0-5-1-7" stroke="#D8622A" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <path d="M33 8c2-3 0-5-1-7" stroke="#D8622A" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <path d="M38 14c2-3 0-5-1-7" stroke="#D8622A" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function JossPaperIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="54" rx="18" ry="4" fill="#5A1620" opacity="0.2" />
      <rect x="16" y="38" width="26" height="16" rx="1" fill="#E4CE9B" stroke="#C6A15B" strokeWidth="1.5" transform="rotate(-4 16 38)" />
      <rect x="22" y="32" width="26" height="16" rx="1" fill="#F4ECDC" stroke="#C6A15B" strokeWidth="1.5" transform="rotate(3 22 32)" />
      <rect x="26" y="34" width="14" height="10" rx="1" fill="#C6A15B" transform="rotate(3 26 34)" />
      <rect x="20" y="40" width="14" height="10" rx="1" fill="#D8622A" opacity="0.85" transform="rotate(-4 20 40)" />
    </svg>
  );
}

export function PastryIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="52" rx="18" ry="4" fill="#5A1620" opacity="0.2" />
      <rect x="14" y="44" width="36" height="6" rx="2" fill="#C6A15B" />
      <path d="M18 44c-1-10 4-16 14-16s15 6 14 16" fill="#D8622A" />
      <circle cx="32" cy="30" r="4" fill="#7A1F2B" />
      <circle cx="24" cy="36" r="2.4" fill="#F4ECDC" />
      <circle cx="40" cy="36" r="2.4" fill="#F4ECDC" />
      <circle cx="32" cy="40" r="2.4" fill="#F4ECDC" />
    </svg>
  );
}

export function TreasuryIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="54" rx="18" ry="4" fill="#5A1620" opacity="0.2" />
      <rect x="12" y="26" width="40" height="24" rx="3" fill="#7A1F2B" stroke="#C6A15B" strokeWidth="2" />
      <rect x="12" y="26" width="40" height="8" rx="3" fill="#5A1620" />
      <circle cx="32" cy="38" r="6" fill="#C6A15B" />
      <rect x="30.5" y="38" width="3" height="7" fill="#5A1620" />
      <path d="M18 26v-4c0-4 4-6 14-6s14 2 14 6v4" stroke="#C6A15B" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export function IngotIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="50" rx="20" ry="4" fill="#5A1620" opacity="0.2" />
      <path
        d="M14 44c0-10 4-18 8-18h20c4 0 8 8 8 18 0 3-3 5-9 5H23c-6 0-9-2-9-5Z"
        fill="#C6A15B"
        stroke="#7A1F2B"
        strokeWidth="2"
      />
      <ellipse cx="32" cy="26" rx="15" ry="6" fill="#E4CE9B" stroke="#7A1F2B" strokeWidth="2" />
      <path d="M22 44c2-6 6-10 10-10s8 4 10 10" stroke="#7A1F2B" strokeWidth="1.5" opacity="0.5" fill="none" />
    </svg>
  );
}

export function SnackIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="52" rx="18" ry="4" fill="#5A1620" opacity="0.2" />
      <rect x="14" y="20" width="36" height="26" rx="4" fill="#F4ECDC" stroke="#C6A15B" strokeWidth="2" transform="rotate(-3 14 20)" />
      <circle cx="24" cy="32" r="3" fill="#D8622A" />
      <circle cx="34" cy="28" r="3" fill="#7A1F2B" />
      <circle cx="42" cy="36" r="3" fill="#D8622A" />
      <circle cx="30" cy="40" r="3" fill="#7A1F2B" />
      <path d="M16 20l4-6 32 4-2 6" fill="#D8622A" opacity="0.9" />
    </svg>
  );
}

export const OFFERING_ICONS: Record<string, () => JSX.Element> = {
  flower: FlowerIcon,
  fruit: FruitIcon,
  incense: IncenseIcon,
  joss_small: JossPaperIcon,
  joss: JossPaperIcon,
  treasury: TreasuryIcon,
  ingot: IngotIcon,
  snack: SnackIcon,
  pastry: PastryIcon,
};
