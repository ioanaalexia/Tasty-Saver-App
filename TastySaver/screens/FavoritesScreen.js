import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import FoodCard from '../components/foodCard';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ArrowLeftCircleIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import { TextInput } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { ActivityIndicator } from 'react-native';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFavorites(data.favoriteRecipes || []);
      }
      setIsLoading(false);
    };

    fetchFavorites();
  }, [])
);

  return (
    <View className="flex-1 bg-[#f8ede3]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-4">
      <View className="mx-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="#5C2C1D" />
          </TouchableOpacity>
        </View>
        
        <Text
          className="text-3xl font-bold text-[#5C2C1D] mb-4 mt-4 text-center"
        >
          Your Favorite Recipes
        </Text>

        <View className="bg-white p-3 rounded-full shadow-md mb-4 flex-row items-center">
          <MagnifyingGlassIcon size={20} color="#80453F" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search your favorites..."
            className="text-[#5C2C1D] text-base flex-1"
            style={{ paddingHorizontal: 10 }}
            onChangeText={(text) => handleSearch(text)}
          />
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#5C2C1D" />
          </View>
        ) : favorites.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-12">
            <Text className="text-3xl text-[#5C2C1D] font-semibold text-center mb-2">
              No favorites yet
            </Text>
            <Text className="text-base text-[#7e453e] text-center px-6">
              Save your most loved recipes here so you can find them later!
            </Text>
          </View>
        ) : (
          <Animatable.View animation="fadeInUp" duration={500} style={{ flex: 1 }}>
          <FlatList
            data={favorites}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                //onPress={() => navigation.navigate('Recipe', { ...item })}
                style={{
                  flex: 1,
                  margin: 12,
                  maxWidth: '48%',
                  marginTop: 20,
                }}
              >
                <FoodCard item={item} size="small" 
                  targetScreen={item.source === 'AI' ? 'RecipeGeneratedScreen' : 'Recipe'}
                />
              </TouchableOpacity>
            )}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingBottom: 80, paddingTop: 20 }}
          />
          </Animatable.View>
        )}
      </SafeAreaView>
    </View>
  );
}
