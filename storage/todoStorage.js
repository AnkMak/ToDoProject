/**
 * 本機資料儲存層 — 使用 AsyncStorage 封裝待辦的 CRUD 操作
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage 的儲存鍵名
const STORAGE_KEY = '@todoproject_todos';

/**
 * 讀取所有待辦項目
 * @returns {Promise<Array>} 待辦陣列
 */
export async function getAllTodos() {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = jsonValue != null ? JSON.parse(jsonValue) : [];
    // 過濾掉可能因操作錯誤產生的 null/undefined 項目
    return parsed.filter((item) => item != null && item.id);
  } catch (error) {
    console.error('讀取待辦失敗：', error);
    return [];
  }
}

/**
 * 儲存整個待辦列表（覆蓋）
 * @param {Array} todos - 待辦陣列
 */
export async function saveTodos(todos) {
  try {
    const jsonValue = JSON.stringify(todos);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('儲存待辦失敗：', error);
  }
}

/**
 * 新增單一待辦
 * @param {Object} todo - 待辦物件
 * @returns {Promise<Array>} 更新後的待辦陣列
 */
export async function addTodo(todo) {
  const todos = await getAllTodos();
  const updatedTodos = [todo, ...todos];
  await saveTodos(updatedTodos);
  return updatedTodos;
}

/**
 * 更新指定待辦
 * @param {string} id - 待辦 ID
 * @param {Object} updates - 要更新的欄位
 * @returns {Promise<Array>} 更新後的待辦陣列
 */
export async function updateTodo(id, updates) {
  const todos = await getAllTodos();
  const updatedTodos = todos.map((todo) =>
    todo.id === id ? { ...todo, ...updates } : todo
  );
  await saveTodos(updatedTodos);
  return updatedTodos;
}

/**
 * 刪除指定待辦
 * @param {string} id - 待辦 ID
 * @returns {Promise<Array>} 更新後的待辦陣列
 */
export async function deleteTodo(id) {
  const todos = await getAllTodos();
  const updatedTodos = todos.filter((todo) => todo.id !== id);
  await saveTodos(updatedTodos);
  return updatedTodos;
}
