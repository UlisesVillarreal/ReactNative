import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Modal, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de errores y carga de Login
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para Modal de Recuperación
  const [modalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Comprobación para el botón de Iniciar Sesión (debe tener correo y contraseña)
  const isLoginComplete = email.trim().length > 0 && password.length > 0;

  // Comprobación para el botón de Enviar Correo del Modal (debe tener email válido y sin errores)
  const isResetComplete = resetEmail.trim().length > 0 && !resetEmailError;

  const validateEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEmailError('Ingrese su correo electrónico');
      return false;
    } else if (!emailRegex.test(trimmed)) {
      setEmailError('Ingrese un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('Ingrese su contraseña');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Función de validación instantánea para el correo del modal
  const validateResetEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setResetEmailError('Ingrese su correo electrónico');
      return false;
    } else if (!emailRegex.test(trimmed)) {
      setResetEmailError('Ingrese un correo electrónico válido');
      return false;
    }
    setResetEmailError('');
    return true;
  };

  const handleLogin = async () => {
    setGeneralError('');
    
    const cleanEmail = email.trim();
    const isEmailValid = validateEmail(cleanEmail);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (error) {
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-email'
      ) {
        setGeneralError('No pudimos iniciar sesión. Verifique su correo electrónico y contraseña.');
      } else if (error.code === 'auth/network-request-failed') {
        setGeneralError('No pudimos conectarnos. Verifique su conexión a internet e inténtelo nuevamente.');
      } else if (error.code === 'auth/too-many-requests') {
        setGeneralError('Se realizaron demasiados intentos. Espere unos minutos antes de volver a intentarlo.');
      } else {
        setGeneralError('El servicio no está disponible en este momento. Inténtelo nuevamente más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetPassword = async () => {
    const cleanResetEmail = resetEmail.trim();

    // Validamos antes de enviar por seguridad
    if (!validateResetEmail(cleanResetEmail)) return;

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, cleanResetEmail);
    } catch (error) {
      console.log("Error recupero:", error.code);
    } finally {
      setResetLoading(false);
      setModalVisible(false);
      setResetEmail('');
      setResetEmailError('');
      setSuccessModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        <Image source={require('../assets/logotemple.png')} style={styles.logo} />
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.text}>Ingrese su correo electrónico y contraseña para continuar</Text>

        <View style={styles.subContainer}>
          
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.inputContainer, emailError ? styles.inputErrorBorder : null]}>
            <FontAwesome name="envelope" size={18} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholderTextColor="#9A8478"
              placeholder="usuario@gmail.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              onBlur={() => validateEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              accessibilityLabel="Campo de correo electrónico"
            />
            {email && !emailError && emailRegex.test(email.trim()) && (
              <FontAwesome name="check-circle" size={16} color="#81B29A" style={{ marginLeft: 5 }} />
            )}
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <Text style={styles.label}>Contraseña</Text>
          <View style={[styles.inputContainer, passwordError ? styles.inputErrorBorder : null]}>
            <FontAwesome name="lock" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholderTextColor="#9A8478"
              placeholder="********"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
              }}
              onBlur={() => validatePassword(password)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              accessibilityLabel="Campo de contraseña"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={styles.eyeIconContainer}
              accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              accessibilityRole="button"
            >
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={18} color="#B88A3B" />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          
          <TouchableOpacity 
            onPress={() => setModalVisible(true)} 
            style={styles.forgotPasswordContainer}
            accessibilityRole="link"
          >
            <Text style={styles.forgotPasswordText}>¿Olvidó su contraseña?</Text>
          </TouchableOpacity>

          {generalError ? <Text style={styles.generalErrorText}>{generalError}</Text> : null}

          {/* Botón de Iniciar Sesión dinámico */}
          <TouchableOpacity 
            style={[
              styles.button, 
              !isLoginComplete && styles.buttonDisabled, 
              isLoginComplete && styles.buttonActive
            ]} 
            onPress={handleLogin}
            disabled={!isLoginComplete || loading}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
            accessibilityState={{ disabled: !isLoginComplete || loading }}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FBF7F0" size="small" />
                <Text style={styles.buttonText}> Iniciando sesión...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('SignUp')} 
            style={styles.signUpContainer}
            accessibilityRole="link"
          >
            <Text style={styles.signUpText}>¿No tenés cuenta? <Text style={styles.boldLink}>Registrate</Text></Text>
          </TouchableOpacity>

        </View>

        {/* Modal 1: Recuperar contraseña con Spinner */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setResetEmail('');
            setResetEmailError('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <FontAwesome5 name="key" size={26} color="#F8F9FA" />
              </View>

              <Text style={styles.modalTitle}>Recuperar Contraseña</Text>
              <Text style={styles.modalSubtitle}>
                Ingresa tu correo electrónico registrado y te enviaremos las instrucciones a tu Gmail.
              </Text>

              <View style={[styles.inputContainerModal, resetEmailError ? styles.inputErrorBorder : null]}>
                <FontAwesome name="envelope" size={16} color="#C68A36" style={styles.icon} />
                <TextInput
                  style={styles.input} 
                  placeholder="Ej: usuario@gmail.com"
                  placeholderTextColor="#9A8478"
                  value={resetEmail}

                  // Validación instantánea en tiempo real (onChangeText y onBlur)
                  onChangeText={(text) => {
                    setResetEmail(text);
                    if (resetEmailError) validateResetEmail(text);
                  }}
                  onBlur={() => validateResetEmail(resetEmail)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Correo para recuperación de contraseña"
                />
                {resetEmail && !resetEmailError && emailRegex.test(resetEmail.trim()) && (
                  <FontAwesome name="check-circle" size={16} color="#81B29A" style={{ marginLeft: 5 }} />
                )}
              </View>
              {resetEmailError ? <Text style={styles.errorTextModal}>{resetEmailError}</Text> : null}

              {/* Botón de Envío del Modal*/}
              <TouchableOpacity 
                style={[
                  styles.modalButtonSend, 
                  !isResetComplete && styles.buttonDisabled, 
                  isResetComplete && styles.buttonActive
                ]} 
                onPress={handleSendResetPassword}
                disabled={!isResetComplete || resetLoading}
                accessibilityState={{ disabled: !isResetComplete || resetLoading }}
              >
                {resetLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#FBF7F0" size="small" />
                    <Text style={styles.modalButtonSendText}> Enviando...</Text>
                  </View>
                ) : (
                  <Text style={styles.modalButtonSendText}>Enviar correo</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(false);
                  setResetEmail('');
                  setResetEmailError('');
                }} 
                style={styles.modalButtonCancel}
                disabled={resetLoading}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal 2: Éxito de recuperación estilizado */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={successModalVisible}
          onRequestClose={() => setSuccessModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#81B29A' }]}>
                <FontAwesome name="check" size={26} color="#F8F9FA" />
              </View>

              <Text style={styles.modalTitle}>Solicitud procesada</Text>
              <Text style={styles.modalSubtitle}>
                Si el correo corresponde a una cuenta, recibirá las instrucciones para restablecer su contraseña.
              </Text>

              <TouchableOpacity 
                style={[styles.modalButtonSend, styles.buttonActive]} 
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={styles.modalButtonSendText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Pie de página institucional (Footer) */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Instituto Superior del Milagro N° 8207</Text>
          <Text style={styles.footerSubText}>Temple Estetique • Sistema de Gestión 2026</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBEBD7',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subContainer:{
    backgroundColor:'#F2E3C8',
    alignItems: 'center',
    padding: 22,
    borderRadius: 24,
    width: '100%',
    shadowColor: '#6D512A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 9,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 23,
    color: '#6D512A',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    color:'#7C6860',
    fontSize: 13,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color:'#6D512A',
    alignSelf: 'flex-start',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 6,
  },
  inputContainer: {
    borderWidth: 1.3,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#D4B279',
    width: '100%',
    backgroundColor: '#FFF',
    minHeight: 50,
    marginBottom: 4,
  },
  inputErrorBorder: {
    borderColor: '#D32F2F',
  },
  icon: {
    marginRight: 10,
    color: '#B88A3B',
  },
  eyeIconContainer: {
    padding: 6,
  },
  input: {
    flex: 1,
    height: 44,
    color: '#332211',
    fontSize: 15,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 6,
    marginLeft: 4,
  },
  errorTextModal: {
    color: '#D32F2F',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 4,
  },
  generalErrorText: {
    color: '#D32F2F',
    backgroundColor: '#FDECEA',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 13,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    overflow: 'hidden',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#B88A3B',
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: '#6D512A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#D8B77A', 
    opacity: 0.7,
  },
  buttonActive: {
    backgroundColor: '#B88A3B', 
  },
  buttonText: {
    color: '#FBF7F0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpContainer: {
    marginTop: 18,
  },
  signUpText: {
    color: '#7C6860',
    fontSize: 14,
    textAlign: 'center',
  },
  boldLink: {
    color: '#B88A3B',
    fontWeight: 'bold',
  },

  // Modales refinados
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(50, 35, 20, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#F2E3C8',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalIconContainer: {
    backgroundColor: '#B88A3B',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6D512A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#7C6860',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 18,
  },
  inputContainerModal: {
    borderWidth: 1.2,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#D4B279',
    marginBottom: 16,
    width: '100%',
    backgroundColor: '#FFF',
    minHeight: 48,
  },
  modalButtonSend: {
    paddingVertical: 12,
    width: '100%',
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  modalButtonSendText: {
    color: '#FBF7F0',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalButtonCancel: {
    paddingVertical: 6,
  },
  modalButtonCancelText: {
    color: '#8C6A36',
    fontSize: 14,
    fontWeight: '600',
  },

  // Pie de Página (Footer institucional)
  footerContainer: {
    marginTop: 50,
    marginBottom: 0.5,
    alignItems: 'center',
  },
  footerText: {
    color: '#6D512A',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  footerSubText: {
    color: '#7C6860',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});