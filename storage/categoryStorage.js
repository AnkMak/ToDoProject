/**
 * 本機資料儲存層 — 使用 AsyncStorage 封裝分類的 CRUD 操作
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '../utils/helpers';

const STORAGE_KEY = '@todoproject_categories';

// 預設分類結構
export const DEFAULT_CATEGORIES = [
  { id: 'personal', label: '個人', icon: '👤', color: '#6C5CE7' },
  { id: 'work', label: '工作', icon: '💼', color: '#0984E3' },
  { id: 'shopping', label: '購物', icon: '🛒', color: '#00B894' },
  { id: 'other', label: '其他', icon: '📌', color: '#E17055' },
];

/**
 * 初始化並讀取所有分類
 */
export async function getCategories() {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    // 初次啟動，儲存並回傳預設分類
    await saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('讀取分類失敗：', error);
    return DEFAULT_CATEGORIES;
  }
}

/**
 * 儲存所有分類
 */
export async function saveCategories(categories) {
  try {
    const jsonValue = JSON.stringify(categories);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('儲存分類失敗：', error);
  }
}

/**
 * 新增單一分類
 */
export async function addCategory(categoryInfo) {
  const categories = await getCategories();
  const newCategory = {
    id: generateId(),
    ...categoryInfo,
  };
  const updatedCategories = [...categories, newCategory];
  await saveCategories(updatedCategories);
  return updatedCategories;
}

/**
 * 刪除單一分類
 */
export async function deleteCategory(id) {
  const categories = await getCategories();
  const updatedCategories = categories.filter((cat) => cat.id !== id);
  await saveCategories(updatedCategories);
  return updatedCategories;
}
