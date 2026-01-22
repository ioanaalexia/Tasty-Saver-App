import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftCircleIcon} from 'react-native-heroicons/solid';
import { HeartIcon as HeartOutline } from 'react-native-heroicons/outline';
import { HeartIcon as HeartSolid } from 'react-native-heroicons/solid';
import AnimatedButton from '../components/AnimatedButton';
import { showToast } from '../components/toast';
import { auth, db } from '../firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, getDoc, query, where, getDocs } from 'firebase/firestore';
import { INGREDIENT_NAME_MAP } from '../constants/ingredientNameMap';
import {increment} from 'firebase/firestore';

export default function RecipeGeneratedScreen({ route }) {
  const navigation = useNavigation();
  const { name, ingredients, instructions, inventory = [] } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [localInventory, setLocalInventory] = useState([]);
  const [isInMealPlan, setIsInMealPlan] = useState(false);

 const toggleFavorite = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    const favoriteRecipes = docSnap.data()?.favoriteRecipes || [];

    const exists = favoriteRecipes.some((r) => r.name === name);

    if (exists) {
      const toRemove = favoriteRecipes.find(r => r.name === name);
      await updateDoc(userRef, {
        favoriteRecipes: arrayRemove(toRemove)
      });
      setIsFavorite(false);
    } else {
      const newRecipe = {
        name,
        ingredients,
        instructions,
        source: 'AI',
        createdAt: new Date().toISOString()
      };
      await updateDoc(userRef, {
        favoriteRecipes: arrayUnion(newRecipe)
      });
      setIsFavorite(true);
    }
  } catch (err) {
    console.error('Eroare la gestionarea favoritei:', err);
  }
};

useEffect(() => {
  const checkFavorite = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    const favoriteRecipes = docSnap.data()?.favoriteRecipes || [];

    const exists = favoriteRecipes.some((r) => r.name === name);
    setIsFavorite(exists);
  };
  checkFavorite();
}, []);


useEffect(() => {
    async function fetchInventory() {
      const user = auth.currentUser;

      if (user) {
        const q = query(
          collection(db, 'inventory'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const namesOnly = snapshot.docs.map(doc => doc.data().name.toLowerCase());
        setLocalInventory(namesOnly);
      }
    }
    if (!inventory || inventory.length === 0) {
      fetchInventory();
    }
  }, []);

const addToMealPlan = async () => {
  const user = auth.currentUser;

  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);

    const ingredientInInventory = ingredients.filter(item => {
      return normalizedInventory.some(invItem => item.toLowerCase().includes(invItem.toLowerCase()));
    });
    
    const newRecipe = {
      name,
      ingredients,
      instructions,
      source: 'AI',
      createdAt: new Date().toISOString()
    };

    await updateDoc(userRef, {
      mealPlanRecipes: arrayUnion(newRecipe),
      wasteReduced: increment(ingredientInInventory.length)
    });
    setIsInMealPlan(true);
    showToast("Recipe added to meal plan!", { duration: 1200 });
  } catch (err) {
    console.error('Eroare la adăugarea în meal plan:', err);
  }
};

  useEffect(() => {
    const checkInMealPlan = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const mealPlanRecipes = docSnap.data()?.mealPlanRecipes || [];
      const exists = mealPlanRecipes.some(r => r.name === name);
      setIsInMealPlan(exists);
    };
    checkInMealPlan();
  }, [name]);

const normalizedInventory = (
    inventory && inventory.length > 0
      ? inventory.map(item => item.toLowerCase())
      : localInventory
  );
 console.log(localInventory);

  return (
    <ScrollView className="flex-1 bg-[#f8ede3]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-4 pt-6">
        <View className="mb-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="#5C2C1D" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFavorite}
            className="rounded-full border-2 border-[#5C2C1D] p-2 bg-[#f8ede3s]"
          >
            {isFavorite ? (
              <HeartSolid size={28} color="#5C2C1D" />
            ) : (
              <HeartOutline size={28} color="#5C2C1D" />
            )}
          </TouchableOpacity>


        </View>

        <View className="mt-7 px-4">
            <Text
                className="text-5xl text-center text-[#5C2C1D]"
                style={{
                fontFamily: 'Pacifico',
                lineHeight: 60,
                }}
                numberOfLines={0}
            >
                {name}
            </Text>
        </View>

        <Text className="text-lg font-semibold text-[#5C2C1D] mb-2">Ingredients:</Text>
        {ingredients.map((item, index) => {
          let showRed = Array.isArray(inventory) && inventory.length > 0;
          let referenceInventory = showRed ? inventory.map(i => i.toLowerCase()) : [];

          const aiIngredient = item.toLowerCase();
          const hasIngredient = showRed
            ? referenceInventory.some(invItem => aiIngredient.includes(invItem))
            : true;
          
          return (
            <Text
              key={index}
              className="text-[#7e453e] mb-1"
              style={{ color: hasIngredient ? '#7e453e' : 'red' }}
            >
              • {INGREDIENT_NAME_MAP[item] || item}
            </Text>
          );
        }
        )}

        <Text className="text-lg font-semibold text-[#5C2C1D] mt-6 mb-2">Preparation:</Text>
        {instructions.map((step, index) => (
          <Text key={index} className="text-[#7e453e] mb-2">
            {index + 1}. {step}
          </Text>
        ))}

        <View style= {{ marginBottom: 20 }}>
          <AnimatedButton
            label={isInMealPlan ? "Bon appétit, it's planned!": "Add to meal plan"}
            onPress={isInMealPlan ? null: addToMealPlan}
            disabled={isInMealPlan}
            style={{
              backgroundColor: isInMealPlan ? "#bbb" : "#5C2C1D",
            }}
          />
        </View>

      </SafeAreaView>
    </ScrollView>
  );
}
