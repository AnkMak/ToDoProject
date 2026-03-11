/**
 * 工具函式 — UUID 生成、日期格式化、排序邏輯
 */

/**
 * 生成 UUID v4 格式的唯一識別碼
 * @returns {string} UUID 字串
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 格式化日期為易讀的中文格式
 * @param {string} dateString - ISO 格式日期字串
 * @returns {string} 格式化後的日期（例如「3月9日 12:30」）
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;

  if (isToday) {
    return `今天 ${time}`;
  }
  if (isYesterday) {
    return `昨天 ${time}`;
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日 ${time}`;
}

/**
 * 排序待辦：未完成在上 → 按建立時間由新到舊
 * @param {Array} todos - 待辦陣列
 * @returns {Array} 排序後的陣列
 */
export function sortTodos(todos) {
  return [...todos].sort((a, b) => {
    // 未完成排在前面
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // 相同完成狀態，按時間由新到舊
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}
