/**
 * 待辦項目元件 — 單個待辦的卡片呈現
 * 支援雙模式：
 *   瀏覽模式：點擊勾選、點擊跳轉編輯頁面
 *   編輯模式：左側拖拉手柄、右側刪除按鈕、長按拖拉排序
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  DeviceEventEmitter,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import CategoryBadge from './CategoryBadge';
import { formatDate } from '../utils/helpers';

export default function TodoItem({
  todo,
  categories = [],
  onToggle,
  onDelete,
  onPress,
  drag,
  isActive,
  isEditMode,
}) {
  // 包裝 onToggle：只在「未完成 → 完成」時觸發全螢幕煙火
  // 先播放全螢幕動畫，延遲後再真正觸發完成狀態
  const handleToggleWithCelebration = useCallback((id) => {
    if (!todo.completed) {
      // 觸發全城的煙火特效
      DeviceEventEmitter.emit('triggerConfetti');
      // 延遲 900ms 再真正觸發完成，讓 1 秒鐘的動畫有充足時間播放
      setTimeout(() => {
        onToggle(id);
      }, 900);
    } else {
      // 取消完成 → 立刻執行，無需動畫
      onToggle(id);
    }
  }, [todo.completed, onToggle]);

  // ======= 刪除動畫 (電視關機效果) =======
  const [isDeleting, setIsDeleting] = useState(false);
  const tvAnimValue = useRef(new Animated.Value(1)).current;

  const handleDeleteWithTVAnim = useCallback((id) => {
    setIsDeleting(true);

    // 電視關機動畫序列
    Animated.sequence([
      // 1. 垂直壓扁成一條線 (耗時 150ms)
      Animated.timing(tvAnimValue, {
        toValue: 0.5, // 0.5 是一個中繼點
        duration: 150,
        useNativeDriver: true,
      }),
      // 2. 水平消失 (耗時 180ms)
      Animated.timing(tvAnimValue, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      })
    ]).start(() => {
      // 動畫結束後真正刪除
      onDelete(id);
    });
  }, [onDelete, tvAnimValue]);

  // 動畫插值
  // 垂直縮放：從 1 快速壓扁到 0.02 (模擬一條線)
  const scaleY = tvAnimValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.02, 1],
  });
  
  // 水平縮放：壓扁成線後，再向中間收起縮成一個點
  const scaleX = tvAnimValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 1],
  });

  // 透明度：在最後階段稍微變暗
  const opacity = tvAnimValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 1],
  });

  // ====== 編輯模式 ======
  if (isEditMode) {
    return (
      <Animated.View style={[
        styles.outerWrapper, 
        { transform: [{ scaleX }, { scaleY }], opacity }
      ]}>
        <View style={[styles.container, isActive && styles.containerActive]}>
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.inner}
              onLongPress={drag}
              delayLongPress={80}
              activeOpacity={0.8}
              disabled={isActive || isDeleting}
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
                onPress={() => handleToggleWithCelebration(todo.id)}
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
                  <CategoryBadge
                    category={todo.category}
                    color={categories.find(c => c.id === todo.category)?.color}
                    icon={categories.find(c => c.id === todo.category)?.icon}
                    label={categories.find(c => c.id === todo.category)?.label}
                    size="sm"
                  />
                </View>
              </TouchableOpacity>

              {/* 刪除按鈕 */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteWithTVAnim(todo.id)}
                activeOpacity={0.6}
                disabled={isDeleting}
              >
                <Text style={styles.deleteIcon}>🗑</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  // ====== 瀏覽模式（預設） ======
  return (
    <Animated.View style={[
      styles.outerWrapper,
      { transform: [{ scaleX }, { scaleY }], opacity }
    ]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.inner}>
            {/* 勾選框 */}
            <TouchableOpacity
              style={[
                styles.checkbox,
                todo.completed && styles.checkboxCompleted,
              ]}
              onPress={() => handleToggleWithCelebration(todo.id)}
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
                <CategoryBadge
                  category={todo.category}
                  color={categories.find(c => c.id === todo.category)?.color}
                  icon={categories.find(c => c.id === todo.category)?.icon}
                  label={categories.find(c => c.id === todo.category)?.label}
                  size="sm"
                />
                <Text style={styles.date}>{formatDate(todo.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // 最外層容器：允許慶祝動畫溢出
  outerWrapper: {
    position: 'relative',
    overflow: 'visible',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  container: {
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
