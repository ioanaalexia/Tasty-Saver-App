import React, {useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {recognizeIngredients} from '../services/ingredientRecognitionService';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import { ArrowLeftCircleIcon } from 'react-native-heroicons/outline';
import { recognizeIngredientsFromImage } from '../services/ingredientRecognitionService';
import { CameraIcon } from 'react-native-heroicons/outline';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import {db, auth} from '../firebase';
import {collection, addDoc} from 'firebase/firestore';
import { INGREDIENT_NAME_MAP } from '../constants/ingredientNameMap';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import { showToast } from '../components/toast';

export default function CameraScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));


  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permisiune la galerie refuzată!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setIngredients([]);
    }
  };

  const handleRecognizeIngredients = async () => {
    if (!imageUri) {
      alert('Te rog să încarci o poză!');
      return;
    }
  setIsLoading(true);
  try {
    const result = await recognizeIngredientsFromImage(imageUri);
    setIngredients(result.ingredients);
  } catch (err) {
    console.error('Eroare la recunoaștere ingrediente:', err);
    alert('Eroare la recunoaștere ingrediente!');
  }
  setIsLoading(false);
};

  const addIngredientsToInventory = async (ingredients) =>{
    const user = auth.currentUser;
    if (!user){
      alert('You have to be signed in to add ingredients to your inventory.');
      return;
    }
    try{
      for(const ingredient of ingredients){
        const goodName= INGREDIENT_NAME_MAP[ingredient] || ingredient;
        await addDoc(collection(db, 'inventory'),{
          userId: user.uid,
          name: goodName,
          quantity:1,
          unit:'',
          expirationDate:'',
          addedAt: new Date().toISOString(),
        });
      }
      showToast('Ingredients added to inventory!');
    } catch (error) {
      console.error('Error adding ingredients to inventory:', error);
      alert('Error adding ingredients to inventory!');
    }
  }

 return (
  <ScrollView contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 16, paddingTop: 96, paddingBottom: 40 }} className="bg-white">
      {/* Back button */}
      <View className="absolute top-10 left-4 z-10 pt-11">
        <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Home' })}>
          <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="#5C2C1D" />
        </TouchableOpacity>
      </View>

      <Text 
            className="text-[#5C2C1D] font-bold mb-6 pl-9"
            style={{ fontSize: 24 }}
      >
        Not sure what to cook?
      </Text>

      {imageUri ? (
        <>
          <Image
            source={{ uri: imageUri }}
            className="w-64 h-64 rounded-2xl mb-6"
          />

          {ingredients.length === 0 && (
            <TouchableOpacity
              onPress={handleRecognizeIngredients}
              className="bg-[#996A65] rounded-full py-4 px-8 mb-4"
            >
              <Text className="text-white text-lg font-semibold">
                Scan
              </Text>
            </TouchableOpacity>
          )}

          {isLoading && (
            <ActivityIndicator
              size="large"
              color="#5C2C1D"
              className="mt-3"
            />
          )}

          {ingredients.length > 0 && (
            <View className="mt-6 w-full">
              <Text className="font-bold text-[#5C2C1D] mb-2">
                Ingredients:
              </Text>
              {ingredients.map((item, idx) => (
                <Text key={idx} className="text-[#7e453e] text-base mb-1">
                  • {INGREDIENT_NAME_MAP[item] || item}
                </Text>
              ))}

              {/* Buton pentru generare retete */}
              <TouchableOpacity
                onPress={() => {
                      const mappedIngredients = ingredients.map(item => INGREDIENT_NAME_MAP[item] || item);
                      console.log('Ingrediente trimise către AI:', mappedIngredients);
                      navigation.navigate('SuggestedRecipesScreen', { source: 'camera', mappedIngredients })}
                }
                className="flex-row items-center justify-center bg-[#9CBB72] rounded-full py-4 px-8 mt-6 shadow-lg"
              >
                <MaterialCommunityIcons name="chef-hat" size={22} color="#5C2C1D" style={{ marginRight: 10 }} />
                <Text className="text-[#5C2C1D] text-lg font-semibold text-center">
                  Find Recipes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => addIngredientsToInventory(ingredients)}
                className="flex-row items-center justify-center bg-[#9CBB72] rounded-full py-4 px-8 mt-3 shadow"
              >
                <MaterialCommunityIcons name="basket-plus-outline" size={22} color="#5C2C1D" style={{ marginRight: 10 }} />
                <Text className="text-[#5C2C1D] text-lg font-semibold">
                  Add them to your inventory
                </Text>
              </TouchableOpacity>

              {/* Buton pentru a incarca alta poza */}
              <TouchableOpacity
                onPress={() => {
                  setImageUri(null);
                  setIngredients([]);
                }}
                className="bg-[#bfa098] rounded-full py-4 px-8 mt-6"
              >
                <Text className="text-[#5C2C1D] text-lg font-semibold">
                  Upload another picture!
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <>
          {/* Animated camera icon */}
          <Animated.View style={[{ marginBottom: 24 }, animatedStyle]}>
            <CameraIcon size={54} color="#7e453e" strokeWidth={1.5} />
          </Animated.View>

          <TouchableOpacity
            onPress={pickImageFromGallery}
            className="bg-[#996A65] rounded-full py-4 px-8"
          >
            <Text className="text-white text-lg font-semibold">Upload a picture</Text>
          </TouchableOpacity>
          </>
      )}
    </ScrollView>
  );
}