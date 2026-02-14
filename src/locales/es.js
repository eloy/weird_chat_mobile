export default {
  cancel: 'cancelar',
  delete: 'eliminar',
  close: 'cerrar',
  edit: 'editar',
  save: 'save', // review
  select: 'seleccionar',
  submit: 'enviar',
  submitting: 'enviando',
  create_model: 'guarda nuevo {{model}}',
  update_model: 'actualiza {{model}}',
  model_created: '{{model}} creado',
  model_updated: '{{model}} actualizado',
  show_password: 'mostrar password',
  menu: {
    sign_out: 'Cerrar sesión',
    open_new_chat: 'Empezar nuevo chat'
  },
  login: {
    no_code_yet: "¿No has recibido el código?",
    no_account_yet: "¿No tienes cuenta de usuario?",
    code_received: "¿Ya tienes el código?",
    account_created_already: "¿Ya tienes cuenta de usuario?",
    signin: {
      header: 'Solicita el Código',
      subheader: "Introduce tu email para que enviemos un codigo para acceder a tu cuenta"
    },
    signup: {
      header: 'Nuevo Usuario',
      subheader: "Crea una cuenta de usuario para empezar"
    },
    code: {
      header: 'Valida tu Código',
      subheader: 'Introduce el código que te hemos enviado por correo electronico para continuar'
    }
  },
  assistants: {
    title: '¿Con quien quieres hablar?'
  },
  chat: {
    input_placeholder: 'Escribe algo bonito'
  },
  first_message: {
    title: 'Primer Mensaje',
    header: 'Elige el primer mensaje para {{assistant_name}}',
    cancel: 'Escribiré el mensaje yo mismo',
    suggestions: [
      'Hola {{assistant_name}}, ¿que tal estas?',
      'Me llamo {{user_name}}, encantado de hablar contigo'
    ]
  }
}
