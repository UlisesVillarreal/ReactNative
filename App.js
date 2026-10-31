import React from 'react';
import 'react-native-gesture-handler';
import Navigation from './navigation/Navigation';
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_700Bold} from '@expo-google-fonts/montserrat';
import { useFonts as usePlayfair, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';

export default function App() {

  const [fontsLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded) {
    return null; 
  
  }
  return <Navigation />;
}
