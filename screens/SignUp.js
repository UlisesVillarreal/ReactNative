import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, db } from '../src/config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function SignUp({ navigation }) {

  // info personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [tel, setTel] = useState('');

  // Datos de cuenta
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  //Estados para los mensajes de validacion
  const [errors,setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordStrengthColor, setPasswordStrengthColor] = useState('');

  // funcion para medir la seguridad de la contraseña
  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
      setPasswordStrengthColor('');
      return;
    }
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_=+[\];/\\~]/.test(password);

    const requirementsMet = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (requirementsMet <= 2) {
      setPasswordStrength('Débil');
      setPasswordStrengthColor('#EF4444');
    } else if (requirementsMet <= 4) {
      setPasswordStrength('Media');
      setPasswordStrengthColor('#F59E0B');
    } else {
      setPasswordStrength('Fuerte');
      setPasswordStrengthColor('#10B981');
    }
  };
  const passwordRequirements = [
    {
      label: 'Al menos 8 caracteres',
      met: password.length >= 8,
    },
    {
      label: 'Una letra mayúscula',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Una letra minúscula',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Un número',
      met: /[0-9]/.test(password),
    },
    {
      label: 'Un carácter especial (@, #, !)',
      met: /[!@#$%^&*(),.?":{}|<>\-_=+[\];/\\~]/.test(password),
    },
  ];


  // -- VALIDACIONES --
  useEffect(() => {
    const newErrors = {};
    let formIsValid = true;

    // Regex
    const nameRegex = /^[a-zA-Z\sñÑ\u00C0-\u017F]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const dniRegex = /^\d{7,8}$/;
    const telRegex = /^\d{10}$/;

    // Nombre
    if (firstName.trim().length > 0) {
      if (!nameRegex.test(firstName.trim())) {
        newErrors.firstName = 'Solo se permiten letras.';
        formIsValid = false;
      }
    } else {
      formIsValid = false;
    }

    // Apellido
    if (lastName.trim().length > 0) {
      if (!nameRegex.test(lastName.trim())) {
        newErrors.lastName = 'Solo se permiten letras.';
        formIsValid = false;
      }
    } else {
      formIsValid = false;
    }

    // DNI
    if (dni.trim().length > 0) {
      if (!dniRegex.test(dni.trim())) {
        newErrors.dni = 'Debe tener entre 7 y 8 dígitos, solo números.';
        formIsValid = false;
      }
    } else {
      formIsValid = false;
    }

    // Correo
    if (email.trim().length > 0) {
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Formato inválido. Ej: usuario@gmail.com';
        formIsValid = false;
      }
    } else {
      formIsValid = false;
    }

    // Teléfono (No es obligatorio pero si debe tener el formato correcto)
    if (tel.trim().length > 0 && !telRegex.test(tel.trim())) {
      newErrors.tel = 'El teléfono solo debe tener 10 números, sin otros caracteres.';
      formIsValid = false;
    }

    // Contraseñas
    checkPasswordStrength(password);
    if (/\s/.test(password)) {
      newErrors.password = 'La contraseña no puede contener espacios en blanco.';
      formIsValid = false;
    }

    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden.';
        formIsValid = false;
      }
    } else {
      formIsValid = false;
    }

    // Si el medidor de fuerza es Débil o Medio, bloqueamos el botón
    if (passwordStrength === 'Débil' || passwordStrength === 'Media' || passwordStrength === '') {
      formIsValid = false;
    }

    // Actualizamos los estados con los resultados de la revision
    setErrors(newErrors);
    setIsFormValid(formIsValid);

  }, [firstName, lastName, dni, tel, email, password, confirmPassword]);

