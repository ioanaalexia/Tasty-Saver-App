import { View, Text, StatusBar, Pressable } from 'react-native'
import WaveBackground from '../components/WaveBackground'
import { useNavigation } from '@react-navigation/native'

console.log(WaveBackground);
export default function WelcomeScreen() {
  const navigation = useNavigation();
  return (
    <View className="flex-1 bg-[#7e453e] relative">
      <StatusBar style="light" />

      <WaveBackground />

      <View className="flex-1 items-center justify-center pt-20 px-6 z-10">

        <Text
            className="text-[#5C2C1D] text-6xl"
            style={{
              fontFamily: 'Pacifico',
              marginTop: 40, 
              lineHeight: 80,
            }}
          >
          TastySaver
        </Text>
        
        <Pressable
          className="bg-[#8c4f43] px-14 py-8 rounded-full"
          style={{
            marginTop: 40,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            opacity: 0.9, 
          }}
          onPress={() => navigation.navigate('Login')}
        >
          <Text
            className="text-[#f8ede3] font-semibold text-base"
            style={{
              fontSize: 28,
              letterSpacing: 1.5,
              lineHeight: 28,
            }}
          >
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>

    

  );
}