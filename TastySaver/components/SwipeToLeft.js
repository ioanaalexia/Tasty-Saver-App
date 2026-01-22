import React from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.3;

export default function SwipeDeteleItem({ item, onDelete }) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        runOnJS(onDelete)(item.id);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View className="w-full my-2">
      <View className="absolute right-0 top-0 bottom-0 w-24 bg-red-500 rounded-lg justify-center items-center">
        <Text className="text-white font-bold">Delete</Text>
      </View>

      <GestureDetector gesture={pan}>
        <View className="bg-white rounded-xl p-4 shadow" style={rStyle}>
          <Text className="text-[#5C2C1D] text-lg font-bold">{item.name}</Text>
          <Text className="text-[#7e453e] mt-1">Quantity: {item.quantity}</Text>
          <Text className="text-[#7e453e] mt-1">Expires: {item.expirationDate}</Text>
        </View>
      </GestureDetector>
    </View>
  );
}