const handleSignUp = async () => {
    // Si el botón se habilitó por error, cortamos aquí.
    if (!isFormValid) return; 

    setLoading(true); // "cargando..." del botón
    
    try {
      // Creamos la cuenta en Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = credential.user;

      // Guardamos el perfil completo en Firestore vinculando el UID del usuario
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre: firstName.trim(),
        apellido: lastName.trim(),
        dni: dni.trim(),
        telefono: tel.trim(),
        correo: email.trim().toLowerCase(),
        rol: 'empleado',
        fechaRegistro: new Date().toISOString()
      });

      // Actualizamos el nombre básico en Auth por si acaso
      await updateProfile(user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
      
      Alert.alert("Registro exitoso", "Tu cuenta fue creada correctamente.");
    
    } catch (error) {
      // Manejo de errores de Firebase
      let errorMessage = "Hubo un problema al registrar el usuario.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "El correo ya está registrado en otra cuenta.";
      if (error.code === 'auth/network-request-failed') errorMessage = "Error de conexión, revisá tu internet.";
      
      Alert.alert("Error de registro", errorMessage);
    } finally {
      setLoading(false); // Apagamos el "cargando..."
    }
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F8EBD7' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        >
        <Image source={require('../assets/logotemple2.png')} style={styles.logo} />
        <Text style={styles.title}>Crear Cuenta</Text>

          <ScrollView 
          style={{ width: '100%' }}
          contentContainerStyle={styles.subContainer}
          showsVerticalScrollIndicator={false}
          >

            {/* nombre */}
            <Text style={styles.label}>Nombre *</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Mariano"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            
            {errors.firstName && (
              <Text style={ styles.errortext }>
                {errors.firstName}
            </Text>
            )}


            {/* apellido */}
            <Text style={styles.label}>Apellido *</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Tamer"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            {errors.lastName && (
              <Text style={ styles.errortext }>
                {errors.lastName}
            </Text>
            )}
            <Text style={styles.label}>DNI *</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="id-card" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Solo el numero, sin '.'"
                value={dni}
                onChangeText={setDni}
                keyboardType="numeric"
              />
            </View>
            {errors.dni && (
              <Text style={styles.errortext }>
                {errors.dni}
              </Text>
    )}

            {/* telefono */}
            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="phone" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Sin '0' ni '15', ej: 3875666888"
                value={tel}
                onChangeText={setTel}
                keyboardType="numeric"
              />
            </View>
            {errors.tel && <Text style={styles.errortext}>{errors.tel}</Text>}

            {/* correo */}
            <Text style={styles.label}>Correo *</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="usuario@gmail.com"
                value={email}
                
                onChangeText={setEmail} 
                
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={styles.errortext}>{errors.email}</Text>}

            {/* contraseña */}
            <Text style={styles.label}>Contraseña *</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} style={styles.icon}/>
              </TouchableOpacity>
            </View>

            {errors.password && <Text style={styles.errortext}>{errors.password}</Text>}

            {/* Lista dinámica de requisitos */}
            <View style={styles.passwordRequirementsContainer}>
              <Text style={styles.passwordRequirementsTitle}>
                Requisitos de la contraseña:
              </Text>

              {passwordRequirements.map((requirement, index) => (
                <View
                  key={index}
                  style={styles.passwordRequirementRow}
                >
                  <FontAwesome
                    name={requirement.met ? 'check-circle' : 'times-circle'}
                    size={16}
                    color={requirement.met ? '#10B981' : '#D94A3D'}
                  />

                  <Text
                    style={[
                      styles.passwordRequirementText,
                      {
                        color: requirement.met ? '#10B981' : '#D94A3D',
                      },
                    ]}
                  >
                    {requirement.label}
                  </Text>
                </View>
              ))}
            </View>

            {/*Indicator de seguridad */}
            {passwordStrength !== '' && (
              <View style={styles.strengthContainer}>
                <Text style={styles.strengthLabel}>
                  Seguridad de la contraseña:
                </Text>

                <Text
                  style={[
                    styles.strengthText,
                    { color: passwordStrengthColor }
                ]}
              >
                {passwordStrength}
              </Text>
              </View>
            )}
            
            <Text style={styles.label}>Confirmar Contraseña *</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="********"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20}  style={styles.icon}/>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errortext}>
                {errors.confirmPassword}
              </Text>
            )}

            <TouchableOpacity 
              style={[styles.button, !isFormValid && { backgroundColor: '#D8B77A80' }]} 
              onPress={handleSignUp}
              disabled={!isFormValid} 
            >  
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signUpText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </ScrollView>
      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#F8EBD7',
  },
  passwordRequirementsContainer: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: -10,
    marginBottom: 10,
  },

  passwordRequirementsTitle: {
    fontSize: 12,
    color: '#6D512A',
    fontWeight: 'bold',
    marginBottom: 6,
  },

  passwordRequirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },

  passwordRequirementText: {
    fontSize: 12,
    flexShrink: 1,
  },
  subContainer:{
    backgroundColor:'#F2E3C8',
    alignSelf: 'stretch',
    marginHorizontal: 5,
    marginTop: 10,
    marginBottom: 15,
    borderRadius:20,
    padding:25,
    shadowColor:'#6d512a',
    elevation: 7, 

    // config para IOs 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, 
    shadowRadius: 10,
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 10,
    marginTop:50,
  },
  title: {
    color:'#6D512A',
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    color:'#6D512A',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom:5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#B88A3B',
    marginBottom: 15,
    width: '100%',
  },
  icon: {
    color:'#b88a3b',
    width:25,
    textAlign:'center',
  },
  input: {
    flex: 1,
    height: 40,
  },
  button: {
    backgroundColor: '#D8B77A',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#FBF1F0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    color: '#B88A3B',
  },
  strengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  strengthLabel: {
    fontSize: 11,
    color: '#666666',
  },
  strengthText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  errortext: {
    color: '#D94A3D',
    fontSize: 12,
    alignSelf: 'flex-start',
    width: '100%',
    marginTop: 5,
    marginBottom: 15,
  },
});
