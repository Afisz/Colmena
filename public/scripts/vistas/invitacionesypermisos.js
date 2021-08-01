'use strict'

var vmInvitacionesYPermisos = Vue.component('invitacionesypermisos', {
  data: function () {
    return {
      tecnicos: {},
    }
  },
  store,
  computed: Vuex.mapState({
    idProyecto: state => state.tecnicoProyecto.idProyecto,
    idTecnicoProyecto: state => state.tecnicoProyecto.idTecnicoProyecto,
  }),
  created() {
    // Busca la información durante la creación del componente
    this.fetchData();
  },
  methods: {
    fetchData: function () {
      let _this = this;
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          user.getIdToken()
            .then(function (token) {
              fetch(`https://us-central1-colmena-cac87.cloudfunctions.net/webApi/tecnicoProyectos/${_this.idProyecto}/tecnicosInvitados/${_this.idTecnicoProyecto}`, {
                method: 'get',
                headers: { 'Authorization': 'Bearer ' + token },
              })
                .then(response => {
                  if (response.ok) {
                    return response.json();
                  } else {
                    return new Error();
                  }
                })
                .then(data => {
                  _this.tecnicos = data;
                  console.log(data);
                })
                .catch(function (error) {
                  console.log(`Hubo un problema con la petición Fetch del TecnicosInvitados: ${error.message}`);
                })
            })
            .catch(function (error) {
              console.log(`Hubo un problema con la obtención del token: ${error.message}`);
            })
        }
      })
    },
  },
  beforeRouteEnter: async (to, from, next) => {
    if (from.fullPath == '/') {
      var getTecnicoPromise = await new Promise((resolve, reject) => {
        var intervalGetTecnico = setInterval(function () {
          if (store.state.tecnico.datos.email != '') {
            clearInterval(intervalGetTecnico);
            resolve('Get de Técnico recibido');
          }
        }, 10);
      });

      const idProyecto = router.history.pending.params.idProyecto;
      if (store.state.isTecnico) {
        const proyecto = store.state.tecnico.proyectos.find(proyecto => proyecto.idProyecto == idProyecto)

        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            user.getIdToken()
              .then(function (token) {
                fetch(`https://us-central1-colmena-cac87.cloudfunctions.net/webApi/tecnicoProyectos/${idProyecto}/${proyecto.idTecnicoProyecto}`, {
                  method: 'get',
                  headers: { 'Authorization': 'Bearer ' + token },
                })
                  .then(response => {
                    if (response.ok) {
                      return response.json();
                    } else {
                      return new Error();
                    }
                  })
                  .then(data => {
                    store.commit('GET_INFO_TECNICOPROYECTO', data);
                    vmMain.isProyectoOn = true;
                    vmMain.nombreProyectoActual = proyecto.nombre;
                    if (to.name === 'invitacionesypermisos' && !store.state.tecnicoProyecto.permisos.includes('Técnicxs')) next({ name: 'dashboard' })
                    else next()
                  })
                  .catch(function (error) {
                    console.log(`Hubo un problema con la petición Fetch del TecnicoProyecto: ${error.message}`);
                  })
              })
              .catch(function (error) {
                console.log(`Hubo un problema con la obtención del token: ${error.message}`);
              })
          }
        })
      }
    } else {
      if (to.name === 'invitacionesypermisos' && !store.state.tecnicoProyecto.permisos.includes('Técnicxs')) next({ name: 'dashboard' })
      else next()
    }
  },
  template:
    `<div class="col-12 stretch-card">
       <div class="card">
         <div class="card-body">
           <h6 class="font-weight-bold mb-3">INVITACIONES Y PERMISOS</h6>
           <v-divider></v-divider>
         </div>
       </div>
     </div>`
})