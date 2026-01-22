import React, { useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedButton = ({
  label = 'Click',
  onPress,
  borderColor = '#996A65',
  fillColor = '#996A65',
  textColor = '#5C2C1D',
  fillTextColor = '#fff',
}) => {
  const fillWidth = useSharedValue(0);
  const currentTextColor = useSharedValue(textColor);
  const [buttonWidth, setButtonWidth] = useState(0);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: fillWidth.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: currentTextColor.value,
  }));

  const handlePress = () => {
    onPress?.();

    // animația de fill
    fillWidth.value = withTiming(buttonWidth, {
      duration: 400,
      easing: Easing.out(Easing.exp),
    });
    currentTextColor.value = withTiming(fillTextColor, { duration: 200 });

    // reset după animație
    setTimeout(() => {
      fillWidth.value = 0;
      currentTextColor.value = textColor;
    }, 500);
  };

  return (
    <Pressable onPress={handlePress}>
      <View
        className="w-10/12 border-2 rounded-full overflow-hidden justify-center items-center self-center px-6 py-3 relative"
        style={{ borderColor }}
        onLayout={(e) => setButtonWidth(e.nativeEvent.layout.width)}
      >
        {/* fill animated */}
        <Animated.View
          className="absolute inset-0 rounded-full"
          style={[
            animatedFillStyle,
            { backgroundColor: fillColor },
          ]}
        />

        {/* label */}
        <Animated.Text
          className="font-bold text-base z-10"
          style={animatedTextStyle}
        >
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
};

export default AnimatedButton;
