/**
 * 類別管理頁面 — 可自行新增與刪除自訂分類
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategories, addCategory, deleteCategory } from '../storage/categoryStorage';
import { getAllTodos, updateTodo } from '../storage/todoStorage';
import { COLORS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import CategoryBadge from '../components/CategoryBadge';

// 預設可選圖示
const AVAILABLE_ICONS = ['👤', '💼', '🛒', '📌', '❤️', '✈️', '🎮', '🏠', '📈', '🍔'];
// 預設可選顏色
const AVAILABLE_COLORS = [
  '#6C5CE7', // 紫
  '#0984E3', // 藍
  '#00B894', // 綠
  '#E17055', // 橙
  '#FF7675', // 粉紅
  '#FDCB6E', // 黃
  '#00CEC9', // 青
  '#D63031', // 紅
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [todos, setTodos] = useState([]);
  
  // 新增分類表單狀態
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState(AVAILABLE_ICONS[0]);
  const [newColor, setNewColor] = useState(AVAILABLE_COLORS[0]);
  const [loading, setLoading] = useState(false);

  // 載入資料
  const loadData = useCallback(async () => {
    const [catsData, todosData] = await Promise.all([
      getCategories(),
      getAllTodos()
    ]);
    setCategories(catsData);
    setTodos(todosData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 新增分類
  const handleAddCategory = async () => {
    const trimmedLabel = newLabel.trim();
    if (!trimmedLabel) {
      Alert.alert('提示', '請輸入分類名稱');
      return;
    }
    
    // 檢查是否有重複名稱
    if (categories.some(cat => cat.label === trimmedLabel)) {
      Alert.alert('提示', '已存在相同名稱的分類');
      return;
    }

    setLoading(true);
    try {
      const updatedCategories = await addCategory({
        label: trimmedLabel,
        icon: newIcon,
        color: newColor,
      });
      setCategories(updatedCategories);
      
      // 重置表單
      setNewLabel('');
      setNewIcon(AVAILABLE_ICONS[0]);
      setNewColor(AVAILABLE_COLORS[0]);
      setIsAdding(false);
    } catch (error) {
      Alert.alert('錯誤', '新增分類失敗');
    } finally {
      setLoading(false);
    }
  };

  // 刪除分類
  const handleDeleteCategory = (categoryId, categoryLabel) => {
    // 檢查是否為唯一分類
    if (categories.length <= 1) {
      Alert.alert('提示', '至少需要保留一個分類');
      return;
    }

    // 檢查是否有待辦事項正在使用此分類
    const affectedTodos = todos.filter(t => t.category === categoryId);
    
    if (affectedTodos.length > 0) {
      Alert.alert(
        '刪除分類',
        `此分類下有 ${affectedTodos.length} 個待辦事項。刪除後這些項目將被移至「其他」分類，確定要刪除嗎？`,
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '確定刪除', 
            style: 'destructive',
            onPress: () => confirmDeleteWithMigration(categoryId)
          }
        ]
      );
    } else {
      Alert.alert(
        '刪除分類',
        `確定要刪除「${categoryLabel}」分類嗎？`,
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '確定刪除', 
            style: 'destructive',
            onPress: () => confirmDelete(categoryId)
          }
        ]
      );
    }
  };

  // 確認刪除並移轉舊有待辦至「其他」
  const confirmDeleteWithMigration = async (categoryId) => {
    setLoading(true);
    try {
      // 尋找或確保有一個「其他」分類作為 fallback
      let fallbackCategory = categories.find(c => c.id === 'other' || c.label === '其他');
      
      // 如果要刪除的就是 fallback 分類，找清單中的第一個（非自身）當 fallback
      if (!fallbackCategory || fallbackCategory.id === categoryId) {
        fallbackCategory = categories.find(c => c.id !== categoryId);
      }

      // 移轉所有關聯待辦
      const affectedTodos = todos.filter(t => t.category === categoryId);
      for (const todo of affectedTodos) {
        await updateTodo(todo.id, { category: fallbackCategory.id });
      }

      // 刪除分類
      const updatedCategories = await deleteCategory(categoryId);
      setCategories(updatedCategories);
      
      // 重新載入待辦以反映更新
      const newTodos = await getAllTodos();
      setTodos(newTodos);
      
      Alert.alert('成功', '分類已刪除，關聯待辦已移轉');
    } catch (error) {
      Alert.alert('錯誤', '刪除失敗');
    } finally {
      setLoading(false);
    }
  };

  // 單純刪除分類
  const confirmDelete = async (categoryId) => {
    setLoading(true);
    try {
      const updatedCategories = await deleteCategory(categoryId);
      setCategories(updatedCategories);
    } catch (error) {
      Alert.alert('錯誤', '刪除失敗');
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
        {/* 頂部導航列 */}
        <View style={styles.navbar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.navButton}
            activeOpacity={0.7}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.navTitle}>管理分類</Text>

          <TouchableOpacity
            onPress={() => setIsAdding(!isAdding)}
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>{isAdding ? '取消' : '新增'}</Text>
          </TouchableOpacity>
        </View>

        {/* 新增分類表單區塊 */}
        {isAdding && (
          <View style={styles.addFormContainer}>
            <Text style={styles.sectionLabel}>新增分類</Text>
            
            <View style={styles.inputRow}>
              <View style={[styles.iconPreview, { backgroundColor: newColor + '20' }]}>
                <Text style={styles.iconPreviewText}>{newIcon}</Text>
              </View>
              <TextInput
                style={styles.nameInput}
                placeholder="輸入分類名稱..."
                placeholderTextColor={COLORS.textMuted}
                value={newLabel}
                onChangeText={setNewLabel}
                maxLength={10}
                autoFocus
              />
            </View>

            <Text style={styles.subLabel}>選擇圖示</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
              {/* 自訂 Icon 輸入框元件 */}
              <View 
                style={[
                  styles.iconOption, 
                  !AVAILABLE_ICONS.includes(newIcon) && styles.iconOptionSelected
                ]}
              >
                <TextInput
                  style={[styles.customIconInput, { color: COLORS.textPrimary }]}
                  placeholder="+"
                  placeholderTextColor={COLORS.textMuted}
                  value={!AVAILABLE_ICONS.includes(newIcon) ? newIcon : ''}
                  onChangeText={(text) => {
                    // 取最後一個字元（若是 Emoji 可能長度 > 1，簡單限制 2 個字元以符合多數 Emoji 長度）
                    setNewIcon(text.slice(-2));
                  }}
                  onFocus={() => {
                    // 若當前選的是內建圖標，清空成讓使用者全新輸入
                    if (AVAILABLE_ICONS.includes(newIcon)) {
                      setNewIcon('');
                    }
                  }}
                  maxLength={2}
                />
              </View>

              {/* 預設圖標列表 */}
              {AVAILABLE_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconOption, newIcon === icon && styles.iconOptionSelected]}
                  onPress={() => setNewIcon(icon)}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.subLabel}>選擇顏色</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.selectorScroll, styles.lastScroll]}>
              {AVAILABLE_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption, 
                    { backgroundColor: color },
                    newColor === color && styles.colorOptionSelected,
                    newColor === color && { borderColor: '#FFF' }
                  ]}
                  onPress={() => setNewColor(color)}
                >
                  {newColor === color && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.submitButton, loading && { opacity: 0.7 }]} 
              onPress={handleAddCategory}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? '儲存中...' : '確認新增'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 現有分類列表 */}
        <View style={[styles.flex, { marginTop: SPACING.md }]}>
          <Text style={[styles.sectionLabel, { paddingHorizontal: SPACING.xl }]}>現有分類</Text>
          <FlatList
            data={categories}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              // 計算使用該分類的待辦數量
              const usageCount = todos.filter(t => t.category === item.id).length;
              
              return (
                <View style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <CategoryBadge 
                      category={item} 
                      color={item.color} 
                      icon={item.icon} 
                      label={item.label} 
                      size="md" 
                    />
                    <Text style={styles.usageText}>{usageCount} 個待辦</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCategory(item.id, item.label)}
                  >
                    <Text style={styles.deleteIcon}>🗑</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
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
    fontWeight: '700',
  },
  navTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary + '20',
  },
  addButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  // 表單區塊
  addFormContainer: {
    marginHorizontal: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconPreview: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconPreviewText: {
    fontSize: 24,
  },
  nameInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  selectorScroll: {
    marginBottom: SPACING.lg,
    flexGrow: 0,
  },
  lastScroll: {
    marginBottom: SPACING.xl,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconOptionSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primary + '20',
  },
  iconOptionText: {
    fontSize: 20,
  },
  customIconInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 20,
    padding: 0,
    margin: 0,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  // 列表區塊
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  usageText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.md,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.whiteAlpha10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 16,
  },
});
