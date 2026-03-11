/**
 * 空狀態元件 — 當清單為空時顯示的佔位畫面
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      {/* 大圖示 */}
      <Text style={styles.emoji}>📝</Text>

      {/* 標題 */}
      <Text style={styles.title}>還沒有待辦事項</Text>

      {/* 提示文字 */}
      <Text style={styles.subtitle}>
        點擊右下角的 + 按鈕{'\n'}新增你的第一個待辦吧！
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingBottom: 80, // 偏上一點，視覺更舒適
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
