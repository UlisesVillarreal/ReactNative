// Validaciones compartidas entre el registro (SignUp) y la edición del perfil (Home).

export const NAME_REGEX = /^[a-zA-Z\sñÑÀ-ſ]+$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const DNI_REGEX = /^\d{7,8}$/;
export const TEL_REGEX = /^\d{10}$/;
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>\-_=+[\];/\\~]/;

// Teclado de solo letras: quita lo que no sea letra y pone mayúscula inicial a cada palabra.
export const sololetras = (texto) =>
  texto
    .replace(/[^a-zA-ZñÑáéíóúüÁÉÍÓÚÜ\s]/g, '')
    .replace(/(^|\s)(\S)/g, (_, espacio, letra) => espacio + letra.toUpperCase());

// Requisitos de contraseña (se usan para la lista con tildes y para validar)
export const getPasswordRequirements = (password) => [
  { label: 'Al menos 8 caracteres', met: password.length >= 8 },
  { label: 'Una letra mayúscula', met: /[A-Z]/.test(password) },
  { label: 'Una letra minúscula', met: /[a-z]/.test(password) },
  { label: 'Un número', met: /[0-9]/.test(password) },
  { label: 'Un carácter especial (@, #, !)', met: SPECIAL_CHAR_REGEX.test(password) },
];

export const isPasswordStrong = (password) =>
  getPasswordRequirements(password).every((r) => r.met);

// Mensaje de error de la contraseña nueva ('' si está bien)
export const getPasswordError = (password) => {
  if (/\s/.test(password)) return 'La contraseña no puede contener espacios en blanco.';
  return '';
};

// Configuración de los campos del perfil que se pueden editar.
export const PROFILE_FIELDS = {
  nombre: {
    label: 'Nombre',
    placeholder: 'Ej: Mariano',
    icon: 'account-circle-outline',
    keyboardType: 'default',
    sanitize: sololetras,
    validate: (v) => {
      const t = v.trim();
      if (!t) return 'El nombre es obligatorio.';
      if (!NAME_REGEX.test(t)) return 'Solo se permiten letras.';
      return '';
    },
  },
  apellido: {
    label: 'Apellido',
    placeholder: 'Ej: Tamer',
    icon: 'account-circle-outline',
    keyboardType: 'default',
    sanitize: sololetras,
    validate: (v) => {
      const t = v.trim();
      if (!t) return 'El apellido es obligatorio.';
      if (!NAME_REGEX.test(t)) return 'Solo se permiten letras.';
      return '';
    },
  },
  dni: {
    label: 'DNI',
    placeholder: "Solo el numero, sin '.'",
    icon: 'card-account-details-outline',
    keyboardType: 'numeric',
    sanitize: (v) => v.replace(/\D/g, '').slice(0, 8),
    validate: (v) => {
      const t = v.trim();
      if (!t) return 'El DNI es obligatorio.';
      if (!DNI_REGEX.test(t)) return 'Debe tener entre 7 y 8 dígitos, solo números.';
      return '';
    },
  },
  telefono: {
    label: 'Teléfono',
    placeholder: "Sin '0' ni '15', ej: 3875666888",
    icon: 'phone-outline',
    keyboardType: 'phone-pad',
    sanitize: (v) => v.replace(/\D/g, '').slice(0, 10),
    validate: (v) => {
      const t = v.trim();
      if (t && !TEL_REGEX.test(t)) return 'El teléfono solo debe tener 10 números, sin otros caracteres.';
      return '';
    },
  },
};
