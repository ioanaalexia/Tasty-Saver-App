import React, {useState} from 'react';
import {View, Text, TextInput, Pressable, Alert, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedButton from '../components/AnimatedButton';
import { resetPassword } from '../services/authService';
import Toast from 'react-native-root-toast';
import { ArrowLeftCircleIcon } from 'react-native-heroicons/solid';
import { showToast } from '../components/toast';
import { ImageBackground } from 'react-native';

export default function ResetPasswordScreen() {
    const [email, setEmail] = useState('');
    const navigation = useNavigation();

    const handleReset = () =>{
        if(!email){
            return showToast("Email is required", 'warning');
        }
        resetPassword(email)
      .then(() => {
        showToast('Reset link sent! Check your email.', 'success');
        navigation.goBack();
      })
      .catch((error) => {
        showToast('Error', 'error');
      });
    };
    
    return(

    <ImageBackground
        source={require('../assets/reset_bkg.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
      <View style={{
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.80)',
        }}>
      <View className="absolute top-10 left-4 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeftCircleIcon size={50} strokeWidth={1.2} color="#9cbb72" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center items-center">
        <Text className="text-[#5C2C1D] text-2xl font-bold mb-4">Reset Password</Text>
      
      <View className="w-4/5">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#a37868"
          className="border border-[#5C2C1D] px-4 py-3 rounded-xl mb-6 w-full text-[#5C2C1D] bg-[#e3f4ca]"
        />
      </View>
      <AnimatedButton
        label="Send Reset Link"
        onPress={handleReset}
        borderColor="#5C2C1D"
        fillColor="#5C2C1D"
        textColor="#5C2C1D"
        fillTextColor="#fff"
      />
      </View>
     </View>
    </ImageBackground>
    );
}