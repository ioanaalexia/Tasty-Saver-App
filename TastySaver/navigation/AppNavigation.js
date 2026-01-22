import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileInfosScreen from '../screens/ProfileInfosScreen';
import RecipeScreen from '../screens/RecipeScreen';
import SelectCuisinesScreen from '../screens/SelectCuisinesScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CategoryScreen from '../screens/CategoryScreen';
import SearchScreen from '../screens/SearchScreen';
import InventoryScreen from '../screens/InventoryScreen';
import SuggestedRecipesScreen from '../screens/SuggestedRecipesScreen';
import RecipeGeneratedScreen from '../screens/RecipeGeneratedScreen';
import CameraScreen from '../screens/CameraScreen';
import MealPlan from '../screens/MealPlan';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import EcoTipsScreen from '../screens/EcoTipsScreen';
import RecommendationExpandedScreen from '../screens/RecommendationExpandedScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeIcon as HomeOutline, HeartIcon as HeartOutline, ShoppingBagIcon as BagOutline, CameraIcon, UserIcon, ClipboardIcon as ClipboardOutline} from 'react-native-heroicons/outline';
import {HomeIcon as HomeSolid, HeartIcon as HeartSolid, ShoppingBagIcon as BagSolid, CameraIcon as CameraSolid, UserIcon as UserSolid, ClipboardIcon as ClipboardSolid} from 'react-native-heroicons/solid';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { RootSiblingParent } from 'react-native-root-siblings';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import { useEffect } from 'react';
import { resetPassword } from '../services/authService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BookOpenIcon  } from 'react-native-heroicons/outline';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigation() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <RootSiblingParent>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" options={{headerShown: false}} component={HomeTabs}/>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="ProfileInfos" component={ProfileInfosScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={ProfileInfosScreen} options={{ headerShown: false }} initialParams={{ mode: 'create' }}/>
        <Stack.Screen name='Recipe' component={RecipeScreen} />
        <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
        <Stack.Screen name="SelectCuisine" component={SelectCuisinesScreen} />
        <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="SuggestedRecipesScreen" component={SuggestedRecipesScreen} />
        <Stack.Screen name="RecipeGeneratedScreen" component={RecipeGeneratedScreen} />
        <Stack.Screen name="InventoryScreen" component={InventoryScreen} />
        <Stack.Screen name="ShoppingListScreen" component={ShoppingListScreen} />
        <Stack.Screen name="EcoTipsScreen" component={EcoTipsScreen} />
        <Stack.Screen name="RecommendationExpandedScreen" component={RecommendationExpandedScreen} options={{ title: 'More Recommendations' }}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
    </RootSiblingParent>
    </GestureHandlerRootView>
  );

}

function HomeTabs(){
  return (
    <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({route})=> ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarIcon:({focused, color, size})=> menuIcons(route, focused),
      tabBarStyle:{
        height: 70,
        marginBottom: 10,
        borderRadius: 50,
        backgroundColor: '#996A65',
        marginHorizontal: 15,
      },
      tabBarItemStyle:{
        marginTop: 15
      }
    })}
    >
      <Tab.Screen name="MealPlan" component={MealPlan}/>
      <Tab.Screen name="Camera" component={CameraScreen}/>
      <Tab.Screen name="Home" component={HomeScreen}/>
      <Tab.Screen name="InventoryScreen" component={InventoryScreen}/>
      <Tab.Screen name="Profile" component={ProfileScreen}/>
    </Tab.Navigator>
  )
}

const menuIcons = (route, focused)=>{
  let icon;
  if(route.name == 'Home' ){
    icon = focused ? <HomeSolid size="30" color="#5C2C1D"/> : <HomeOutline size="30" strokeWidth={2} color="#5C2C1D"/>
  }else if (route.name == 'Camera'){
    icon = focused ? <CameraSolid size="30" color="#5C2C1D"/> : <CameraIcon size="30" strokeWidth={2} color="#5C2C1D"/>
  }else if (route.name === 'MealPlan') {
    icon = focused ? <BookOpenIcon  size={30} color="#5C2C1D" /> : <BookOpenIcon  size={30} strokeWidth={2} color="#5C2C1D" />;
  }else if (route.name === 'InventoryScreen') {
    icon = focused ? <ClipboardSolid size={30} color="#5C2C1D" /> : <ClipboardOutline size={30} strokeWidth={2} color="#5C2C1D" />;
  }else if (route.name === 'Profile') {
    icon = focused ? <UserSolid size={30} color="#5C2C1D" /> : <UserIcon size={30} strokeWidth={2} color="#5C2C1D" />;
  }

  const scale = useSharedValue(1);
  useEffect(()=>{
    if(focused){
      scale.value = withSpring(1.2, {damping: 5});
      setTimeout(()=>{
        scale.value = withSpring(1);
      }, 100);
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(()=>({
    transform: [{scale: scale.value}],
  }));

  let buttonClass = focused? 'bg-white' : '';
  return (
    <Animated.View style={animatedStyle} className={`flex items-center justify-center rounded-full p-3 shadow ${buttonClass}`}>
      {icon}
    </Animated.View>
  );
};