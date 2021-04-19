'use strict';

const store = new Vuex.Store({
  state: {
    userUid: null,
    userNameGoogle: '',
    isTecnico: false,
    isProductora: false,
    tecnico: {
      consentimientoDatos: false,
      datos: {
        apellido: '',
        codigoArea: '',
        cuil: '',
        datosBancarios: {
          banco: '',
          cbu: '',
          numeroCuenta: '',
          tipoCuenta: '',
        },
        direccion: '',
        dni: '',
        email: '',
        fechaNacimiento: '',
        nacionalidad: '',
        nombre: '',
        obraSocial: '',
        sat: false,
        sica: false,
        telefono: '',
      },
      foto: '',
      invitacionesProyectos: [],
      isProductora: false,
      isTecnico: true,
      nuevoUsuario: true,
      proyectos: [],
      tareas: [],
    },
    productora: {
      consentimientoDatos: false,
      datos: {
        codigoArea: '',
        cuit: '',
        direccion: '',
        email: '',
        nombre: '',
        razonSocial: '',
        telefono: '',
      },
      foto: '',
      isProductora: true,
      isTecnico: false,
      nuevoUsuario: true,
      proyectos: [],
      tareas: [],
    },
    globales: {
      areasPuestosSueldos: {},
      bancos: [],
      permisos: [],
      tiposCuenta: [],
      tiposProyecto: []
    }
  },
  mutations: {
    // Setea la UID del usuario en la store
    GET_INFO_USUARIO(state, user) {
      state.userUid = user.uid;
      state.userNameGoogle = user.displayName;
    },
    // Setea la informacion del Get de Técnico en la store
    GET_INFO_TECNICO(state, data) {
      state.tecnico = data;
      state.isTecnico = data.isTecnico;
      state.isProductora = data.isProductora;
    },
    // Setea la informacion del Get de Productora en la store
    GET_INFO_PRODUCTORA(state, data) {
      state.productora = data;
      state.isTecnico = data.isTecnico;
      state.isProductora = data.isProductora;
    },
    // Setea la informacion del Put de Técnico en la store
    PUT_INFO_TECNICO(state, data) {
      state.tecnico.datos.apellido = data.datos.apellido;
      state.tecnico.datos.codigoArea = data.datos.codigoArea;
      state.tecnico.datos.cuil = data.datos.cuil;
      state.tecnico.datos.datosBancarios.banco = data.datos.datosBancarios.banco;
      state.tecnico.datos.datosBancarios.cbu = data.datos.datosBancarios.cbu;
      state.tecnico.datos.datosBancarios.numeroCuenta = data.datos.datosBancarios.numeroCuenta;
      state.tecnico.datos.datosBancarios.tipoCuenta = data.datos.datosBancarios.tipoCuenta;
      state.tecnico.datos.direccion = data.datos.direccion;
      state.tecnico.datos.dni = data.datos.dni;
      state.tecnico.datos.fechaNacimiento = data.datos.fechaNacimiento;
      state.tecnico.datos.nacionalidad = data.datos.nacionalidad;
      state.tecnico.datos.nombre = data.datos.nombre;
      state.tecnico.datos.obraSocial = data.datos.obraSocial;
      state.tecnico.datos.sat = data.datos.sat;
      state.tecnico.datos.sica = data.datos.sica;
      state.tecnico.datos.telefono = data.datos.telefono;
      state.tecnico.nuevoUsuario = data.nuevoUsuario;
      state.tecnico.consentimientoDatos = data.consentimientoDatos;
      if (data.foto) {state.tecnico.foto = data.foto}
    },
    // Setea la informacion del Put de Productora en la store
    PUT_INFO_PRODUCTORA(state, data) {
      state.productora.datos.codigoArea = data.datos.codigoArea;
      state.productora.datos.cuit = data.datos.cuit;
      state.productora.datos.direccion = data.datos.direccion;
      state.productora.datos.nombre = data.datos.nombre;
      state.productora.datos.razonSocial = data.datos.razonSocial;
      state.productora.datos.telefono = data.datos.telefono;
      state.productora.nuevoUsuario = data.nuevoUsuario;
      state.productora.consentimientoDatos = data.consentimientoDatos;
      if (data.foto) {state.productora.foto = data.foto}
    },
    // Setea la informacion del Put de Tareas de Técnico en la store
    PUT_TAREAS(state, data) {
      if (state.isTecnico) {
        state.tecnico.tareas = data;
      } else if (state.isProductora) {
        state.productora.tareas = data;
      }
    },
    // Setea la informacion del Post de Proyecto de Técnico en la store
    POST_PROYECTO_PRODUCTORA(state, data) {
      state.productora.proyectos.push(data);
    },
    // Setea la informacion del Get de Globales en la store
    GET_GLOBALES(state, data) {
      state.globales = data;
    }
  }
})