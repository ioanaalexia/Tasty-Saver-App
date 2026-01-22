import React, {useState} from 'react';
import {TouchableOpacity, Pressable,  Dimensions, Text} from 'react-native';
import Animated, {
    userSharedValue,
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from 'react-native-reanimated'

const screenWidth  = Dimensions.get('window').width;
const spacing = 24;
const optionWidth = (screenWidth - spacing * 3) / 2;


export default function CuisineOption({name, emoji, isSelected, onPress}) {
    const [hovered, setHovered] = useState(false);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return{
            transform: [{scale: scale.value}],
        };
    });
    
    const handlePress = () => {
        onPress(name);
    };
    
    return (
        <Animated.View style = {[{width: optionWidth, marginHorizontal: spacing / 2, marginBottom: 20 }, animatedStyle]}>
            <Pressable
                onPressIn={() => {
                    setHovered(true);
                    scale.value = withSpring(0.96); // la apăsare
                  }}
                  onPressOut={() => {
                    setHovered(false);
                    scale.value = withSpring(1); // la ridicare
                  }}            
                onPress={handlePress}
                style={{
                borderColor: isSelected ? '#5C2C1D' : '#e6d8cc',
                borderWidth: 2,
                backgroundColor: isSelected
                    ? '#f4e9dd'
                    : hovered
                    ? '#f2e6db'
                    : '#fff',
                borderRadius: 20,
                alignItems: 'center',
                padding: 20,
                shadowColor: isSelected ? '#000' : 'transparent',
                shadowOpacity: isSelected ? 0.1 : 0,
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 5,
                elevation: isSelected ? 3 : 0,
                }}
            >
                <Text
                    style={{
                        fontSize: 26,
                        marginBottom: 6,
                        color: '#5C2C1D',
                    }}>
                    {emoji}
                </Text>

                <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#5C2C1D',
                    textAlign: 'center',
                }}
                >
                    {name}
                </Text>

            </Pressable>
        </Animated.View>
    )
}