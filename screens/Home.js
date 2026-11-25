import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal, ImageBackground, Dimensions} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../src/config/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import PersonalInfoCard from '../components/PersonalInfoCard';
import MenuModal from '../components/MenuModal';

const { height, width } = Dimensions.get('window');

export default function Home({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal Institucional de Cierre de Sesión
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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
  
  const handleLogOut = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogOut = async () => {
    setLogoutModalVisible(false);
    try {
      await signOut(auth);  
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Imagen de fondo abarcando toda la pantalla */}
      <ImageBackground 
        source={require('../assets/fonoperfil.jpeg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Navbar con el botón de menú a la DERECHA */}
        <View style={styles.navbar}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <MaterialCommunityIcons name="menu-open" size={36} color="#6D512A" />
          </TouchableOpacity>
        </View>

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

      {/* Modal Institucional de Cierre de Sesión */}
      <Modal
          animationType="fade"
          transparent={true}
          visible={logoutModalVisible}
          onRequestClose={() => setLogoutModalVisible(false)}
      >
          <View style={styles.customModalOverlay}>
              <View style={styles.customModalBox}>
                  <Text style={styles.customModalTitle}>¿Desea cerrar sesión?</Text>
                  <Text style={styles.customModalSubtitle}>Deberá iniciar sesión nuevamente para ingresar al sistema.</Text>

                  <View style={styles.customModalButtonRow}>
                      <TouchableOpacity 
                          style={styles.customCancelBtn} 
                          onPress={() => setLogoutModalVisible(false)}
                      >
                          <Text style={styles.customCancelText}>Cancelar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                          style={styles.customContinueBtn} 
                          onPress={confirmLogOut}
                      >
                          <Text style={styles.customContinueText}>Continuar</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)} 
        onLogout={handleLogOut}
        navigation={navigation}
      />

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
  menuButton: {
    padding: 6,
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
    paddingBottom: 50,
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

  // Estilos del Modal Institucional
  customModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(50, 35, 20, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  customModalBox: {
      backgroundColor: '#F2E3C8',
      borderRadius: 24,
      padding: 24,
      width: '90%',
      maxWidth: 360,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
  },
  customModalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#4A3B32',
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 26,
  },
  customModalSubtitle: {
      fontSize: 14,
      color: '#7C6860',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
  },
  customModalButtonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
  },
  customCancelBtn: {
      flex: 1,
      backgroundColor: '#7A6B62',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
  },
  customCancelText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
  },
  customContinueBtn: {
      flex: 1,
      backgroundColor: '#D49B37',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
  },
  customContinueText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: 'bold',
  },
});