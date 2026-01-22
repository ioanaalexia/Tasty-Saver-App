import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { fetchRecipeDetails } from '../api/spoonacular';

import {
  ArrowLeftCircleIcon,
  HeartIcon as HeartOutline
} from 'react-native-heroicons/outline';

import AnimatedButton from '../components/AnimatedButton';
import {auth, db} from '../firebase';
import {doc, getDoc, updateDoc, arrayUnion, arrayRemove} from 'firebase/firestore'
import Toast from 'react-native-root-toast';
import { HeartIcon as HeartSolid } from 'react-native-heroicons/solid';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { showToast } from '../components/toast';

export default function RecipeScreen(props) {
  const item = props.route.params;
  const navigation = useNavigation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInMealPlan, setIsInMealPlan] = useState(false);

  const [nutrition, setNutrition] = useState({
    calories: 'N/A',
    proteins: 'N/A',
    fat: 'N/A',
    carb: 'N/A',
    ingredients: [],
    instructions: [],
  })

  useEffect(() => {
    const checkIfFavorite = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const favorites = docSnap.data().favoriteRecipes || [];
        const found = favorites.find((r) => r.id === item.id);
        setIsFavorite(!!found);
      }
    };

    const getDetails = async () =>{
      setIsLoading(true);
      const data = await fetchRecipeDetails(item.id);
      setNutrition(data);
      setIsLoading(false);
    };

    checkIfFavorite();
    getDetails();
  }, []);
  
  const addToFavourites = async()=>{
    const user = auth.currentUser;
    if(!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const recipeData = {
      id: String(item.id),
      name: item.name || '',
      price: item.price || '',
      volume: item.volume || '',
      ingredients: nutrition.ingredients || [],
      cuisine:     item.category || '',
      image: item.image || null,
      rating: item.rating || '',
      desc: item.desc || '',
      category: item.category || ''
    };

    try {
      await updateDoc(userRef, {
        favoriteRecipes: isFavorite
          ? arrayRemove(recipeData)
          : arrayUnion(recipeData),
      });
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  const addToMealPlan = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const recipeData = {
    id: String(item.id),
    name: item.name || '',
    ingredients: nutrition.ingredients || [],
    image: item.image || null,
  };

  await updateDoc(userRef, {
    mealPlanRecipes: arrayUnion(recipeData),
  });
  
  setIsInMealPlan(true);
  showToast("Recipe added to Meal Plan!", { duration: 1200 });
};

useEffect(() => {
    const checkInMealPlan = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const mealPlanRecipes = docSnap.data()?.mealPlanRecipes || [];
      const exists = mealPlanRecipes.some(r => r.name === item.name);
      setIsInMealPlan(exists);
    };
    checkInMealPlan();
  }, [item.name]);

  return (
    <ScrollView className="flex-1 bg-[#f8ede3]">
      <StatusBar style="light" />

      {isLoading ? (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#5C2C1D" />
      </View>
    ) : (
      <>
      <Image
        source={
          typeof item.image === 'string' ? { uri: item.image } : require('../assets/food_app.jpg')
        }
        style={{
          height: 300,
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
        }}
        className="w-full absolute"
      />

      <SafeAreaView className="space-y-4">
        <View className="mx-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-full border-2 border-white p-2"
            onPress={addToFavourites}
          >
            {isFavorite ? (
              <HeartSolid size={24} color="white" />
            ) : (
              <HeartOutline size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center h-60 w-60"></View>
      </SafeAreaView>

      <View className="px-6 pt-6" flex-1>
        <Text
                className="text-4xl text-center text-[#5C2C1D]"
                style={{
                  fontFamily: 'Pacifico',
                  lineHeight: 60,
                  }}
                  numberOfLines={0}
                  >
                {item.name || item.title}
          </Text>

        <View className="flex-row justify-between mb-4">
          {[
            { label: 'Calories', value: nutrition.calories },
            { label: 'Prot', value: nutrition.protein },
            { label: 'Fat', value: nutrition.fat },
            { label: 'Carbs', value: nutrition.carbs },
          ].map((el, index) => (
            <View
              key={index}
              className="items-center bg-[#9CBB72] rounded-2xl w-20 py-8 border border-[#5C2C1D]"
            >
              <Text className="text-[#5C2C1D] text-bold text-base">{el.value}</Text>
              <Text className="text-[#5C2C1D] text-xs">{el.label}</Text>
            </View>
          ))}
        </View>

        <Text className="text-lg font-semibold text-[#5C2C1D] mb-3" style={{ fontFamily: 'RubikMedium' }}>
          Ingredients:
        </Text>
        {nutrition.ingredients.length > 0 ? (
          nutrition.ingredients.map((ingredient, index) => (
            <View key={index} className="flex-row items-center mb-1">
              <Text className="text-[#5C2C1D] mr-2">•</Text>
              <Text className="text-[#7e453e]" style={{ fontFamily: 'RubikRegular' }}>
                {ingredient}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-[#7e453e] mb-6">Not available</Text>
        )}
        <Text className="text-lg font-semibold text-[#5C2C1D] mb-1" style={{ fontFamily: 'RubikMedium' }}>
          Preparation
        </Text>
        {nutrition.instructions && nutrition.instructions.length > 0 ? (
          nutrition.instructions.map((step, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <Text className="text-[#5C2C1D] mr-2">{index + 1}.</Text>
              <Text className="text-[#7e453e]" style={{ fontFamily: 'RubikRegular' }}>
                {step}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-[#7e453e] mb-6">No preparation steps provided.</Text>
        )}


        <View style= {{ marginBottom: 20 }}>
          <View style= {{ marginBottom: 20 }}>
          <AnimatedButton
            label={isInMealPlan ? "Bon appétit, it's planned!": "Add to meal plan"}
            onPress={isInMealPlan ? null: addToMealPlan}
            disabled={isInMealPlan}
          />
        </View>
        </View>
      </View>
      </>
    )}
    </ScrollView>
  );
}
