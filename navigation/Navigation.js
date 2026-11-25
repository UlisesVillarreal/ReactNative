import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Easing, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomBar from '../components/BottomBar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../src/config/firebaseConfig';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import Services from '../screens/Services';

const Stack = createStackNavigator();

// Transición entre pestañas: desvanecimiento cruzado con un deslizamiento corto
// (la pantalla que entra viene del lado hacia el que se avanza). La barra inferior
// está fuera del navegador, así que permanece fija.
const SLIDE = 28;
const tabInterpolator = ({ current, next }) => {
  const enterOpacity = current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const enterX = current.progress.interpolate({ inputRange: [0, 1], outputRange: [SLIDE, 0] });
  const exitOpacity = next
    ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
    : 1;
  const exitX = next
    ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [0, -SLIDE] })
    : 0;

  return {
    cardStyle: {
      opacity: next ? exitOpacity : enterOpacity,
      transform: [{ translateX: next ? exitX : enterX }],
    },
  };
};

const tabLikeOptions = {
  headerShown: false,
  gestureEnabled: false,
  cardStyle: { backgroundColor: '#FBEBD7' },
  cardStyleInterpolator: tabInterpolator,
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 260, easing: Easing.out(Easing.cubic) } },
    close: { animation: 'timing', config: { duration: 260, easing: Easing.out(Easing.cubic) } },
  },
};

export default function Navigation() {
  const [user, setUser] = useState(undefined);
  const [currentRoute, setCurrentRoute] = useState(undefined);
  const navRef = useNavigationContainerRef();

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Falta configurar Firebase. Copia .env.example como .env y completa los datos de tu proyecto.
        </Text>
      </View>
    );
  }

  if (user === undefined) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaProvider>
    <View style={{ flex: 1 }}>
    <NavigationContainer
      ref={navRef}
      onReady={() => setCurrentRoute(navRef.getCurrentRoute()?.name)}
      onStateChange={() => setCurrentRoute(navRef.getCurrentRoute()?.name)}
    >
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={Home} options={tabLikeOptions} />
            <Stack.Screen name="Services" component={Services} options={tabLikeOptions} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} options={{ headerShown:false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown:false }} />
          </> 
        )}
      </Stack.Navigator>
    </NavigationContainer>

    {user && (currentRoute === 'Home' || currentRoute === 'Services') && (
      <BottomBar active={currentRoute} onNavigate={(name) => navRef.navigate(name)} />
    )}
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { textAlign: 'center', fontSize: 16 },
});
