import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, Image} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import PersonalInfoCard from '../components/PersonalInfoCard';
import MenuModal from '../components/MenuModal';



export default function Home({ navigation }) {
  const [mostrarFoto, setMostrarFoto] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);


  let [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  const handleLogOut = async () => {
    try {
      await signOut(auth);  
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      // El observador de Firebase muestra Login al cerrar la sesión.
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };


  return (
    <SafeAreaView style={styles.container}>

      {/* navbar */}
      <View style={styles.navbar}>

        <Image source={require('../assets/logotemple2.png')} style={styles.logo} resizeMode="contain" />
        
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <MaterialCommunityIcons name="menu-open" size={40} color="#B88A3B" />
        </TouchableOpacity>

      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>


        {/* bienvenida */}
        <View style={styles.headerProfile}>

          <Text style={styles.tittle}>Mi Perfil</Text>
          <Text style={styles.subTittle}>Página principal de Temple Estetique</Text>
          <Image source={require('../assets/Usuario.webp')} style={styles.fotoPerfil} resizeMode="contain"/>
          <Text style={styles.nombrePerfil}>Bienvenido "Usuario"</Text>
        </View>

        <PersonalInfoCard 
          nombre="Mariana Figueroa"
          dni="43578376"
          correo="marianafigue@gmail.com"
          telefono="+54 387 555 0126"
          fechaIngreso="06/10/2026"
        />


      </ScrollView>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)} 
        onLogout={handleLogOut}
        navigation={navigation}
      />

    </SafeAreaView>

  );
}


const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#F2E3C8',
  },
    
  // navbar
  navbar:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F2E3C8',
  },
  tittle:{
    fontSize: 40,
    fontFamily: 'PlayfairDisplay_400Regular',
    alignSelf: 'flex-start',
    color:'#6D512A',
  },
    subTittle:{
    fontSize: 20,
    alignSelf: 'flex-start',
    color:'#7c6860',
  },
  logo:{
    width:140,
    height:70,
  },


  // inicio Scroll
  scrollView:{
    flex:1,
  },
  scrollContent:{
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FBEBD7'
  },
  
  // bienvenida
  headerProfile:{
    alignItems: 'center',
  },
  fotoPerfil:{
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop:40,
    backgroundColor: '#FBF1F0',
  },
  nombrePerfil:{
    fontSize:20,
    fontFamily: 'PlayfairDisplay_700Bold',
    color:'#6D512A',
  },
  
});