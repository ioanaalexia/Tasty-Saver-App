import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { logout } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-root-toast';
import {showToast} from '../components/toast';
import AnimatedButton from '../components/AnimatedButton';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
                   import { collection, getDocs } from 'firebase/firestore';
                                                                                                                                                   
export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const[loading, setLoading] = useState(true);
  const [cuisineEmojis, setCuisineEmojis] = useState({});
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      
      await logout();
      showToast('Signed out successfully 👋', 'info');

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }, 800);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };
  
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value}],
  }));

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log('No such document!');
          }
        } else {
          console.log('User not logged in!');
        }
        setLoading(false);
      };
  
      fetchUserData();
    }, [])
  );
  
  useEffect(() => {
    const fetchCuisineEmojis = async () => {
      const cuisinesSnapshot = await getDocs(collection(db, 'cuisines'));
      const emojiMap = {};

      cuisinesSnapshot.forEach(doc => {
        const data = doc.data();
        emojiMap[data.name] = data.emoji;
      });

      setCuisineEmojis(emojiMap);
    };

    fetchCuisineEmojis();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8ede3]">
        <ActivityIndicator size="large" color="#5C2C1D" />
      </View>
    );
  }

  function getLast7Weekdays() {
  const today = new Date();
  let days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

  return (
    <ScrollView className="flex-1 bg-[#ffffff] px-6 pt-20"
      contentContainerStyle={{ paddingBottom: 100 }}
      >
      <StatusBar style="dark" />

      <View className="items-center mb-6">
      <Image
        source={userData?.avatar ? { uri: userData.avatar } : require('../assets/picture.png')}
        style={{width: 128, height: 128, borderRadius: 64}}
        resizeMode="cover"
      />

      <Text
        className="text-2xl text-[#5C2C1D]"
        style={{ fontFamily: 'Pacifico' }}
      >
        {userData?.firstName} {userData?.lastName}
      </Text>

      <Text
        className="text-base text-[#7e453e]"
        style={{ fontFamily: 'RubikRegular' }}
      >
        {userData?.email}
      </Text>
     </View>

     <View className="bg-[#f8ede3] rounded-2xl p-4 mb-4 shadow">
        <Text className="text-[#5C2C1D] font-bold text-lg mb-2"
              style={{fontFamily: 'RubikMedium'}}>
              👤  Personal Information
        </Text>
        <View className="flex-row items-center mb-2">
          <Text className="text-lg mr-2">🪪</Text>
          <Text className="text-[#7e453e] text-sm">Full Name:</Text>
          <Text className="ml-1 text-[#5C2C1D] font-semibold">{userData?.firstName} {userData?.lastName}</Text>
        </View>

        <View className="flex-row items-center mb-2">
          <Text className="text-lg mr-2">🎂</Text>
          <Text className="text-[#7e453e] text-sm">Birth Date:</Text>
          <Text className="ml-1 text-[#5C2C1D] font-semibold">{userData?.birth}</Text>
        </View>

        <View className="flex-row items-center">
          <Text className="text-lg mr-2">🥗</Text>
          <Text className="text-[#7e453e] text-sm">Diet:</Text>
          <Text 
          className={`font-semibold ${
            userData?.diet === 'Vegetarian'
              ? 'text-green-700'
              : userData?.diet === 'Vegan'
              ? 'text-lime-700'
              : userData?.diet === 'Standard'
              ? 'text-yellow-700'
              : 'text-[#5C2C1D]'
          }`}>{userData?.diet}</Text>
        </View>
     </View>

     <View className="bg-[#f8ede3] rounded-2xl p-4 mb-4 shadow">
      <Text className="text-[#5C2C1D] font-bold text-lg mb-4" style={{ fontFamily: 'RubikMedium' }}>
        🍽️ Favorite Cuisines
      </Text>

      {userData?.favouriteCuisines?.length > 0 ? (
        userData.favouriteCuisines.map((cuisine, index) => (
          <View key={index} className="flex-row items-center mb-2">
              <Text className="text-2xl mr-3">{cuisineEmojis[cuisine] || '🍽️'}</Text>
            <Text className="text-[#5C2C1D] font-medium">{cuisine}</Text>
          </View>
        ))
      ) : (
        <Text className="text-[#7e453e]">No favorite cuisines selected</Text>
      )}
    </View>

    <View className="bg-[#f8ede3] rounded-2xl p-4 mb-4 shadow">
      <Text className="text-[#5C2C1D] font-bold text-lg mb-3" style={{ fontFamily: 'RubikMedium' }}>
        Your Stats
      </Text>

      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-white rounded-xl p-3 mb-3 shadow-sm">
          <Text className="text-[#7e453e] text-sm mb-1">🥬 Generated Recipes</Text>
          <Text className="text-[#5C2C1D] font-bold text-xl" style={{ fontFamily: 'RubikMedium' }}>
            {userData?.recipesGenerated || 0}
          </Text>
        </View>

        <View className="w-[48%] bg-white rounded-xl p-3 mb-3 shadow-sm">
          <Text className="text-[#7e453e] text-sm mb-1">📅 Saved Meals</Text>
          <Text className="text-[#5C2C1D] font-bold text-xl" style={{ fontFamily: 'RubikMedium' }}>
            {userData?.mealPlanRecipes?.length || 0}
          </Text>
        </View>

        <View className="w-[48%] bg-white rounded-xl p-3 mb-3 shadow-sm">
          <Text className="text-[#7e453e] text-sm mb-1">🔥Favorite Recipes</Text>
          <Text className="text-[#5C2C1D] font-bold text-xl" style={{ fontFamily: 'RubikMedium' }}>
          {userData?.favoriteRecipes?.length || 0}
          </Text>
        </View>

        <View className="w-[48%] bg-white rounded-xl p-3 mb-3 shadow-sm">
          <Text className="text-[#7e453e] text-sm mb-1">🥕 Saved foods</Text>
          <Text className="text-[#5C2C1D] font-bold text-xl" style={{ fontFamily: 'RubikMedium' }}>
            {userData?.wasteReduced  || 0}
          </Text>
        </View>
      </View>

      <View className="mt-2">
        <Text className="text-[#7e453e] text-sm mb-1">🏆 Goal: 10 foods saved / week</Text>
        <View className="w-full h-3 bg-[#e5d8ca] rounded-full overflow-hidden">
          <View
            style={{
              width: `${Math.min(((userData?.wasteReduced || 0) / 10) * 100, 100)}%`,
            }}
            className="h-3 bg-[#996A65]"
          />
        </View>
        <Text className="text-right text-xs text-[#7e453e] mt-1">
          {userData?.wasteReduced || 0} / 10
        </Text>
      </View>
      
      <View className="bg-[#ffffff] rounded-2xl p-4 shadow mb-4">
        <Text className = "text-[#5C2C1D] text-sm mb-2" style={{ fontFamily: 'RubikMedium' }}> Active in the last 7 days</Text>
        
        <View className="flex-row justify-between">
            {getLast7Weekdays().map((dateStr, index) => (
            <View key={index} className = "items-center">

              <Text className="text-xs text-[#7e453e]">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][
                  new Date(dateStr).getDay() === 0 ? 6 : new Date(dateStr).getDay()-1
                ]}
              </Text>

              <View className={`w-4 h-4 rounded-full mt-1 ${
                userData?.activeDays?.includes(dateStr) ? 'bg-[#996A65]' : 'bg-[#e2d3c0]'
              }`}
            />
        </View>
        ))}
      </View>
    </View>
  </View>

    <View className="bg-[#f8ede3] rounded-2xl p-4 mb-6 shadow">
    <Text className="text-[#5C2C1D] font-bold text-lg mb-3" style={{ fontFamily: 'RubikMedium' }}>
          Settings
    </Text>
    <Pressable className="mt-2 bg-[#7e453e] py-2 px-4 rounded-full self-start"
      onPress={() => navigation.navigate('EditProfile', { mode: 'edit' })}
    >
      <Text className="text-white" style={{ fontFamily: 'RubikMedium' }}>Edit Profile</Text>
    </Pressable>
    </View>
    <Pressable
      className="flex-row items-center justify-center bg-white py-3 px-6 rounded-2xl mx-auto mt-2 mb-2 border-2 border-[#5C2C1D] w-[80%] shadow"
      style={{ elevation: 3 }}
      onPress={() => navigation.navigate('EcoTipsScreen')}
    >
      <Text className="text-2xl mr-3">♻️</Text>
      <Text className="text-[#5C2C1D] text-lg font-bold" style={{ fontFamily: 'RubikMedium' }}>
        Eco Tips
      </Text>
    </Pressable>

    <Animated.View style={[animatedStyle, { marginTop: 20 }]}>
    <AnimatedButton
      label="Log Out"
      onPress={handleLogout}
    />
    </Animated.View>
    </ScrollView>
  );
}
