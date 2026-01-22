import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import {StarIcon, PlusIcon} from 'react-native-heroicons/solid'
import {Shadow} from 'react-native-shadow-2';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function FoodCard({ item, size = "default", targetScreen = "Recipe", inventory }) {
  const isSmall = size === "small";
  const navigation = useNavigation();
  return (
  <Shadow
      distance={10}
      offset={[0, 6]}
      startColor="rgba(110, 75, 71, 0.67)"
      containerStyle={{ borderRadius: 40 }}
    >
    <View
      style={{
        borderRadius: 40,
        backgroundColor: '#80453F',
        height: isSmall ? 250 : 350,
        width: isSmall ? 160 : 250
      }}
      className="p-5"
    >

      <View style={{
        shadowColor: 'black',
        shadowRadius: 30,
        shadowOffset:{width:0, height:40},
        shadowOpacity: 0.8
      }}
      className="flex-row justify-center -mt-14"
      >
        <Image
          source={typeof item.image === 'string' ? { uri: item.image } : item.image}
          className={isSmall ? 'w-20 h-20 rounded-full' : 'w-28 h-28 rounded-full'}
        />

      </View>
      <View className="flex-1 px-1 mt-5 justify-between">
      <Text
        className={`${isSmall ? 'text-xl' : 'text-3xl'} text-white font-semibold z-10`}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {item.name || item.title}
      </Text>

        <View style={{backgroundColor:'rgba(255, 255, 255, 0.2)'}}
              className="flex-row items-center rounded-3xl p-1 px-2 space-x-1 w-16"
        >
          <StarIcon size="15" color="white"/>

          <Text className={`${isSmall ? 'text-sm' : 'text-base'} font-semibold text-white`}>
            {item.rating}
          </Text>
        </View>
        <View className="flex-row space-x-1 z-10 mb-6">
        <Text className={`${isSmall ? 'text-sm' : 'text-base'} text-white font-semibold opacity-60`}>
          Volume
        </Text>

        <Text className={`${isSmall ? 'text-sm' : 'text-base'} text-white font-semibold`}>
          {item.volume}
        </Text>
        </View>

        <View style={{
          backgroundColor: '#80453F',
          shadowColor: 'black',
          shadowRadius: 25,
          shadowOffset: { width: 0, height: 40 },
          shadowOpacity: 0.8,
          elevate: 10,
          gap:102,
        }}
          className="flex-row justify-between items-center"
        >
          {/* <Text className="text-white font-bold text-lg">{item.price}</Text> */}
          <TouchableOpacity
            onPress={() => navigation.navigate(targetScreen, {...item,  ...(inventory ? { inventory } : {})
          })}
            style={{
              shadowColor: 'black',
              shadowRadius: 40,
              shadowOffset: { width: -20, height: -10 },
              shadowOpacity: 1,
              elevation: 10,
            }}
            className="p-4 bg-white rounded-full"
          >
            <PlusIcon size="25" strokeWidth={2} color="black"/>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Shadow>
  )
}