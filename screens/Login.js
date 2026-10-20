import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados para el Modal de recuperación de contraseña
  const [modalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Por favor ingrese ambos campos.");
      return;
    }

    // validación de correo
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "Error",
        "El email no respeta el formato correcto 'Usuario@example.com'. Ingresar un formato válido"
      );
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Login exitoso", "Has iniciado sesión correctamente.");
    } catch (error) {
      console.error('Error de inicio de sesión:', error.code, error.message);
      
      let errorMessage = "Hubo un problema al iniciar sesión.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          errorMessage = "La contraseña es incorrecta.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "La clave API de Firebase no es válida. Revisa el archivo .env.";
          break;
      }
      Alert.alert("Error", `${errorMessage}\n\nCódigo: ${error.code ?? 'desconocido'}`);
    }
  };

  // Función segura para enviar el correo de recuperación 
  const handleSendResetPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert("Atención", "Por favor, ingresa tu correo electrónico.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(resetEmail.trim())) {
      Alert.alert("Error", "El formato del correo electrónico no es válido.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
    } catch (error) {
      // Ocultamos el error 'auth/user-not-found' por seguridad
      if (error.code !== 'auth/user-not-found') {
        Alert.alert("Error", "No se pudo enviar el correo de recuperación. Inténtalo más tarde.");
        return;
      }
    }

    Alert.alert(
      "Solicitud procesada",
      "El correo fue enviado correctamente. Por favor, revise su bandeja de entrada y la casilla de spam."
    );
    setResetEmail('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logotemple.png')} style={styles.logo} />
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.text}>Sistema de Gestión de Temple Estetique</Text>

      <View style={styles.subContainer}>
        <Text style={styles.label}>Correo</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="envelope" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholderTextColor="#7C6860"
            placeholder="usuario@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={24} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholderTextColor="#7C6860"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} style={styles.icon} />
          </TouchableOpacity>
        </View>

        
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>¿No tienes cuenta aún? Registrate aquí</Text>
        </TouchableOpacity>
      </View>

      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            
            <View style={styles.modalIconContainer}>
              <FontAwesome5 name="key" size={28} color="#F8F9FA" />
            </View>

            <Text style={styles.modalTitle}>Recuperar Contraseña</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa tu correo electrónico registrado y te enviaremos las instrucciones a tu Gmail.
            </Text>

            <View style={styles.inputContainerModal}>
              <FontAwesome name="envelope" size={18} color="#C68A36" style={styles.icon} />
              
              <TextInput
                style={styles.input} 
                placeholder="Ej: usuario@gmail.com"
                placeholderTextColor="#7C6860"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.modalButtonSend} onPress={handleSendResetPassword}>
              <Text style={styles.modalButtonSendText}>Enviar correo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButtonCancel}>
              <Text style={styles.modalButtonCancelText}>Cancelar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FBEBD7',
  },
  modalButtonCancel: {  //Espacio entre los botones de recuperar contraseña 
    paddingVertical: 8,
  },
  subContainer:{
    backgroundColor:'#F2E3C8',
    alignItems: 'center',
    padding: 20,
    borderRadius:20,
    width: '100%',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    color: '#6D512A',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    color:'#7C6860',
    fontSize: 18,
    marginBottom: 20,
    padding: 10,
  },
  label: {
    color:'#6D512A',
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    marginTop: 10,
    
  },
  inputContainer: {
    borderWidth: 1,
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#B88A3B',
    marginBottom: 20,
    width: '100%',
  },
  icon: {
    marginRight: 10,
    color: '#B88A3B',
  },
  input: {
    flex: 1,
    height: 40,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: '#C68A36',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#D8B77A',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#FBF7F0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    color: '#C68A36',
  },

  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#F2E3C8',
    borderRadius: 20,
    padding: 25,
    width: '95%',
    alignItems: 'center',
  },
  modalIconContainer: {
    backgroundColor: '#B88A3B',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6D512A',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#7C6860',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputContainerModal: {
    borderWidth: 1,
    padding: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#B88A3B',
    marginBottom: 20,
    width: '100%',
    
  },
  modalButtonSend: {
    backgroundColor: '#D8B77A',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonSendText: {
    color: '#FBF7F0',
    fontSize: 15,
    fontWeight: 'bold',
  },

  modalButtonCancelText: {
    color: '#B88A3B',
    fontSize: 14,
    fontWeight: '600',
  },
});