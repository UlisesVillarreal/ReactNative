# Login y SignUp — proyecto para alumnos

Proyecto Expo en JavaScript con registro (con confirmación de correo), inicio y cierre de sesión, recuperación de contraseña, perfil editable con foto y registro de servicios, usando Firebase Authentication y Firestore. Las credenciales están vacías para que cada alumno conecte su propio proyecto Firebase.

## Funcionalidades

- **Registro** con nombre, apellido, DNI, teléfono (opcional), correo y contraseña segura. La cuenta debe confirmarse desde el correo antes de poder ingresar.
- **Inicio de sesión** con opción de reenviar el correo de confirmación y de recuperar la contraseña.
- **Mi Perfil:** foto de perfil (galería o cámara), edición de nombre, apellido, DNI y teléfono con confirmación previa, y cambio de contraseña (pide la actual).
- **Servicios realizados:** alta, consulta, edición y baja de registros, con buscador por empleado o servicio.
- **Barra inferior** fija con Perfil, Servicios y Cerrar sesión.

Las validaciones de los datos (nombre, DNI, teléfono, contraseña) están en `src/utils/validators.js` y se comparten entre el registro y la edición del perfil.

## Requisitos

- Node.js 22 LTS. Expo SDK 58 requiere Node.js 22.13 o posterior.
- npm, incluido con Node.js.
- Expo Go actualizado en el teléfono.
- Una cuenta de Firebase.

Para comprobar la instalación en CMD o PowerShell:

```text
node -v
npm -v
```

## 1. Preparar el proyecto

1. Descomprimir el ZIP.
2. Abrir la carpeta `login-signup-alumnos` en Visual Studio Code.
3. Abrir una terminal dentro de esa carpeta.
4. Instalar exactamente las dependencias registradas en `package-lock.json`:

```text
npm ci
```

Si `npm ci` indica que faltan archivos o que el lockfile no coincide, usar `npm install`.

## 2. Crear y configurar Firebase

1. Crear un proyecto en <https://console.firebase.google.com/>.
2. En la descripción general, pulsar **Agregar app** y elegir Web `</>`.
3. Escribir un alias. No es necesario habilitar Firebase Hosting.
4. Registrar la aplicación y conservar el objeto `firebaseConfig`.
5. Entrar en **Authentication > Método de acceso**.
6. Agregar y habilitar **Correo electrónico/contraseña**.
7. Entrar en **Firestore Database** y crear la base de datos (modo producción).
8. Abrir la pestaña **Reglas**, pegar el contenido del archivo `firestore.rules` de este proyecto y pulsar **Publicar**. Sin este paso la aplicación no puede leer ni guardar datos.

## 3. Agregar la configuración Firebase

En CMD de Windows:

