/**
 * 根佈局 — 配置 Stack 導航與全域主題
 */
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 狀態列設為淺色文字（適合深色背景） */}
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: COLORS.background,
          },
          animation: 'slide_from_right',
        }}
      >
        {/* 首頁禁用 iOS 返回手勢，防止與 PagerView 水平滑動衝突 */}
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
