import { esUY } from "@clerk/localizations/es-UY";

const passkey = {
  title: "Usar tu clave de acceso",
  subtitle:
    "Usar tu clave de acceso confirma que sos vos. Tu dispositivo puede solicitar tu huella, rostro o bloqueo de pantalla.",
};

const protectCheck = {
  title: "Verificando tu solicitud",
  subtitle: "Esperá mientras verificamos tu solicitud.",
  loading: "Cargando…",
  retryButton: "Intentar de nuevo",
};

export const clerkLocalization: typeof esUY = {
  ...esUY,
  formFieldInput__emailAddress_format: "Formato de ejemplo: nombre@ejemplo.com",
  formFieldInputPlaceholder__signUpPassword: "Creá una contraseña",
  formFieldInputPlaceholder__username: "Ingresá tu nombre de usuario",
  reverification: {
    ...esUY.reverification,
    alternativeMethods: {
      ...esUY.reverification?.alternativeMethods,
      blockButton__passkey: passkey.title,
    },
    passkey: { ...passkey, blockButton__passkey: passkey.title },
    passkeyMfa: {
      title: "Verificación requerida",
      subtitle: passkey.subtitle,
      blockButton__passkey: passkey.title,
    },
  },
  signIn: {
    ...esUY.signIn,
    emailLink: {
      ...esUY.signIn?.emailLink,
      verifiedTransferable: {
        title: "Correo verificado",
        subtitle: "Volvé a la pestaña original para continuar",
      },
    },
    passkeyMfa: passkey,
    passwordCompromised: {
      ...esUY.signIn?.passwordCompromised,
      title: "Contraseña comprometida",
    },
    passwordUntrusted: {
      ...esUY.signIn?.passwordUntrusted,
      title: "Contraseña no confiable",
    },
    protectCheck,
  },
  signUp: { ...esUY.signUp, protectCheck },
  unstable__errors: {
    ...esUY.unstable__errors,
    form_new_password_matches_current:
      "La contraseña nueva no puede ser igual a la actual.",
    form_password_matches_identifier:
      "La contraseña no puede coincidir con tu correo, teléfono o nombre de usuario. Por seguridad, usá otra contraseña.",
    form_password_untrusted__sign_in:
      "Tu contraseña puede estar comprometida. Para proteger tu cuenta, continuá con otro método de ingreso. Vas a tener que restablecer tu contraseña después de ingresar.",
  },
  userButton: {
    ...esUY.userButton,
    action__openUserMenu: "Abrir menú de usuario",
    action__closeUserMenu: "Cerrar menú de usuario",
  },
};
