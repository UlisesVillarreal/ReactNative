import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, View, Text, StyleSheet, ImageBackground, Dimensions} from 'react-native';
import { auth, db } from '../src/config/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import PersonalInfoCard from '../components/PersonalInfoCard';

const { height, width } = Dimensions.get('window');

export default function Home({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Escucha en tiempo real: si el perfil se crea unos instantes después
    // del registro, la pantalla se actualiza sola.
    const unsubscribe = onSnapshot(
      doc(db, 'usuarios', currentUser.uid),
      (snap) => {
        setUserData(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, []);

  let [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#B88A3B" />
        <Text style={{ color: '#6D512A', marginTop: 15, fontFamily: 'PlayfairDisplay_700Bold' }}>
          Cargando perfil...
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Imagen de fondo abarcando toda la pantalla */}
      <ImageBackground 
        source={require('../assets/fonoperfil.jpeg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Espacio superior */}
        <View style={styles.navbar} />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Encabezado de Perfil */}
          <View style={styles.headerProfile}>
            <Text style={styles.tittle}>Mi Perfil</Text>
            <Text style={styles.subTittle}>Página principal de Temple Estetique</Text>
            
            {/* Avatar con el icono person-circle de Ionicons */}
            <View style={styles.fotoPerfilContainer}>
              <Ionicons name="person-circle-outline" size={85} color="#B88A3B" />
            </View>

            {/* Texto de bienvenida con la fuente Playfair Display */}
            <Text style={styles.nombrePerfil}>
              Bienvenido, {userData ? userData.nombre : '...'}
            </Text>
          </View>

          <PersonalInfoCard 
            nombre={userData ? `${userData.nombre} ${userData.apellido}` : 'Cargando...'}
            dni={userData ? userData.dni : 'Cargando...'}
            correo={userData ? userData.correo : 'Cargando...'}
            telefono={userData ? userData.telefono : 'Cargando...'}
            fechaIngreso={
              userData && userData.fechaRegistro 
                ? new Date(userData.fechaRegistro).toLocaleDateString('es-AR') 
                : 'Cargando...'
            } 
          />

        </ScrollView>
      </ImageBackground>

    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#FBEBD7',
  },
  
  // Imagen de fondo absoluta cubriendo todo
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
    
  // Navbar con el menú a la derecha
  navbar:{
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 5,
    backgroundColor: 'transparent',
  },
  tittle:{
    fontSize: 30,
    fontFamily: 'PlayfairDisplay_700Bold',
    alignSelf: 'flex-start',
    color:'#6D512A',
    
  },
  subTittle:{
    fontSize: 15,
    fontFamily: 'PlayfairDisplay_700Bold',
    alignSelf: 'flex-start',
    color:'#7C6860',
    marginTop: 3,
  },

  // Scroll
  scrollView:{
    flex: 1,
  },
  scrollContent:{
    padding: 20,
    paddingBottom: 120,
    backgroundColor: 'transparent',
  },
  
  // Bienvenida y Perfil
  headerProfile:{
    alignItems: 'center',
    marginTop: 23,

  },
  fotoPerfilContainer:{
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D4B279',
    shadowColor: '#6d512a',
    elevation: 3,
  },
  nombrePerfil:{
    fontSize: 21,
    fontFamily: 'PlayfairDisplay_700Bold',
    color:'#6D512A',
  },
});