import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import FoodCard from '../components/foodCard';
import { ArrowLeftCircleIcon, MagnifyingGlassIcon, TrashIcon } from 'react-native-heroicons/solid';
import * as Animatable from 'react-native-animatable';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function MealPlanScreen() {
  const navigation = useNavigation();
  const [mealPlan, setMealPlan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMealPlan = useCallback(async () => {
    setIsLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setMealPlan(docSnap.data().mealPlanRecipes || []);
    }
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMealPlan();
    }, [fetchMealPlan])
  );

  const filteredMealPlan = mealPlan.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeFromMealPlan = async (item) => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        mealPlanRecipes: arrayRemove(item),
      });
      setMealPlan((prev) => prev.filter((r) => r.id !== item.id));
    } catch (err) {
      console.error('Eroare la stergere din meal plan:', err);
    }
  };

  return (
    <View className="flex-1 bg-[#f8ede3]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-4">
        <View className="mx-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="#5C2C1D" />
          </TouchableOpacity>
        </View>

        <Text className="text-3xl font-bold text-[#5C2C1D] mb-4 mt-4 text-center">
          Your Meal Plan
        </Text>

        <View className="bg-white p-3 rounded-full shadow-md mb-4 flex-row items-center">
          <MagnifyingGlassIcon size={20} color="#80453F" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search your meal plan..."
            className="text-[#5C2C1D] text-base flex-1"
            style={{ paddingHorizontal: 10 }}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#5C2C1D" />
          </View>
        ) : filteredMealPlan.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-12">
            <Text className="text-3xl text-[#5C2C1D] font-semibold text-center mb-2">
              Your meal plan is empty
            </Text>
            <Text className="text-base text-[#7e453e] text-center px-6">
              Start exploring delicious recipes and add them here to plan your week!
            </Text>
          </View>
        ) : (
          <Animatable.View animation="fadeInUp" duration={500} style={{ flex: 1 }}>
            <FlatList
              data={filteredMealPlan}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    flex: 1,
                    margin: 12,
                    maxWidth: '48%',
                    marginTop: 20,
                    position: 'relative',
                  }}
                >
                  <FoodCard
                    item={item}
                    size="small"
                    targetScreen={item.source === 'AI' ? 'RecipeGeneratedScreen' : 'Recipe'}
                  />
                  <TouchableOpacity
                    onPress={() => removeFromMealPlan(item)}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: '#fff',
                      borderRadius: 999,
                      padding: 4,
                      elevation: 3,
                    }}
                  >
                    <TrashIcon size={18} color="#80453F" />
                  </TouchableOpacity>
                </View>
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
