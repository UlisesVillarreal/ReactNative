import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Tamaño final del avatar (en píxeles). Chico a propósito: la imagen se guarda
// dentro del documento de Firestore, que tiene un límite de 1 MB.
const AVATAR_SIZE = 256;
const AVATAR_QUALITY = 0.6;

// Opciones comunes del selector: recorte cuadrado, sin base64 (la reducimos nosotros después)
const pickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 1,
};

// Reduce la imagen y la devuelve como "data URI" (texto) lista para guardar y mostrar.
async function toAvatarDataUri(uri) {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: AVATAR_SIZE });
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: AVATAR_QUALITY,
    base64: true,
  });
  return `data:image/jpeg;base64,${result.base64}`;
}

// Abre la galería o la cámara. Devuelve:
//  - un string (data URI) si el usuario eligió una foto
//  - null si canceló
// Lanza un Error con mensaje en español si no hay permisos.
export async function pickProfilePhoto(source) {
  let result;

  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Necesitamos permiso para usar la cámara. Podés habilitarlo desde los ajustes del teléfono.');
    }
    result = await ImagePicker.launchCameraAsync(pickerOptions);
  } else {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Necesitamos permiso para acceder a tus fotos. Podés habilitarlo desde los ajustes del teléfono.');
    }
    result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
  }

  if (result.canceled || !result.assets?.length) return null;
  return toAvatarDataUri(result.assets[0].uri);
}
