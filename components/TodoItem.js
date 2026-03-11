/**
 * 待辦項目元件 — 單個待辦的卡片呈現
 * 支援雙模式：
 *   瀏覽模式：點擊勾選、點擊跳轉編輯頁面
 *   編輯模式：左側拖拉手柄、右側刪除按鈕、長按拖拉排序
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import CategoryBadge from './CategoryBadge';
import { formatDate } from '../utils/helpers';

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onPress,
  drag,
  isActive,
  isEditMode,
}) {
  // ====== 編輯模式 ======
  if (isEditMode) {
    return (
      <View style={[styles.container, isActive && styles.containerActive]}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.inner}
            onLongPress={drag}
            delayLongPress={80}
            activeOpacity={0.8}
            disabled={isActive}
          >
            {/* 拖拉手柄 */}
            <View style={styles.dragHandle}>
              <Text style={styles.dragIcon}>≡</Text>
            </View>

            {/* 勾選框 */}
            <TouchableOpacity
              style={[
                styles.checkbox,
                todo.completed && styles.checkboxCompleted,
              ]}
              onPress={() => onToggle(todo.id)}
              activeOpacity={0.6}
            >
              {todo.completed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            {/* 文字區域（點擊跳轉編輯） */}
            <TouchableOpacity 
              style={styles.textContainer}
              onPress={() => onPress?.(todo)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.title,
                  todo.completed && styles.titleCompleted,
                ]}
                numberOfLines={1}
              >
                {todo.title}
              </Text>
              <View style={styles.meta}>
                <CategoryBadge category={todo.category} size="sm" />
              </View>
            </TouchableOpacity>

            {/* 刪除按鈕 */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDelete(todo.id)}
              activeOpacity={0.6}
            >
              <Text style={styles.deleteIcon}>🗑</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ====== 瀏覽模式（預設） ======
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.inner}>
          {/* 勾選框 */}
          <TouchableOpacity
            style={[
              styles.checkbox,
              todo.completed && styles.checkboxCompleted,
            ]}
            onPress={() => onToggle(todo.id)}
            activeOpacity={0.6}
          >
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          {/* 文字區域 */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                todo.completed && styles.titleCompleted,
              ]}
              numberOfLines={2}
            >
              {todo.title}
            </Text>
            <View style={styles.meta}>
              <CategoryBadge category={todo.category} size="sm" />
              <Text style={styles.date}>{formatDate(todo.createdAt)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  // 拖拉中的視覺回饋
  containerActive: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    transform: [{ scale: 1.03 }],
    zIndex: 999,
  },
  // 前景內容
  content: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  // 拖拉手柄（編輯模式）
  dragHandle: {
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  dragIcon: {
    fontSize: 22,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  // 刪除按鈕（編輯模式）
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.whiteAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  deleteIcon: {
    fontSize: 16,
  },
  // 勾選框
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.whiteAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  // 文字
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
