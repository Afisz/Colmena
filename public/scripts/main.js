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

// router.beforeEach((to, from, next) => {
//   if (to.meta.requiresAuth) {
//     if () {
//       next({
//         name: "login"
//       });
//     } else {
//       next();
//     }
//   } else {
//     next();
//   }
// })

// Aplicación Vue principal
var vmMain = new Vue({
  el: '#vm',
  router,
  store,
  vuetify: new Vuetify(),
  data: {
    isSideBarHidden: true,
    isSideBarVisibleResponsive: false,
    isTareasOn: false
  },
  computed: Vuex.mapState({
    userUid: state => state.userUid,
    userNameGoogle: state => state.userNameGoogle,
    userName: state => {if (state.isTecnico) {return state.tecnico.datos.nombre + ' ' + state.tecnico.datos.apellido} else if (state.isProductora) {return state.productora.datos.nombre}},
    userPhoto: state => {if (state.isTecnico) {return state.tecnico.foto} else if (state.isProductora) {return state.productora.foto}}
  }),
  methods: {
    tareasEstadoComponente: function () {
      if (this.isTareasOn == false) {
        this.isTareasOn = true;
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
    signOut: function () {
      firebase.auth().signOut()
        .then(() => {
          window.location.href = './ingreso.html';
          console.log('Sesión cerrada.');
        })
        .catch((error) => {
          this.$toast.open({
            message: error.message,
            type: "error"
          })
        });
    }
  }
});
