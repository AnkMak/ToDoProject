/**
 * 全螢幕煙火慶祝動畫元件
 * 使用 react-native-confetti-cannon 產生強烈的視覺回饋與情緒價值
 */
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, DeviceEventEmitter } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

export default function CelebrationEffect() {
  const cannonRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // 監聽全域事件來觸發煙火
    const subscription = DeviceEventEmitter.addListener('triggerConfetti', () => {
      setIsActive(true);
      // reset and start
      setTimeout(() => {
        cannonRef.current?.start();
      }, 50);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 如果從未觸發過，可以不渲染以節省效能
  if (!isActive) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <ConfettiCannon
        ref={cannonRef}
        count={150} // 彩帶數量，150 顆非常有誠意
        origin={{ x: width / 2, y: -20 }} // 從螢幕底部正中央發射
        autoStart={false} // 透過 ref.start() 手控發射
        fadeOut={true} // 結束時漸隱
        explosionSpeed={500} // 爆炸速度 (毫秒)
        fallSpeed={3500} // 下落速度 (毫秒)
        colors={['#ffdf00', '#ff007f', '#00e5ff', '#ff3333', '#00ff00', '#c800ff']} // 高飽和度的慶祝色彩
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // 讓這個容器固定在畫面最上層，且不阻擋點擊
    zIndex: 9999,
    elevation: 9999,
  },
});
