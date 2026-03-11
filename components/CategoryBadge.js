/**
 * 分類標籤元件 — 帶圓角背景色的小標籤
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS, CATEGORY_LABELS, CATEGORY_ICONS } from '../constants/theme';

export default function CategoryBadge({ category, size = 'sm' }) {
  // 取得該分類對應的顏色
  const color = COLORS.categories[category] || COLORS.categories.other;
  const label = CATEGORY_LABELS[category] || '其他';
  const icon = CATEGORY_ICONS[category] || '📌';

  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.badge,
      { backgroundColor: color + '20' }, // 20% 不透明度背景
      isSmall ? styles.badgeSmall : styles.badgeLarge,
    ]}>
      <Text style={[styles.icon, isSmall && styles.iconSmall]}>{icon}</Text>
      <Text style={[
        styles.label,
        { color },
        isSmall ? styles.labelSmall : styles.labelLarge,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  badgeSmall: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  badgeLarge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  icon: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.xs,
  },
  iconSmall: {
    fontSize: FONT_SIZES.xs,
  },
  label: {
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: FONT_SIZES.xs,
  },
  labelLarge: {
    fontSize: FONT_SIZES.sm,
  },
});
