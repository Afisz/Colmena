'use strict';

// Me permite usar VueToast.js dentro de un elemento de Vue.js
Vue.use(VueToast, {
  // Configuraciones globales
  duration: 4000,
  position: 'top',
});

// Configuraciónn Vue Router
const router = new VueRouter({
  mode: 'history',
  routes,
});

// Aplicación Vue principal
var vmMain = new Vue({
  el: '#vm',
  router,
  store,
  vuetify: new Vuetify(),
  data: {
    isSideBarHidden: true,
    isSideBarVisibleResponsive: false,
    isMenuUsuarioOn: false,
    isMensajesOn: false,
    isNotificacionesOn: false,
    isTareasOn: false,
    isProyectoOn: false,
    nombreProyectoActual: '',
  },
  computed: Vuex.mapState({
    userUid: state => state.userUid,
    userNameGoogle: state => state.userNameGoogle,
    userName: state => { if (state.isTecnico) { return `${state.tecnico.datos.nombre} ${state.tecnico.datos.apellido}` } else if (state.isProductora) { return state.productora.datos.nombre } },
    userPhoto: state => { if (state.isTecnico) { return state.tecnico.foto } else if (state.isProductora) { return state.productora.foto } },
    userNewNotificationsAmount: state => {
      if (state.isTecnico) {
        return state.tecnico.notificaciones.filter(notificacion => notificacion.noLeida).length;
      } else if (state.isProductora) {
        return state.productora.notificaciones.filter(notificacion => notificacion.noLeida).length;
      }
    },
    permisosNav: state => state.tecnicoProyecto.permisos,
    idProyectoSeleccionado: state => state.tecnicoProyecto.idProyecto,
  }),
  methods: {
    menuUsuarioEstado: function () {
      if (this.isMenuUsuarioOn == false) {
        this.isMenuUsuarioOn = true;
        this.isTareasOn = false;
        this.isNotificacionesOn = false;
        this.isMensajesOn = false;
      } else {
        this.isMenuUsuarioOn = false;
      }
    },
    mensajesEstado: function () {
      if (this.isMensajesOn == false) {
        this.isMensajesOn = true;
        this.isTareasOn = false;
        this.isNotificacionesOn = false;
        this.isMenuUsuarioOn = false;
      } else {
        this.isMensajesOn = false;
      }
    },
    notificacionesEstadoComponente: function () {
      if (this.isNotificacionesOn == false) {
        this.isNotificacionesOn = true;
        this.isTareasOn = false;
        this.isMensajesOn = false;
        this.isMenuUsuarioOn = false;
      } else {
        this.isNotificacionesOn = false;
      }
    },
    tareasEstadoComponente: function () {
      if (this.isTareasOn == false) {
        this.isTareasOn = true;
        this.isNotificacionesOn = false;
        this.isMensajesOn = false;
        this.isMenuUsuarioOn = false;
      } else {
        this.isTareasOn = false;
      }
    },
    sidebarHidden: function () {
      if (this.isSideBarHidden == true) {
        this.isSideBarHidden = false;
      } else {
        this.isSideBarHidden = true;
      }
    },
    sidebarHiddenResponsive: function () {
      if (this.isSideBarVisibleResponsive == false) {
        this.isSideBarVisibleResponsive = true;
      } else {
        this.isSideBarVisibleResponsive = false;
      }
    },
    volverAlInicio: function () {
      store.commit('GET_INFO_TECNICOPROYECTO', {idProyecto: '', idTecnicoProyecto: '', permisos: []});
      this.isProyectoOn = false;
      this.nombreProyectoActual = '';
    },
    signOut: function () {
      firebase.auth().signOut()
        .then(() => {
          window.location.href = './ingreso.html';
          console.log('Sesión cerrada.');
        })
        .catch((error) => {
          this.$toast.open({
            message: error.message,
            type: 'error'
          })
        });
    }
  }
});
