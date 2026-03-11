/**
 * 新增/編輯待辦頁面
 * - 無 id 參數 → 新增模式
 * - 有 id 參數 → 編輯模式（預填現有資料）
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  FONT_SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from '../constants/theme';
import { getAllTodos, addTodo, updateTodo } from '../storage/todoStorage';
import { generateId } from '../utils/helpers';

// 所有分類選項
const CATEGORIES = ['personal', 'work', 'shopping', 'other'];

export default function AddScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('personal');
  const [loading, setLoading] = useState(false);

  // 編輯模式：載入並預填現有資料
  useEffect(() => {
    if (isEditMode) {
      loadTodoData();
    }
  }, [id]);

  const loadTodoData = async () => {
    const todos = await getAllTodos();
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      setTitle(todo.title);
      setCategory(todo.category);
    }
  };

  // 儲存
  const handleSave = async () => {
    // 驗證標題不能為空
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('提示', '請輸入待辦事項標題');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        // 編輯模式：更新現有待辦
        await updateTodo(id, {
          title: trimmedTitle,
          category,
        });
      } else {
        // 新增模式：建立新待辦
        const newTodo = {
          id: generateId(),
          title: trimmedTitle,
          completed: false,
          category,
          createdAt: new Date().toISOString(),
        };
        await addTodo(newTodo);
      }
      router.back();
    } catch (error) {
      Alert.alert('錯誤', '儲存失敗，請再試一次');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 頂部導航列 */}
          <View style={styles.navbar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.navButton}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.navTitle}>
              {isEditMode ? '編輯待辦' : '新增待辦'}
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? '儲存中…' : '儲存'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 標題輸入 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>待辦事項</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="輸入待辦事項…"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus={!isEditMode}
              multiline
              maxLength={200}
            />
            <Text style={styles.charCount}>{title.length}/200</Text>
          </View>

          {/* 分類選擇 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>分類</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const color = COLORS.categories[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryCard,
                      isSelected && {
                        borderColor: color,
                        backgroundColor: color + '15',
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryIcon}>
                      {CATEGORY_ICONS[cat]}
                    </Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && { color },
                      ]}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>

                    {/* 選中指示器 */}
                    {isSelected && (
                      <View style={[styles.selectedDot, { backgroundColor: color }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  // 導航列
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  navTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#FFF',
  },
  // 區塊
  section: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // 標題輸入
  titleInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  // 分類網格
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  categoryLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  selectedDot: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
  },
});
