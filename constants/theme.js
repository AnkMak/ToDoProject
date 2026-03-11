/**
 * 設計系統 — 色彩、字型、間距、陰影等設計 token
 * 採用深色主題搭配鮮明的漸層色彩，打造精緻感
 */

// 主色調
export const COLORS = {
  // 主題色
  primary: '#6C5CE7',        // 紫色主色
  primaryLight: '#A29BFE',   // 淡紫
  primaryDark: '#5A4BD1',    // 深紫

  // 背景色（深色系）
  background: '#0A0E1A',     // 極深藍黑
  surface: '#141929',        // 卡片背景
  surfaceLight: '#1E2340',   // 較亮表面

  // 文字色
  textPrimary: '#EAEDF3',    // 主要文字（接近白）
  textSecondary: '#8B93A7',  // 次要文字（灰藍）
  textMuted: '#525B73',      // 靜音文字

  // 狀態色
  success: '#00D68F',        // 完成綠
  danger: '#FF6B6B',         // 刪除紅
  warning: '#FDCB6E',        // 警告黃

  // 分類色
  categories: {
    personal: '#6C5CE7',     // 個人 — 紫
    work: '#0984E3',         // 工作 — 藍
    shopping: '#00B894',     // 購物 — 綠
    other: '#E17055',        // 其他 — 橙
  },

  // 分隔線
  border: '#1E2340',
  divider: 'rgba(255,255,255,0.06)',

  // 白色半透明
  whiteAlpha10: 'rgba(255,255,255,0.10)',
  whiteAlpha20: 'rgba(255,255,255,0.20)',
};

// 字型大小
export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 34,
};

// 間距
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// 圓角
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

// 陰影（iOS）
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

// 分類標籤對照
export const CATEGORY_LABELS = {
  personal: '個人',
  work: '工作',
  shopping: '購物',
  other: '其他',
};

// 分類圖示（Emoji）
export const CATEGORY_ICONS = {
  personal: '👤',
  work: '💼',
  shopping: '🛒',
  other: '📌',
};
