import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftCircleIcon } from 'react-native-heroicons/solid';
import FoodCard from '../components/foodCard';
import { fetchRecipesByCategory } from '../api/spoonacular';

export default function CategoryScreen({ route }) {
  const { category } = route.params;
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadRecipes = async () => {
    setLoading(true);
    const newRecipes = await fetchRecipesByCategory(category, 10, offset);
    console.log(`Load more pentru ${category}, offset ${offset}`);
    newRecipes.forEach((recipe, index) => {
      console.log(`${offset + index + 1}. ${recipe.name} — categorie: ${recipe.category}`);
    });
    const combined = [...recipes, ...newRecipes];
    const uniqueRecipes = Array.from(new Map(combined.map(item => [item.id, item])).values());

    const ids = combined.map(r => r.id);
    const hasDuplicates = new Set(ids).size !== ids.length;
    console.log('🔍 Duplicate IDs?', hasDuplicates);

    setRecipes(uniqueRecipes);
    setOffset((prev) => prev + 10);
    setLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="large" color="#5C2C1D" style={{ marginVertical: 16 }} />;
  };

  return (
    <View className="flex-1 bg-[#f8ede3]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-4">
        <View className="mx-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-3xl font-bold text-[#5C2C1D] mb-4 mt-4 text-center capitalize">
          {category} Recipes
        </Text>

        <FlatList
          data={recipes}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Recipe', { ...item })}
              style={{
                flex: 1,
                margin: 12,
                maxWidth: '48%',
                marginTop: 20,
              }}
            >
              <FoodCard item={item} size="small" />
            </TouchableOpacity>
          )}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 80, paddingTop: 20 }}
          onEndReached={loadRecipes}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </SafeAreaView>
    </View>
  );
}
