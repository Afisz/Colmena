'use strict'

var vmInvitacionesYPermisos = Vue.component('invitacionesypermisos', {
  data: function () {
    return {
      tecnicos: [],
      headers: [
        { text: 'E-Mail', align: 'start', value: 'email' },
        { text: 'Nombre Completo', align: 'center', value: 'nombre' },
        { text: 'Área', align: 'center', value: 'area' },
        { text: 'Permisos', align: 'center', value: 'permisos' },
        { text: 'Estado Invitación', align: 'center', value: 'estado' },
        { text: 'Acciones', align: 'center', value: 'acciones', sortable: false },
      ],
      footerProps: {
        'items-per-page-text': 'Técnixs por página:',
        'items-per-page-all-text': 'Todxs',
        'items-per-page-options': [10, 20, 50, -1],
        options: {itemsPerPage: -1}
      },
      buscar: '',
      dialogInvitar: false,
      tecnicosNuevos: [
        {
          email: '',
          area: '',
          permisos: []
        }
      ],
      formTecnicosValidation: true,
      rules: {
        obligatorio: v => (v != null && v.length > 0) || 'Este campo es obligatorio',
        reglaEmail: v => /.+@gmail.com+/.test(v) || 'Introduzca un E-mail de Gmail válido',
        reglaEmailNoRepetido: v => v == null || this.tecnicosNuevos.filter(tecnicoNuevo => tecnicoNuevo.email == v).length <= 1 || 'Este E-mail ya fue ingresado anteriormente',
      }

    }
  },
  store,
  computed: Vuex.mapState({
    idProyecto: state => state.tecnicoProyecto.idProyecto,
    idTecnicoProyecto: state => state.tecnicoProyecto.idTecnicoProyecto,
    listaAreas: state => Object.keys(state.globales.areasPuestosSueldos),
    listaPermisos: state => state.globales.permisos,
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
                  data.tecnicoProyectos.forEach(tecnico => {
                    _this.tecnicos.push({
                      email: tecnico.datos.email,
                      nombre: `${tecnico.datos.apellido}, ${tecnico.datos.nombre}`,
                      area: tecnico.area,
                      permisos: tecnico.permisos,
                      estado: 'Aceptada',
                    })
                  });
                  data.tecnicosInvitados.forEach(tecnico => {
                    _this.tecnicos.push({
                      email: tecnico.email,
                      nombre: '',
                      area: tecnico.area,
                      permisos: tecnico.permisos,
                      estado: 'Pendiente',
                    })
                  });
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
    editarInvitacion(item) {
      
    },
    eliminarInvitacion(item) {
      
    },
    agregarNuevoUsuarioALaLista: function () {
      this.tecnicosNuevos.push({
        email: '',
        area: '',
        permisos: []
      });
      setTimeout(function () {
        document.getElementById('form-tecnicos-proyecto-nuevo').scrollBy({
          top: 246,
          behaviour: 'smooth'
        });
      }, 100);
    }
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
        <v-data-table
          :headers="headers"
          :items="tecnicos"
          :search="buscar"
          :footer-props="footerProps"
          no-data-text="No hay información disponible"
          sort-by="area"
          class="elevation-2"
        >
          <template v-slot:top>
            <v-toolbar height="90" flat>
              <v-text-field v-model="buscar" append-icon="mdi-magnify" label="Buscar" single-line hide-details></v-text-field>
              <v-spacer></v-spacer>
              <v-btn v-on:click="dialogInvitar = true" color="primary">INVITAR TECNICXS</v-btn>
            </v-toolbar>
          </template>
          <template v-slot:item.permisos="{ item }">
            <v-chip v-for="permiso in item.permisos" x-small> {{ permiso }} </v-chip>
          </template>
          <template v-slot:item.estado="{ item }">
            <v-chip :color="item.estado == 'Aceptada' ? 'light-green' : 'yellow'"> {{ item.estado }} </v-chip>
          </template>
          <template v-slot:item.acciones="{ item }">
            <v-icon small class="mr-2" v-on:click="editarInvitacion(item)">mdi-pencil</v-icon>
            <template v-if="item.estado == 'Pendiente'">
              <v-icon small v-on:click="eliminarInvitacion(item)">mdi-delete</v-icon>
            </template>
          </template>
        </v-data-table>
      </div>
    </div>
    <v-dialog v-model="dialogInvitar" persistent max-width="900px">
      <v-card id="form-invitar-tecnicos" class="mb-12">
        <v-card-text class="px-0">
          Invite a sus primerxs técnicxs al proyecto. Indique el área y los permisos que les dará a cada unx de ellxs (podrá modificarlos luego).
          Recomendamos agregar por lo menos una persona con el permiso "Técnicxs" para que le ayude a seguir invitando a otrxs técnicxs y a manejar sus
          permisos.
        </v-card-text>
        <v-form lazy-validation class="pt-3" v-model="formTecnicosValidation" ref="formTecnicos">
          <div v-for="(tecnico, index) in tecnicosNuevos">
            <div class="row w-100">
              <div class="col-11">
                <div class="row">
                  <div class="form-group col-12 col-md-6">
                    <v-text-field
                      v-model="tecnico.email"
                      :rules="[rules.obligatorio, rules.reglaEmail, rules.reglaEmailNoRepetido]"
                      label="E-mail (solo Gmail)"
                      clearable
                    ></v-text-field>
                  </div>
                  <div class="form-group col-12 col-md-6">
                    <v-select :items="listaAreas" v-model="tecnico.area" :rules="[rules.obligatorio]" label="Área"></v-select>
                  </div>
                </div>
                <div class="row">
                  <div class="form-group col-12">
                    <v-select :items="listaPermisos" v-model="tecnico.permisos" :rules="[rules.obligatorio]" label="Permisos" multiple chips></v-select>
                  </div>
                </div>
              </div>
              <div class="col-1 align-self-center text-center">
                <i
                  v-show="tecnicosNuevos.length > 1"
                  v-on:click="eliminaTecnicoDeLaLista(index)"
                  class="mdi mdi-close boton-eliminar-invitacion-tecnico"
                ></i>
              </div>
            </div>
            <v-divider class="mt-0"></v-divider>
          </div>
          <span id="boton-agregar-invitacion-tecnico" v-on:click="agregarNuevoUsuarioALaLista"
            ><i class="mdi mdi-account-plus btn-icon-prepend"></i> Agregar otro técnico</span
          >
        </v-form>
      </v-card>
    </v-dialog>
  </div>`
})