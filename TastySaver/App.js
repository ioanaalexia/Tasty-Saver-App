import "./global.css"
import { useFonts } from 'expo-font';
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from "@expo-google-fonts/rubik";
import { registerRootComponent } from 'expo';
import {Lato_400Regular, Lato_700Bold, Lato_900Black} from "@expo-google-fonts/lato";

import AppNavigation from './navigation/AppNavigation';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
export default function App() {

  // Load the Pacifico font
  const [fontsLoaded] = useFonts({
    Pacifico: Pacifico_400Regular,
    RubikRegular: Rubik_400Regular,
    RubikMedium: Rubik_500Medium,
    RubikBold: Rubik_700Bold,
    LatoRegular: Lato_400Regular,
    LatoBold: Lato_700Bold,
    LatoBlack: Lato_900Black,
  });
  console.log("App loaded")

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <AppNavigation />
  );
}