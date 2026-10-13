import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
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
  

  
  // -- VALIDACIONES --
  const handleSignUp = async () => {
    if (!firstName.trim() || !lastName.trim() || !dni || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Debe completar los campos obligatorios (*) .");
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

    // validación de correo
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "Error",
        "El email no respeta el formato correcto 'Usuario@example.com'. Ingresar un formato válido"
      );
      return;
    }

    // validación de contraseña
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 6 caracteres, incluyendo una letra mayúscula, una minúscula y un número."
      );
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
        style={styles.scrollView} 
        contentContainerStyle={styles.subContainer}
        showsVerticalScrollIndicator={false}
        >
        <Text style={styles.label}>Nombre *</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#C68A36" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese su nombre"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <Text style={styles.label}>Apellido *</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#C68A36" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese su apellido"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <Text style={styles.label}>DNI *</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="id-card" size={20} color="#C68A36" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Solo el numero, sin '.'"
            value={dni}
            onChangeText={setDni}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Teléfono</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="phone" size={20} color="#C68A36" style={styles.icon} />
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
          <FontAwesome name="envelope" size={20} color="#C68A36" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Usuario@example.temple"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Contraseña *</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color="#C68A36" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese su contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#C68A36" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar Contraseña *</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color="#C68A36" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirme su contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#C68A36" />
          </TouchableOpacity>
        </View>

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
  subContainer:{
    backgroundColor:'#fbf6ee',
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
  },
  title: {
    color:'#3E2723',
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    color:'#3E2723',
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#b9770e',
    marginBottom: 20,
    width: '130%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  button: {
    backgroundColor: '#C68A36',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    color: '#C68A36',
  },
});
