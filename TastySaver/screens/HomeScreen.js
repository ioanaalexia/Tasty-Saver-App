import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { BellIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { categories } from '../constants/data';
import Carousel from 'react-native-snap-carousel';
import FoodCard from '../components/foodCard'; 
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ShoppingCartIcon } from 'react-native-heroicons/outline';
import { ActivityIndicator } from 'react-native';
import { fetchRecipesByCategory } from '../api/spoonacular';
import { getRecommendedRecipes } from '../services/recommendationService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('1');
  const [userName, setUserName] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const navigation = useNavigation();

   useEffect(() => {
    const loadCategoriesFromFirestore = async () => {
      try {
        const colRef = collection(db, 'categories');
        const snapshot = await getDocs(colRef);

        const cats = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          cats.push({
            id: docSnap.id,   
            title: data.title
          });
        });

        cats.sort((a, b) => Number(a.id) - Number(b.id));

        setCategories(cats);
        if (cats.length > 0) {
          setActiveCategory(cats[0].id);
        }
      } catch (err) {
        console.warn('Eroare la încarcarea categoriilor din Firestore:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategoriesFromFirestore();
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      if (isLoadingCategories) return;
      setIsLoading(true);
      setOffset(10);

      const categoryTitle = categories.find((c) => c.id === activeCategory)?.title.toLowerCase();
      
      if (activeCategory === '1') {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFavorites(docSnap.data().favoriteRecipes || []);
          }
        }
      } else if (activeCategory === '6') {
          console.log("=== BLOC RECOMANDARI (activeCategory==='6') ===");

        const user = auth.currentUser;
        if (user) {
          const docRef  = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();

            const favsFromDB = userData.favoriteRecipes || [];
            const dietDB      = userData.diet || "Standard";
            const favCuisines = userData.favouriteCuisines || [];

            const favoritesDetails = favsFromDB.map(r => ({
              title:       r.title || r.name,
              ingredients: Array.isArray(r.ingredients) 
                              ? r.ingredients 
                              : (typeof r.ingredients === "string"
                                  ? r.ingredients.split(/\s*,\s*/) 
                                  : []),
              cuisine:     (r.cuisine || r.category || "").toLowerCase()
            }));
            console.log("=== FAVORITE RECIPES DETAILS ===", favoritesDetails);

            const payload = {
              favorites: favoritesDetails,
              diet:      dietDB,
              cuisines:  favCuisines.map(c => c.toLowerCase())
            };

            console.log("→ Payload trimis către Flask:", payload);
            const recommendedRecipes = await getRecommendedRecipes(payload);
            console.log("← Am primit de la Flask:", recommendedRecipes);
            setRecipes(recommendedRecipes);
          }
        }
      }else {
        const results = await fetchRecipesByCategory(categoryTitle, 5, 0);
        setRecipes(results);
        results.forEach((recipe, index) => {
          console.log(`${index + 1}. ${recipe.name} — categorie: ${recipe.category}`);
        });
        setRecipes(results);
      }
  
      setIsLoading(false);
    };
  
    loadInitial();
  }, [activeCategory, isLoadingCategories, categories]);

  const loadMore = async () => {
    const catObj = categories.find((c) => c.id === activeCategory);
    const categoryTitle = catObj ? catObj.title.toLowerCase() : '';
    try {
      const more = await fetchRecipesByCategory(categoryTitle, 10, offset);
      setRecipes(prev => [...prev, ...more]);
      setOffset(prev => prev + 10);
    } catch (err) {
      console.warn('Eroare la loadMore:', err);
    }
  };


  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const user = auth.currentUser;
        if (!user) return;
  
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavorites(data.favoriteRecipes || []);
          setUserName(`${data.firstName || ''} ${data.lastName || ''}`.trim());
          setAvatarUrl(data.avatar || null);
        }
      };
  
      fetchUserData();
    }, [])
  );
  
  const handleSeeAll = () => {
    if (activeCategory === '1') {
      navigation.navigate('FavoritesScreen');
    } else if (activeCategory === '6') {
    navigation.navigate('RecommendationExpandedScreen');
    }else {
      const categoryTitle = categories.find((c) => c.id === activeCategory)?.title.toLowerCase();
      navigation.navigate('CategoryScreen', { category: categoryTitle });
    }
  };

  const handleSearch = () =>{
    if (searchText.trim().length > 0) {
      navigation.navigate('SearchScreen', { query: searchText.trim() });
    }
  }

  const filteredItems =
    activeCategory === '1'
      ? favorites
      : recipes;

  const renderCategory = ({ item }) => {
    const isActive = item.id === activeCategory;
    const activeTextClass = isActive ? 'text-white' : 'text-gray-700';

    return (
      <TouchableOpacity
        onPress={() => setActiveCategory(item.id)}
        style={{ backgroundColor: isActive ? '#996A65' : 'rgba(0,0,0,0.07)' }}
        className="p-4 px-5 rounded-full mr-2 shadow"
      >
        <Text className={"font-semibold " + activeTextClass}>{item.title}</Text>
      </TouchableOpacity>
    );

  };
  console.log("Categories primite în UI:", categories);


  return (
    <View className="flex-1 relative bg-white">
      <StatusBar />
      <Image
        source={require('../assets/food_app.jpg')}
        className="w-full absolute -top-5 opacity-10"
        style={{ height: 220 }}
      />

      <SafeAreaView className="flex-1">
      {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#5C2C1D" />
          </View>
        ) : (
          <>
        <View className="px-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require('../assets/picture.png')
              }
              style={{ width: 36, height: 36, borderRadius: 18 }}
          />
          </TouchableOpacity>
          
          <View className="flex-row items-center space-x-2">
            <MapPinIcon size="25" color="#5C2C1D" />
            <Text className="text-[#5C2C1D] text-lg font-semibold"> Hello {userName ? `, ${userName}!` : '!'} </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ShoppingListScreen')}>
            <ShoppingCartIcon size={27} color="black" />
          </TouchableOpacity>
        </View>

        <View className="mx-5 mt-14">
              <View className="flex-row justify-center items-center rounded-full p-1 bg-[#e6e6e6]">
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search recipes..."
                  className="p-4 flex-1 font-semibold text-gray-700"
                />
                <TouchableOpacity
                  className="rounded-full p-2"
                  style={{ backgroundColor: "#5C2C1D" }}
                  onPress={handleSearch}
                >
                  <MagnifyingGlassIcon size="25" strokeWidth={2} color="white" />
                </TouchableOpacity>
              </View>
            </View>


        <View className="px-5 mt-6">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            className="overflow-visible"
            renderItem={renderCategory}
          />
        </View>

        <View className="mt-16 py-2">
        {filteredItems.length > 0 ? (
          <Carousel
            containerCustomStyle={{ overflow: 'visible' }}
            data={filteredItems}
            loop={true}
            renderItem={({ item }) => 
            <FoodCard item={item}
              targetScreen={item.source === 'AI' ? 'RecipeGeneratedScreen' : 'Recipe'}
            />}
            firstItem={1}
            inactiveSlideOpacity={0.75}
            inactiveSlideScale={0.77}
            sliderWidth={400}
            itemWidth={260}
            slideStyle={{ display: 'flex', alignItems: 'center' }}
          />
        ) : (
          <View className="items-center justify-center mt-10 px-6">
            <Text className="text-3xl text-[#5C2C1D] font-semibold text-center mb-2">
              Nothing to show
            </Text>
            <Text className="text-base text-[#7e453e] text-center">
              There are no recipes in this category right now.
            </Text>
          </View>
        )}

        {(activeCategory === '1' && favorites.length > 0) || (activeCategory !== '1') ? (
          <TouchableOpacity
                onPress={handleSeeAll}
                style={{
                  backgroundColor: '#5C2C1D',
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  alignSelf: activeCategory === '1' ? 'flex-end' : 'center',
                  marginRight: activeCategory === '1' ? 24 : 0,
                  marginTop: 10
                }}
              >
                <Text style={{ color: '#fff', fontFamily: 'RubikMedium', fontSize: 14 }}>
                  {activeCategory === '1' ? 'See all' : 'Load more'}
                </Text>
              </TouchableOpacity>
        ) : null}
        
        </View>
        </>
      )}
      </SafeAreaView>
    </View>
  );
}
