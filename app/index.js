/**
 * 主頁面 — 待辦清單
 * 功能：瀏覽模式（Carousel 分頁 + FlatList 瀏覽）/ 編輯模式（DraggableFlatList 排序 + 刪除）
 *
 * 架構核心：兩種模式永不同時存在衝突的手勢元件
 *   - 瀏覽模式：Carousel（水平滑動）+ FlatList（垂直瀏覽）→ 無 RNGH 手勢
 *   - 編輯模式：DraggableFlatList（拖拉排序）→ 無 Carousel
 */
import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import Carousel from 'react-native-reanimated-carousel';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { getAllTodos, updateTodo, deleteTodo, saveTodos } from '../storage/todoStorage';
import TodoItem from '../components/TodoItem';
import EmptyState from '../components/EmptyState';

const SCREEN_WIDTH = Dimensions.get('window').width;

// 篩選標籤列資料
const FILTER_TABS = [
  { key: 'all', label: '全部' },
  { key: 'personal', label: '👤 個人' },
  { key: 'work', label: '💼 工作' },
  { key: 'shopping', label: '🛒 購物' },
  { key: 'other', label: '📌 其他' },
  { key: 'completed', label: '✅ 已完成' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isEditMode, setIsEditMode] = useState(false);

  // 記住當前頁面索引，用於模式切換間同步
  const currentPageRef = useRef(0);

  // Carousel ref
  const carouselRef = useRef(null);
  // 篩選標籤列 ref
  const filterListRef = useRef(null);

  // 載入資料
  const loadTodos = useCallback(async () => {
    const data = await getAllTodos();
    setTodos(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTodos();
    }, [loadTodos])
  );

  // 切換完成狀態
  const handleToggle = useCallback(async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const updated = await updateTodo(id, { completed: !todo.completed });
    setTodos(updated);
  }, [todos]);

  // 刪除待辦
  const handleDelete = useCallback(async (id) => {
    const updated = await deleteTodo(id);
    setTodos(updated);
  }, []);

  // 點擊待辦項目 → 跳轉編輯頁面（瀏覽模式）
  const handlePress = useCallback((todo) => {
    router.push({ pathname: '/add', params: { id: todo.id } });
  }, [router]);

  // 拖拉排序結束 → 儲存新順序（編輯模式）
  const handleDragEnd = useCallback(async ({ data: newData }) => {
    // 泛型排序映射邏輯：不管是在哪個過濾條件下排序，
    // 原地取代 todos 中對應元素的順序，不影響其他隱藏項目的相對位置。
    const merged = [...todos];
    const indicesToReplace = [];
    const newDataIds = new Set(newData.map(item => item.id));

    todos.forEach((t, i) => {
      if (newDataIds.has(t.id)) {
        indicesToReplace.push(i);
      }
    });

    indicesToReplace.forEach((index, i) => {
      merged[index] = newData[i];
    });

    setTodos(merged);
    await saveTodos(merged);
  }, [todos]);

  // Carousel 頁面切換回調
  const handlePageSelected = useCallback((index) => {
    currentPageRef.current = index;
    setSelectedFilter(FILTER_TABS[index].key);

    try {
      filterListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    } catch (_) {}
  }, []);

  // 點擊篩選標籤
  const handleFilterPress = useCallback((tabKey) => {
    const index = FILTER_TABS.findIndex((t) => t.key === tabKey);
    if (index < 0) return;

    currentPageRef.current = index;
    setSelectedFilter(tabKey);

    if (!isEditMode) {
      // 瀏覽模式：用 Carousel 滑動到對應頁面
      carouselRef.current?.scrollTo({ index, animated: true });
    }

    try {
      filterListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    } catch (_) {}
  }, [isEditMode]);

  // 切換模式
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  // 根據篩選條件過濾
  const filteredTodos = useMemo(() => {
    if (selectedFilter === 'completed') {
      return todos.filter((t) => t.completed);
    }
    const activeTodos = todos.filter((t) => !t.completed);
    return selectedFilter === 'all'
      ? activeTodos
      : activeTodos.filter((t) => t.category === selectedFilter);
  }, [todos, selectedFilter]);

  // 統計：未完成數量
  const pendingCount = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 頂部標題區 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>我的待辦</Text>
            <Text style={styles.subtitle}>
              {pendingCount > 0
                ? `還有 ${pendingCount} 項未完成`
                : '太棒了，全部完成！🎉'}
            </Text>
          </View>

          {/* 編輯 / 完成 按鈕 */}
          <TouchableOpacity
            style={[styles.editButton, isEditMode && styles.editButtonActive]}
            onPress={toggleEditMode}
            activeOpacity={0.7}
          >
            <Text style={[styles.editButtonText, isEditMode && styles.editButtonTextActive]}>
              {isEditMode ? '完成' : '編輯'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 分類篩選標籤列 */}
        <View style={styles.filterContainer}>
          <FlatList
            ref={filterListRef}
            data={FILTER_TABS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  selectedFilter === item.key && styles.filterTabActive,
                ]}
                onPress={() => handleFilterPress(item.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === item.key && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ====== 瀏覽模式：Carousel + FlatList ====== */}
        {!isEditMode && (
          <View style={styles.pager}>
            <Carousel
              ref={carouselRef}
              loop={false}
              width={SCREEN_WIDTH}
              height={'100%'}
              data={FILTER_TABS}
              defaultIndex={currentPageRef.current}
              onSnapToItem={handlePageSelected}
              panGestureHandlerProps={{
                activeOffsetX: [-10, 10],
                failOffsetY: [-15, 15],
              }}
              renderItem={({ item: tab }) => {
                let tabTodos;
                if (tab.key === 'completed') {
                  tabTodos = todos.filter((t) => t.completed);
                } else {
                  const activeTodos = todos.filter((t) => !t.completed);
                  tabTodos = tab.key === 'all'
                    ? activeTodos
                    : activeTodos.filter((t) => t.category === tab.key);
                }

                return (
                  <View style={styles.page}>
                    {tabTodos.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <FlatList
                        data={tabTodos}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                          <TodoItem
                            todo={item}
                            onToggle={handleToggle}
                            isEditMode={false}
                          />
                        )}
                      />
                    )}
                  </View>
                );
              }}
            />
          </View>
        )}

        {/* ====== 編輯模式：DraggableFlatList（無 Carousel） ====== */}
        {isEditMode && (
          <View style={styles.pager}>
            {filteredTodos.length === 0 ? (
              <EmptyState />
            ) : (
              <DraggableFlatList
                data={filteredTodos}
                keyExtractor={(item) => item.id}
                onDragEnd={handleDragEnd}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, drag, isActive }) => (
                  <TodoItem
                    todo={item}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onPress={handlePress}
                    drag={drag}
                    isActive={isActive}
                    isEditMode={true}
                  />
                )}
              />
            )}
          </View>
        )}

        {/* 浮動新增按鈕（僅瀏覽模式顯示） */}
        {!isEditMode && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/add')}
            activeOpacity={0.8}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  // 編輯 / 完成 按鈕
  editButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
  },
  editButtonActive: {
    backgroundColor: COLORS.primary,
  },
  editButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  editButtonTextActive: {
    color: '#FFF',
  },
  // 篩選
  filterContainer: {
    paddingBottom: SPACING.md,
  },
  filterList: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  listContent: {
    paddingTop: SPACING.sm,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: SPACING.xxxl,
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  fabText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
