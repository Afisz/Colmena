'use strict'

var vmNotificaciones = Vue.component('notificaciones', {
  data: function () {
    return {
      isNotificacionesOn: true,
      userNotifications: []
    }
  },
  methods: {
    fetchAndUpdateData: function () {
      // Fetch data
      this.userNotifications = this.userNotificationsStore.reverse();

      if (this.userNotifications.length > 0) {
        // Update data
        let _this = this;
        var readedNtotifications = this.userNotifications.map(notification => {
          return {
            ...notification,
            noLeida: false
          };
        });

        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            user.getIdToken()
              .then(function (token) {
                fetch(`https://us-central1-colmena-cac87.cloudfunctions.net/webApi/notificaciones/${user.uid}`, {
                  method: 'put',
                  headers: { 'Authorization': 'Bearer ' + token },
                  body: JSON.stringify(readedNtotifications)
                })
                  .then(response => {
                    if (response.ok) {
                      store.commit('PUT_NOTIFICACIONES', readedNtotifications);
                    } else {
                      _this.$toast.open({
                        message: 'Error PUT Notificaciones.',
                        type: 'error'
                      })
                    }
                    return response.json();
                  })
                  .then(data => { console.log(data) })
                  .catch(function (error) {
                    _this.$toast.open({
                      message: error.message,
                      type: 'error'
                    })
                    console.log(`Hubo un problema con la petición Fetch de las Notificaciones: ${error.message}`);
                  })
              })
              .catch(function (error) {
                _this.$toast.open({
                  message: error.message,
                  type: 'error'
                })
                console.log(`Hubo un problema con la obtención del token: ${error.message}`);
              })
          }
        })

        // Marca como leídas las notificaciones
        setTimeout(() => this.userNotifications = readedNtotifications, 1000);
      }
    },
    notificacionSeleccionada: function (notificacion) {
      switch (notificacion.mensaje) {
        case 'Invitación a proyecto':
          const proyectoInvitado = this.invitacionesAProyectos.find(element => element.idInvitacion == notificacion.id);
          const index = this.invitacionesAProyectos.findIndex(element => element == proyectoInvitado);

          if (proyectoInvitado) {
            if (window.location.pathname == '/') {
              vmMain.$route.matched[0].instances.default.aperturaMenuInvitacionProyecto(proyectoInvitado, index);
            } else {
              this.$router.push({path: '/'}, () => {
                setTimeout(() => vmMain.$route.matched[0].instances.default.aperturaMenuInvitacionProyecto(proyectoInvitado, index), 100);
                store.commit('GET_INFO_TECNICOPROYECTO', {idProyecto: '', idTecnicoProyecto: '', permisos: []});
                vmMain.isProyectoOn = false;
                vmMain.nombreProyectoActual = '';
              });
            }
          } else {
            const proyecto = this.proyectos.find(element => element.idInvitacion == notificacion.id);

            if (window.location.pathname == '/') {
              vmMain.$route.matched[0].instances.default.abrirProyecto(proyecto);
            } else {
              this.$router.push({path: '/'}, () => {
                setTimeout(() => vmMain.$route.matched[0].instances.default.abrirProyecto(proyecto), 100);
              });
            }
          }
          
          vmMain.notificacionesEstadoComponente();
          break;
      }
    }
  },
  store,
  computed: Vuex.mapState({
    userNotificationsStore: state => { if (state.isTecnico) { return state.tecnico.notificaciones } else if (state.isProductora) { return state.productora.notificaciones } },
    invitacionesAProyectos: state => { if (state.isTecnico) { return state.tecnico.invitacionesProyectos } else if (state.isProductora) { return undefined } },
    proyectos: state => { if (state.isTecnico) { return state.tecnico.proyectos } else if (state.isProductora) { return state.productora.proyectos } },
  }),
  created() {
    this.fetchAndUpdateData();
  },
  template:
    `<div id="notificaciones" class="dropdown-menu dropdown-menu-right navbar-dropdown preview-list" v-bind:class="{'show': isNotificacionesOn}">
    <p class="mb-0 font-weight-normal float-left dropdown-header">Notificaciones</p>
    <a v-if="userNotifications.length == 0" class="dropdown-item preview-item">
      <div class="preview-item-content">
        <p class="font-weight-light small-text mb-0 text-muted">No tenés notificaciones</p>
      </div>
    </a>
    <a
      v-else
      v-for="(notificacion, index) in userNotifications"
      class="dropdown-item preview-item"
      v-bind:class="{'notificacion-no-leida': notificacion.noLeida}"
      v-on:click="notificacionSeleccionada(notificacion)"
    >
      <div class="preview-thumbnail">
        <div class="preview-icon" v-bind:class="notificacion.color">
          <i class="mdi mx-0" v-bind:class="notificacion.icono"></i>
        </div>
      </div>
      <div class="preview-item-content">
        <h6 class="preview-subject font-weight-normal">{{notificacion.mensaje}}</h6>
        <p class="font-weight-light small-text mb-0 text-muted">{{notificacion.fecha}}</p>
      </div>
    </a>
  </div>`
})