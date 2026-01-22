import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { login, signup, resetPassword } from '../services/authService';
import AnimatedButton from '../components/AnimatedButton';
import Toast from 'react-native-root-toast';
import { showToast } from '../components/toast';

export default function LoginSignUpScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const markActiveToday = async () => {
  const user = auth.currentUser;
  console.log('Current user:', user);

  if (!user) return;

  const todayStr = new Date().toISOString().slice(0, 10);
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  let activeDays = docSnap.data().activeDays || [];

  if (!activeDays.includes(todayStr)) {
    activeDays.push(todayStr);
    if (activeDays.length > 7) {
      activeDays = activeDays.slice(activeDays.length - 7);
    }
    await updateDoc(userRef, { activeDays });
    console.log('Active days updated:', activeDays);

  }
};

  const handleAuth = async () => {
    
    if (!email || !password || (activeTab === 'signup' && !confirmPassword)) {
    return showToast("All fields are required", 'warning');
    }
    console.log("Auth button pressed", activeTab, email, password);


    if (activeTab === 'signup') {
      if (password !== confirmPassword) {
        return showToast("Passwords do not match", 'warning');
      }
       signup(email, password)
      .then((userCredential) => {
          const user = userCredential.user;
          showToast("Account created successfully", 'success');
          navigation.navigate('ProfileInfos', {
            uid: user.uid,
            email: user.email,
          });
        })
        .catch(error => showToast("Signup failed", 'error'));
    } else {
      login(email, password)
        .then(() => {
          markActiveToday();
          navigation.navigate('Home');
        })
        .catch(error => showToast("Login failed", 'error'));
    }
  };

  return (
    <View className="flex-1 bg-[#f8ede3]">
      <StatusBar style="dark" />

      <View className="w-full h-[350px]">
        { <Image
          
          source={
            activeTab === 'signup'
              ? require('../assets/food_bkg2.png')
              : require('../assets/food_app.jpg')
          }
          className="w-full h-full"
          resizeMode="cover"
          style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}
        />}
      </View>

      <View className="bg-white rounded-t-3xl -mt-10 px-6 pt-6 pb-10 rounded-t-[48px] flex-1 shadow-lg">
        <View className="flex-row justify-center mb-6">
          <TouchableOpacity 
            onPress={() => {
              setActiveTab('login')
              setActiveTab('login');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
             className="items-center mr-16"
            >
            <Text
              className={`text-2xl ${
                activeTab === 'login'
                  ? 'text-[#5C2C1D]'
                  : 'text-gray-400'
              }`}
              style={{
                fontFamily: 'RubikMedium',
                letterSpacing: 1,
              }}
            >
              Sign In
            </Text>
            {activeTab === 'login' && (
              <View className="h-[3px] w-10 bg-[#5C2C1D] mt-1 rounded-full" />
            )}
          </TouchableOpacity>
        
          <TouchableOpacity 
            onPress={() => {
              setActiveTab('signup')
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              }}
              className="items-center ml-16"
            >
            <Text
              className={`text-2xl ${
                activeTab === 'signup'
                  ? 'text-[#5C2C1D]'
                  : 'text-gray-400'
              }`}
              style={{
                fontFamily: 'RubikMedium',
                letterSpacing: 1,
              }}
            >
              Sign Up
            </Text>
            {activeTab === 'signup' && (
              <View className="h-[3px] w-10 bg-[#5C2C1D] mt-1 rounded-full" />
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-md">
          <Text className="text-[#5C2C1D] mb-1">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            className="border border-[#5C2C1D] px-4 py-3 rounded-xl mb-4 text-[#5C2C1D] bg-white"
            placeholder="Enter your email"
            placeholderTextColor="#a37868"
          />

          <Text className="text-[#5C2C1D] mb-1">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="border border-[#5C2C1D] px-4 py-3 rounded-xl mb-4 text-[#5C2C1D] bg-white"
            placeholder="••••••••"
            placeholderTextColor="#a37868"
          />

          {activeTab === 'signup' && (
            <>
              <Text className="text-[#5C2C1D] mb-1">Confirm Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                className="border border-[#5C2C1D] px-4 py-3 rounded-xl mb-4 text-[#5C2C1D] bg-white"
                placeholder="••••••••"
                placeholderTextColor="#a37868"
              />
            </>
          )}
        </View>

        <View style={{ marginTop: 10 }}>
        <AnimatedButton
        label={activeTab === 'signup' ? "Sign Up" : "Sign In"}
          onPress={handleAuth}
          borderColor="#7e453e"
          fillColor="#7e453e"
          textColor="#7e453e"
          fillTextColor="#fff"
        />

        </View> 

        {activeTab === 'login' && (
          <Pressable
            onPress={() => navigation.navigate('ResetPassword')}
            style = {({pressed}) =>[
              {
                marginTop: 16,
                alignSelf: 'center',
                opacity: pressed ? 0.6 : 1,
              }
            ]}
        >
          <Text className="underline"
            style ={{
              marginTop: 8,
              color: '#5C2C1D',
              fontSize: 14,
              fontFamily: 'RubikRegular',
              textAlign: 'center',
            }}
            >
            Trouble logging in?{' '}
            <Text style ={{fontFamily: 'RubikMedium', textDecorationLine: 'underline', color: '#7e453e'}}>
              Reset password
            </Text>
          </Text>
        </Pressable>
        )}

      </View>
    </View>
  );
}