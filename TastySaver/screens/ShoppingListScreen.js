import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftCircleIcon, CheckCircleIcon } from 'react-native-heroicons/solid';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ShoppingListScreen() {
  const navigation = useNavigation();
  const [ingredients, setIngredients] = useState([]);
  const [checked, setChecked] = useState({});

  function parseIngredient(ingredientString) {
  const match = ingredientString.match(/^(\d+\/\d+|\d+\.\d+|\d+)?\s*([a-zA-Z]+)?\s*(.+)$/);
  if (!match) return { amount: '', unit: '', name: ingredientString };

  let [, amount, unit, rest] = match;
  amount = amount ? amount.trim() : '';
  unit = unit ? unit.trim() : '';
  let name = rest;
  name = name.replace(/\(.*?\)/g, '').replace(/ to taste/gi, '').replace(/ finely chopped/gi, '').replace(/,.*$/, '').trim();
  return { amount, unit, name };
}

  const fetchIngredients = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    const mealPlan = docSnap.data().mealPlanRecipes || [];
    const allIngredients = new Set();
    mealPlan.forEach(recipe => {
      (recipe.ingredients || []).forEach(ing => {
        
        if (typeof ing === 'object' && ing.name) {
          allIngredients.add(ing.name);
        } else {
          allIngredients.add(ing);
        }
      });
    });
    setIngredients([...allIngredients]);
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const toggleChecked = (item) => {
    setChecked(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  return (
    <View className="flex-1 bg-[#f8ede3]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-4 pt-6">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="#5C2C1D" />
          </TouchableOpacity>
          <Text className="text-2xl ml-6 font-bold text-[#5C2C1D]">Shopping List</Text>
        </View>

        {ingredients.length === 0 ? (
          <Text className="text-[#7e453e] mt-10">No ingredients found in your meal plan.</Text>
        ) : (
          <FlatList
            data={ingredients}
            keyExtractor={(item, idx) => item + idx}
            renderItem={({ item }) => {
            const { amount, unit, name } = parseIngredient(item);
            return(
              <TouchableOpacity
                onPress={() => toggleChecked(item)}
                className={`flex-row items-center rounded-2xl px-5 py-3 mb-2 shadow 
                  ${checked[item] ? "bg-[#ead9c4]" : "bg-white"}`}
                style={{
                  elevation: checked[item] ? 2 : 0
                }}
              >
               <CheckCircleIcon
                  size={26}
                  color={checked[item] ? "#5C2C1D" : "#ccc"}
                  className="mr-3"
                />
                 <Text className="text-base text-[#5C2C1D]">
                    {amount && `${amount} `}
                    {unit && `${unit} `}
                    {name}
                </Text>
              </TouchableOpacity>
            );
            }}
            contentContainerStyle={{ paddingBottom: 80, paddingTop: 16 }}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