```text
copy .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Abrir `.env` y completar los seis valores de `firebaseConfig`:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Copiar los valores exactamente y respetar mayúsculas y minúsculas. No agregar comillas, comas ni punto y coma. `.env` está excluido de Git.

## 4. Ejecutar la aplicación

```text
npm start
```

La computadora y el teléfono deben estar conectados a la misma red Wi-Fi. Cuando aparezca el código QR, abrir Expo Go y escanearlo.

Si el teléfono no logra conectarse por la red local, detener Expo con `Ctrl+C` y utilizar el túnel:

```text
npm run start:tunnel
```

Para detener el servidor, presionar `Ctrl+C`.

## 5. Prueba funcional

1. Registrar un usuario con nombre, apellido, DNI, correo y contraseña.
2. La contraseña debe tener al menos ocho caracteres, una mayúscula, una minúscula, un número y un carácter especial; por ejemplo, `Prueba123!`.
3. Abrir el correo de confirmación que envía Firebase (revisar también la carpeta de spam) y pulsar el enlace.
4. Iniciar sesión. Sin confirmar el correo, la aplicación no permite ingresar y ofrece reenviar el mensaje.
5. Confirmar que aparece **Mi Perfil**. Desde allí se puede cambiar la foto, editar cada dato con el lápiz y cambiar la contraseña.
6. Entrar a **Servicios** desde la barra inferior y registrar, editar y eliminar un servicio.
7. Cerrar sesión desde la barra inferior e iniciar sesión nuevamente.
8. Cerrar y volver a abrir Expo Go para comprobar que la sesión se conserva.

## Soluciones rápidas

- **Falta configurar Firebase:** revisar que exista `.env` y que sus seis valores estén completos.
- **Permisos insuficientes:** publicar las reglas de `firestore.rules` en la consola de Firebase (paso 2.8).
- **No llega el correo de confirmación:** revisar spam y, en el Login, usar **Reenviar correo de confirmación**.
- **Clave API no válida:** copiar `apiKey` otra vez y respetar mayúsculas y minúsculas.
- **El QR no conecta:** ejecutar `npm run start:tunnel`.
- **Error de caché o cambios que no aparecen:** ejecutar `npx expo start -c`.
- **Puerto ocupado:** cerrar otra instancia de Expo o aceptar el puerto alternativo propuesto.

## Docker opcional

Los archivos `Dockerfile` y `compose.yaml` permiten ejecutar el mismo proyecto con Docker, pero no son necesarios para el procedimiento anterior:

```text
docker compose up --build
```

## Modelo de datos (Firestore)

**`usuarios/{uid}`** — un documento por cuenta, con el uid de Firebase Authentication como identificador:

| Campo | Descripción |
|---|---|
| `nombre`, `apellido` | Texto. Editables. |
| `dni` | Texto de 7 u 8 dígitos. Editable. |
| `telefono` | Texto de 10 dígitos o vacío. Editable. |
| `correo` | Correo de la cuenta. No editable. |
| `rol` | Siempre `empleado` al registrarse. No editable. |
| `fechaRegistro` | Fecha de alta en formato ISO. |
| `foto` | Opcional. Imagen de perfil reducida a 256 px y guardada como texto (base64), por lo que no requiere Firebase Storage. |

**`servicios/{id}`** — un documento por servicio realizado: `empleado`, `servicio`, `monto` (texto con formato), `montoNumero`, `fecha`, `hora`, `creadoEn` y `creadoPor`.

Las reglas de `firestore.rules` aplican estas restricciones en el servidor: cada usuario solo lee y edita su propio perfil, no puede cambiar su rol ni su correo, y solo las cuentas con el correo confirmado acceden a `servicios`.

## Estructura principal

```text
login-signup-alumnos/
├── assets/                  imágenes y fondos
├── components/
│   ├── BottomBar.js         barra inferior (Perfil, Servicios, Cerrar sesión)
│   ├── ChangePasswordModal.js
│   ├── EditFieldModal.js
│   ├── PersonalInfoCard.js
│   └── ServiceFormModal.js
├── docs/
├── navigation/Navigation.js
├── screens/
│   ├── Home.js              perfil
│   ├── Login.js
│   ├── Services.js          servicios realizados
│   └── SignUp.js
├── src/
│   ├── config/firebaseConfig.js
│   └── utils/
│       ├── profilePhoto.js  selección y reducción de la foto de perfil
│       └── validators.js    validaciones compartidas
├── firestore.rules          reglas de seguridad de Firestore
├── .env.example
├── App.js
├── package-lock.json
└── package.json
```

Si falta `.env` o algún valor, la aplicación muestra un aviso en lugar de iniciar Firebase con una configuración incompleta.

## Notas

- Es un proyecto de práctica. En `servicios`, cualquier usuario con el correo confirmado puede leer, editar y eliminar cualquier registro. Para un uso real habría que restringirlo por rol o por autor en `firestore.rules`.
- Las cuentas creadas antes de activar la confirmación de correo quedan bloqueadas hasta confirmar. Se resuelve iniciando sesión (la aplicación reenvía el correo) o registrando la cuenta de nuevo.
- Las claves de Firebase para web no son secretas, pero conviene restringir la API key en Google Cloud (**APIs y servicios > Credenciales**).
- Los PDF de `docs/` corresponden a la versión inicial del proyecto y no incluyen las funciones descritas arriba.
