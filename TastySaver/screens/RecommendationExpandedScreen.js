import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import FoodCard from '../components/foodCard';
import { ArrowLeftCircleIcon, MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import * as Animatable from 'react-native-animatable';
import { getRecommendedRecipes } from '../services/recommendationService';

export default function RecommendationExpandedScreen() {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const favsFromDB = userData.favoriteRecipes || [];
          const dietDB = userData.diet || 'Standard';

          const favoritesDetails = favsFromDB.map(r => ({
            title: r.title || r.name || '',
            ingredients: Array.isArray(r.ingredients)
              ? r.ingredients
              : typeof r.ingredients === 'string'
              ? r.ingredients.split(/\s*,\s*/)
              : [],
            cuisine: (r.cuisine || r.category || '').toLowerCase(),
          }));

          const payload = {
            favorites: favoritesDetails,
            diet: dietDB,
            cuisines: [],
            strictCuisine: false,
          };

          const recs = await getRecommendedRecipes(payload);
          setRecipes(recs);
          setFilteredRecipes(recs);
        }
      }
      setIsLoading(false);
    };

    fetchRecommendations();
  }, []);

  useEffect(() => {
    const filtered = recipes.filter((item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
  }, [searchTerm, recipes]);

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
          More Recommendations
        </Text>

        <View className="bg-white p-3 rounded-full shadow-md mb-4 flex-row items-center">
          <MagnifyingGlassIcon size={20} color="#80453F" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search recommendations..."
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
        ) : filteredRecipes.length === 0 ? (
          <Text className="text-[#7e453e] text-base text-center">
            No recommended recipes found.
          </Text>
        ) : (
          <Animatable.View animation="fadeInUp" duration={500} style={{ flex: 1 }}>
            <FlatList
              data={filteredRecipes}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
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
                    item={item}
                    size="small"
                    targetScreen={item.source === 'AI' ? 'RecipeGeneratedScreen' : 'Recipe'}
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
