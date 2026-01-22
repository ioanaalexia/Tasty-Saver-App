import React, {useMemo} from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import { ArrowLeftCircleIcon } from 'react-native-heroicons/outline';
import { TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const ecoTips = [
  {
    title: 'Reduce Food Waste',
    description: 'Plan your meals and use leftovers creatively to minimize food waste.',
  },
  {
    title: 'Buy Local Produce',
    description: 'Support local farmers by purchasing seasonal fruits and vegetables.',
  },
  {
    title: "Wrap greens in a paper towel",
    description: "Store lettuce and leafy greens wrapped in a slightly damp paper towel to help them last longer in the fridge.",
  },
  {
   title: "Don’t wash fruits before storing",
    description: "Wash fruits just before eating, not before storing, to prevent them from spoiling quickly due to moisture.",
  },
  {
    title: "Store herbs in water",
    description: "Keep herbs fresh by storing them upright in a glass of water in the fridge.",
  },
  {
    title: "Use FIFO: First In, First Out",
    description: "Move older foods to the front of the fridge or pantry and consume them first to reduce waste.",
  },
  {
    title: "Smart freezing",
    description: "Freeze leftovers or bread in small portions to avoid throwing away excess food.",
  },
  {
    title: "Plan your shopping",
    description: "Write a shopping list and avoid buying food you already have at home.",
  },
  {
    title: "Compost your food scraps",
    description: "Fruit and vegetable scraps can become natural fertilizer for your plants.",
  }
];

export default function EcoAwarenessScreen(){
    const navigation = useNavigation();

    const randomTip = useMemo(() => {
        const idx = Math.floor(Math.random() * ecoTips.length);
        return ecoTips[idx];
    }, []);

    return (
        <View className="flex-1 bg-[#f8ede3]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-6 mb-2">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon size={44} strokeWidth={1.2} color="#5C2C1D" />
          </TouchableOpacity>
          <Text className="ml-3 text-2xl font-extrabold text-[#5C2C1D]" style={{ fontFamily: 'Pacifico' }}>
            Eco Tips
          </Text>
          <Text className="ml-2 text-2xl">🌱</Text>
        </View>

        {/* Centrare carduri */}
        <View className="flex-1 justify-center items-center">
          {/* Awareness Card */}
          <View
            className="bg-white rounded-3xl px-7 py-10 w-[85%] max-w-[330px] shadow-xl"
            style={{
              elevation: 14,
              shadowColor: "#5C2C1D",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.20,
              shadowRadius: 30,
            }}
          >
            <View className="flex-row items-center justify-center mb-2">
              <Text className="text-3xl">♻️</Text>
            </View>
            <Text className="text-[#5C2C1D] font-black text-lg text-center mb-2" style={{ fontFamily: 'RubikMedium' }}>
              Food waste = waste of resources, money, and energy!
            </Text>
            <Text className="text-[#7e453e] text-base text-center leading-relaxed">
              Did you know? <Text className="font-semibold">Globally, about one third</Text> of all food produced is lost or wasted every year.
              By planning meals, using leftovers, and storing food correctly, you can make a real impact. <Text className="font-semibold">Every small step counts towards a more sustainable world!</Text>
            </Text>
          </View>
            <View style={{ height: 36 }} />

          <View
            className="bg-white rounded-3xl px-7 py-10 w-[85%] max-w-[330px] shadow-xl"
            style={{
              elevation: 14,
              shadowColor: "#5C2C1D",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.20,
              shadowRadius: 30,
            }}
          >
            <View className="flex-row items-center mb-2">
              <Text className="text-3xl mr-3">{randomTip.emoji}</Text>
              <Text className="text-[#5C2C1D] font-bold text-lg" style={{ fontFamily: 'RubikMedium' }}>
                Eco Tip of the Day
              </Text>
            </View>
            <Text className="text-[#5C2C1D] font-semibold text-base mb-1">
              {randomTip.title}
            </Text>
            <Text className="text-[#7e453e] text-base">{randomTip.description}</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
    )
}