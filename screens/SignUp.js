import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, db } from '../src/config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { sololetras, getPasswordRequirements, NAME_REGEX, EMAIL_REGEX, DNI_REGEX, TEL_REGEX } from '../src/utils/validators';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';

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

  const passwordRequirements = getPasswordRequirements(password);

  // Fuerza derivada de los requisitos (sin estado extra, siempre actualizada)
  const requirementsMet = passwordRequirements.filter((r) => r.met).length;
  const isPasswordStrong = requirementsMet === passwordRequirements.length;

  // -- VALIDACIONES --
  useEffect(() => {
    const newErrors = {};
    let formIsValid = true;

    // Regex

    // Nombre
    if (firstName.trim().length > 0) {
      if (!NAME_REGEX.test(firstName.trim())) {
        newErrors.firstName = 'Solo se permiten letras.';
        formIsValid = false;
      }
    } else {
      formIsValid = false;
    }

    // Apellido
    if (lastName.trim().length > 0) {
      if (!NAME_REGEX.test(lastName.trim())) {
        newErrors.lastName = 'Solo se permiten letras.';
        formIsValid = false;
      }
    } else {
      formIsValid = false;
    }

    // DNI
    if (dni.trim().length > 0) {
      if (!DNI_REGEX.test(dni.trim())) {
        newErrors.dni = 'Debe tener entre 7 y 8 dígitos, solo números.';
        formIsValid = false;
      }
    } else {
      formIsValid = false;
    }

    // Correo
    if (email.trim().length > 0) {
      if (!EMAIL_REGEX.test(email.trim())) {
        newErrors.email = 'Formato inválido. Ej: usuario@gmail.com';
        formIsValid = false;
      }
    } else {
      formIsValid = false;
    }

    // Teléfono (No es obligatorio pero si debe tener el formato correcto)
    if (tel.trim().length > 0 && !TEL_REGEX.test(tel.trim())) {
      newErrors.tel = 'El teléfono solo debe tener 10 números, sin otros caracteres.';
      formIsValid = false;
    }

    // Contraseñas
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

    // Se exige que la contraseña cumpla todos los requisitos
    if (!isPasswordStrong) {
      formIsValid = false;
    }

    // Actualizamos los estados con los resultados de la revision
    setErrors(newErrors);
    setIsFormValid(formIsValid);

  }, [firstName, lastName, dni, tel, email, password, confirmPassword]);

  const handleSignUp = async () => {
    // Evita envíos vacíos o duplicados (doble toque)
    if (!isFormValid || loading) return;

    setLoading(true);
    let user = null;

    try {
      // Creamos la cuenta en Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      user = credential.user;

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

      // Nombre visible en Auth (no es crítico si falla)
      await updateProfile(user, { displayName: `${firstName.trim()} ${lastName.trim()}` }).catch(() => {});

      // Enviamos el correo de confirmación y cerramos la sesión:
      // hasta confirmar el correo no se puede ingresar al sistema.
      let correoEnviado = true;
      try {
        await sendEmailVerification(user);
      } catch (e) {
        correoEnviado = false;
      }
      await signOut(auth);

      Alert.alert(
        "Registro exitoso",
        correoEnviado
          ? `Te enviamos un correo de confirmación a ${email.trim()}. Confirmalo para poder iniciar sesión.`
          : "Tu cuenta fue creada, pero no pudimos enviar el correo de confirmación. Intentá iniciar sesión para reenviarlo.",
        [{ text: "Aceptar", onPress: () => navigation.navigate('Login') }],
        { onDismiss: () => navigation.navigate('Login') }
      );

    } catch (error) {
      // Si la cuenta se creó pero el perfil no se pudo guardar, la revertimos
      // para no dejar una cuenta sin perfil y permitir reintentar.
      if (user) {
        await user.delete().catch(() => {});
      }

      const mensajes = {
        'auth/email-already-in-use': 'El correo ya está registrado en otra cuenta.',
        'auth/invalid-email': 'El formato del correo no es válido.',
        'auth/weak-password': 'La contraseña es demasiado débil.',
        'auth/network-request-failed': 'Error de conexión, revisá tu internet.',
        'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.',
        'permission-denied': 'No tenés permisos para completar el registro.',
      };
      Alert.alert("Error de registro", mensajes[error.code] || "Hubo un problema al registrar el usuario.");
    } finally {
      setLoading(false);
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

          <View style={[styles.subContainer, { width: '100%' }]}>

            {/* nombre */}
            <Text style={styles.label}>Nombre *</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Mariano"
                value={firstName}
                onChangeText={(texto) => setFirstName(sololetras(texto))} 
                autoCapitalize="words"
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
                onChangeText={(texto) => setLastName(sololetras(texto))}
                autoCapitalize="words"
              />
            </View>
            {errors.lastName && (
              <Text style={ styles.errortext }>
                {errors.lastName}
            </Text>
            )}
            {/* DNI */}
            <Text style={styles.label}>DNI *</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="id-card" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Solo el numero, sin '.'"
                value={dni}
                onChangeText={(texto) => setDni(texto.replace(/\D/g, '').slice(0, 8))}
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
              <Text style={styles.countryFlag}>🇦🇷</Text>
              <Text style={styles.countryCode}>+54</Text>
              <View style={styles.phoneSeparator} />
              <TextInput
                style={styles.input}
                placeholder="Sin '0' ni '15', ej: 3875666888"
                value={tel}
                onChangeText={(texto) => setTel(texto.replace(/\D/g, '').slice(0, 10))}
                keyboardType="phone-pad"
                maxLength={10}
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
                onChangeText={(texto) => setEmail(texto.replace(/[^a-zA-Z0-9.@_%+-]/g, ''))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
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
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
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
            
            <Text style={styles.label}>Confirmar Contraseña *</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="********"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} accessibilityLabel={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20}  style={styles.icon}/>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errortext}>
                {errors.confirmPassword}
              </Text>
            )}

            <TouchableOpacity 
              style={[styles.button, (!isFormValid || loading) && { backgroundColor: '#D8B77A80' }]} 
              onPress={handleSignUp}
              disabled={!isFormValid || loading} 
            >  
              {loading
                ? <ActivityIndicator color="#FBF1F0" />
                : <Text style={styles.buttonText}>Registrarse</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signUpText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>
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
    borderWidth: 1,
    borderColor: '#E8D2B8',
    borderRadius: 10,
    backgroundColor: '#FFFDFC',
    paddingHorizontal: 12,
    minHeight: 48,
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
    height: 46,
    paddingVertical: 0,
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
  errortext: {
    color: '#D94A3D',
    fontSize: 12,
    alignSelf: 'flex-start',
    width: '100%',
    marginTop: 5,
    marginBottom: 15,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 8,
  },
  countryCode: {
    color: '#6D512A',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
  phoneSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#B88A3B',
    marginRight: 12,
  },
});
