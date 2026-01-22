import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeftCircleIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { db, auth } from '../firebase';
import { collection, doc, getDocs, getDoc, query, where, updateDoc, increment } from 'firebase/firestore';
import { generateRecipesWithAI } from '../services/aiServices';
import FoodCard from '../components/foodCard';
import { INGREDIENT_NAME_MAP } from '../constants/ingredientNameMap';
import { useRoute } from '@react-navigation/native';

export default function SuggestedRecipesScreen() {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);

  const route = useRoute();
  const fromCamera = route.params?.source === 'camera';
  const cameraIngredients = route.params?.mappedIngredients || [];
  console.log("Ingredientele de la AI", cameraIngredients );

  const fetchIngredients = async () => {
    const user = auth.currentUser;
    if (!user) return { ingredientsWithQty: [], namesOnly: [] };

    try {
      const q = query(collection(db, 'inventory'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      const ingredientsWithQty = snapshot.docs.map((doc) => {
        const { quantity, unit, name } = doc.data();
        return `${quantity}${unit} ${name}`;
      });

      const namesOnly = snapshot.docs.map((doc) => doc.data().name);
      return { ingredientsWithQty, namesOnly };
    } catch (error) {
      console.error('Eroare la fetchIngredients:', error);
      return { ingredientsWithQty: [], namesOnly: [] };
    }
  };

  const fetchUserDiet = async () => {
    const user = auth.currentUser;
    if(!user) return 'Standard';

    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return docSnap.data().diet || 'Standard';
    }
    return 'Standard';
  }

  const incrementRecipeCount = async () => {
    const user = auth.currentUser;
    if(!user) return ;

    const userRef = doc(db, 'users', user.uid);

    await updateDoc(userRef, {
      recipesGenerated: increment(3),
    })
  }

    useEffect(() => {
    const load = async () => {
      try {
        let toUseIngredients, inventoryForDisplay;
        let diet = await fetchUserDiet();

        if (fromCamera && cameraIngredients.length) {
          toUseIngredients = cameraIngredients;
          inventoryForDisplay = cameraIngredients;
        } else {
          const { ingredientsWithQty, namesOnly } = await fetchIngredients();
          toUseIngredients = ingredientsWithQty;
          inventoryForDisplay = namesOnly;
        }

        setInventory(inventoryForDisplay);

        if (!toUseIngredients.length) {
          setRecipes([]);
        } else {
          const result = await generateRecipesWithAI(toUseIngredients, diet);
          setRecipes(result);
          await incrementRecipeCount();
        }
      } catch (error) {
        console.error('Eroare generare rețete:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  return (
    <View className="flex-1 bg-[#f8ede3]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-4">
        <View className="relative flex-row items-center justify-center mt-3 h-12">
            <TouchableOpacity onPress={() => navigation.goBack()} className="absolute left-0">
              <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="#5C2C1D" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-[#5C2C1D]">Suggested Recipes</Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#5C2C1D" />
          </View>
        ) : recipes.length === 0 ? (
          <Text className="text-[#7e453e] text-base text-center">No suggestions available.</Text>
        ) : (
          <Animatable.View animation="fadeInUp" duration={500} style={{ flex: 1 }}>
            <FlatList
              data={recipes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    flex: 1,
                    margin: 12,
                    maxWidth: '48%',
                    marginTop: 20,
                  }}
                >
                  <FoodCard
                    item={{
                      name: item.name,
                      image: null,
                      rating: 'AI',
                      desc: item.desc,
                      ingredients: item.ingredients ?? [],
                      instructions: item.instructions ?? [] 
                    }}
                    inventory={inventory} 
                    size="small"
                    targetScreen= "RecipeGeneratedScreen"
                  />
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
