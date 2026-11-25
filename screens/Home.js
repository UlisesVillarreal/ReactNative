import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, View, Text, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, Image, Alert } from 'react-native';
import { auth, db } from '../src/config/firebaseConfig';
import { doc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import PersonalInfoCard from '../components/PersonalInfoCard';
import EditFieldModal from '../components/EditFieldModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { pickProfilePhoto } from '../src/utils/profilePhoto';

const { height, width } = Dimensions.get('window');

export default function Home({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPhoto, setSavingPhoto] = useState(false);
  // Campo del perfil que se está editando ('nombre' | 'apellido' | 'dni' | 'telefono' | null)
  const [editingField, setEditingField] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

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
  
  // --- Foto de perfil ---
  // Flujo: elegir foto -> reducirla (utils/profilePhoto) -> guardarla en el
  // documento del usuario en Firestore. El onSnapshot de arriba actualiza la
  // pantalla solo cuando el guardado termina.
  const changePhoto = async (source) => {
    try {
      const dataUri = await pickProfilePhoto(source);
      if (!dataUri) return; // el usuario canceló

      setSavingPhoto(true);
      await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), { foto: dataUri });
    } catch (error) {
      Alert.alert('No se pudo cambiar la foto', error.message || 'Inténtelo nuevamente.');
    } finally {
      setSavingPhoto(false);
    }
  };

  const removePhoto = async () => {
    try {
      setSavingPhoto(true);
      // deleteField() borra el campo "foto" del documento
      await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), { foto: deleteField() });
    } catch (error) {
      Alert.alert('No se pudo quitar la foto', 'Inténtelo nuevamente.');
    } finally {
      setSavingPhoto(false);
    }
  };

  // Guarda un campo editado. Si falla, lanza el error para que el modal lo muestre.
  const saveField = async (field, value) => {
    await updateDoc(doc(db, 'usuarios', auth.currentUser.uid), { [field]: value });
  };

  // Menú de opciones al tocar el avatar
  const openPhotoOptions = () => {
    if (savingPhoto) return;
    const options = [
      { text: 'Elegir de la galería', onPress: () => changePhoto('library') },
      { text: 'Tomar una foto', onPress: () => changePhoto('camera') },
    ];
    if (userData?.foto) {
      options.push({ text: 'Quitar foto', style: 'destructive', onPress: removePhoto });
    }
    options.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Foto de perfil', 'Elegí cómo querés cambiar tu foto', options);
  };

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
            
            {/* Avatar: foto guardada o ícono por defecto. Tocarlo abre las opciones. */}
            <TouchableOpacity
              style={styles.fotoPerfilContainer}
              onPress={openPhotoOptions}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Cambiar foto de perfil"
            >
              {userData?.foto ? (
                <Image source={{ uri: userData.foto }} style={styles.fotoPerfil} />
              ) : (
                <Ionicons name="person-circle-outline" size={85} color="#B88A3B" />
              )}

              {savingPhoto && (
                <View style={styles.fotoLoading}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}

              {/* Insignia de cámara para indicar que se puede editar */}
              <View style={styles.fotoBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Texto de bienvenida con la fuente Playfair Display */}
            <Text style={styles.nombrePerfil}>
              Bienvenido, {userData ? userData.nombre : '...'}
            </Text>
          </View>

          <PersonalInfoCard
            nombre={userData ? userData.nombre : 'Cargando...'}
            apellido={userData ? userData.apellido : 'Cargando...'}
            dni={userData ? userData.dni : 'Cargando...'}
            correo={userData ? userData.correo : 'Cargando...'}
            telefono={userData ? (userData.telefono || 'No cargado') : 'Cargando...'}
            fechaIngreso={
              userData && userData.fechaRegistro 
                ? new Date(userData.fechaRegistro).toLocaleDateString('es-AR') 
                : 'Cargando...'
            }
            onEdit={userData ? setEditingField : undefined}
          />

          {/* Cambio de contraseña */}
          <TouchableOpacity
            style={styles.passwordButton}
            onPress={() => setPasswordModalVisible(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Ionicons name="key-outline" size={18} color="#FBF1F0" />
            <Text style={styles.passwordButtonText}>Editar contraseña</Text>
          </TouchableOpacity>

        </ScrollView>
      </ImageBackground>


      {/* Modal para editar un campo del perfil */}
      <EditFieldModal
        visible={editingField !== null}
        field={editingField}
        currentValue={editingField && userData ? userData[editingField] : ''}
        onClose={() => setEditingField(null)}
        onConfirm={(value) => saveField(editingField, value)}
      />

      {/* Modal para cambiar la contraseña */}
      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
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
  fotoPerfil:{
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  fotoLoading:{
    ...StyleSheet.absoluteFillObject,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoBadge:{
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#B88A3B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordButton:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B88A3B',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 18,
  },
  passwordButtonText:{
    color: '#FBF1F0',
    fontWeight: 'bold',
    fontSize: 15,
  },
  nombrePerfil:{
    fontSize: 21,
    fontFamily: 'PlayfairDisplay_700Bold',
    color:'#6D512A',
  },
});