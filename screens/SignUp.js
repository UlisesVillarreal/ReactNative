import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  //Estados para los mensajes de validacion
  const [errors,setErrors] = useState({});
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
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

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
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
  // -- VALIDACIONES --
  const handleSignUp = async () => {
    const newErrors = {};
//Validacion de Campos obligatorios


  if (!firstName.trim()) {
    newErrors.firstName = 'El nombre es obligatorio.';
  }
  if (!lastName.trim()) {
    newErrors.lastName = 'El apellido es obligatorio.';
  }
  if (!dni.trim()) {
    newErrors.dni = 'El DNI es obligatorio.';
  } else if (!/^\d{7,8}$/.test(dni.trim())) {
    newErrors.dni = 'El DNI debe tener entre 7 y 8 dígitos.';
  }
  if (!email.trim()) {
    newErrors.email = 'El correo electrónico es obligatorio.';
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Ingresá un correo electrónico válido.';
    }
  }
  if (!password) {
    newErrors.password = 'La contraseña es obligatoria.';
  }  
  if (!confirmPassword) {
    newErrors.confirmPassword = 'La confirmación de la contraseña es obligatoria.';
  } 
  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }
    // validación de Nombre
    const firstNameRegex = /^[a-zA-Z\sñÑ\u00C0-\u017F]+$/;
    if (!firstNameRegex.test(firstName.trim())) {
      Alert.alert(
        "Error",
        "El nombre ingresado no cumple el formato válido"
      );
      return;
    }

    // validación de Apellido
    const lastNameRegex = /^[a-zA-Z\sñÑ\u00C0-\u017F]+$/;
    if (!lastNameRegex.test(lastName.trim())) {
      Alert.alert(
        "Error",
        "El apellido ingresado no cumple el formato válido"
      );
      return;
    }

        // validación de DNI
    const dniRegex = /^\d{7,8}$/;
    if (!dniRegex.test(dni.trim())) {
      Alert.alert(
        "Error",
        "El DNI ingresado no es válido"
      );
      return;
    }

    // validación del Teléfono

    if (tel.trim().length > 0) {
      const telRegex = /^\d{10}$/;
      if (!telRegex.test(tel.trim())) {
        Alert.alert(
          "Error",
          "El Teléfono ingresado no es válido"
        );
        return;
      }
    }

    // Validación de correo
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email.trim())) {
      setErrors((prevErrors) => ({
      ...prevErrors,
      email: 'Ingresá un correo electrónico válido. Ejemplo: usuario@gmail.com'
      }));
      return;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      email: ''
    }));  

    // Validación de confirmación de contraseña
    if (password !== confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: 'Las contraseñas no coinciden.'
      }));
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(password)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: 'Debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.'
      }));
      return;
}



    let credential;
    try {
      credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      console.error('Error de registro:', error.code, error.message);
      let errorMessage = "Hubo un problema al registrar el usuario.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es demasiado débil.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "La clave API de Firebase no es válida. Revisa el archivo .env.";
          break;
      }
      Alert.alert("Error", `${errorMessage}\n\nCódigo: ${error.code ?? 'desconocido'}`);
      return;
    }

    try {
      await updateProfile(credential.user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
      Alert.alert("Registro exitoso", "Usuario registrado con éxito.");
    } catch (error) {
      Alert.alert("Cuenta creada", "La cuenta se creó, pero no se pudo guardar el nombre.");
    }
    // Firebase inicia la sesión y el navegador muestra Home.
  };

  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      >
      <Image source={require('../assets/logotemple2.png')} style={styles.logo} />
      <Text style={styles.title}>Crear Cuenta</Text>

        <ScrollView 
        style={{ width: '100%' }}
        contentContainerStyle={styles.subContainer}
        showsVerticalScrollIndicator={false}
        >
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

        <Text style={styles.label}>Correo *</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="envelope" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Usuario@gmail.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);

              const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

              if (text.trim() === '') {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  email: ''
                }));
              } else if (!emailRegex.test(text.trim())) {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  email: 'Ingresá un correo electrónico válido.'
                }));
              } else {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  email: ''
                }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email && (
          <Text style={styles.errortext}>
            {errors.email}
          </Text>
        )}

        <Text style={styles.label}>Contraseña *</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="********"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              checkPasswordStrength(text);
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} style={styles.icon}/>
          </TouchableOpacity>
        </View>

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

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>  
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signUpText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
        </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
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
    alignItems:'center',
    borderRadius:20,
    paddingTop:20,
    paddingLeft:80,
    paddingRight:80,
    paddingBottom:30,
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 10,
    marginTop:'50',
  },
  title: {
    color:'#6D512A',
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    color:'#6D512A',
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#B88A3B',
    marginBottom: 20,
    width: '130%',
  },
  icon: {
    marginRight: 10,
    color:'#b88a3b',
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
