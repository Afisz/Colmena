'use strict'

var vmInicio = Vue.component('inicio', {
  data: function () {
    return {
      // Ayudas varias
      dialog: false,
      actualizando: false,
      pasoProyecto: 1,
      formDatosValidation: true,
      formTecnicosValidation: true,
      formFotoValidation: true,
      // Formulario Datos
      nombreProyectoNuevo: '',
      siglaProyectoNuevo: '',
      directorProyectoNuevo: '',
      tipoProyectoNuevo: '',
      nombreProductoraProyectoNuevo: '',
      razonSocialProyectoNuevo: '',
      cuitProyectoNuevo: '',
      direccionProyectoNuevo: '',
      // Formulario técnicos
      listaPuestos: [],
      tecnicosNuevos: [
        {
          email: '',
          area: '',
          puesto: '',
          permisos: []
        }
      ],
      // Reglas formularios
      rules: {
        reglasCuit: v => v == null || v.length >= 13 || v.length == 0 || 'El C.U.I.T. debe tener 11 dígitos',
        obligatorio: v => v == null || v.length > 0 || 'Este campo es obligatorio',
        reglaEmail: v => /.+@gmail.com+/.test(v) || 'Introduzca un E-mail de Gmail válido',
      }
    }
  },
  methods: {
    // Pre-carga los datos de la productora en el formulario datos proyecto nuevo
    aperturaMenuProyectoNuevo: function () {
      this.nombreProductoraProyectoNuevo = this.nombreProductora;
      this.razonSocialProyectoNuevo = this.razonSocialProductora;
      this.cuitProyectoNuevo = this.cuitProductora;
      this.direccionProyectoNuevo = this.direccionProductora;
    },
    // Post proyecto nuevo
    crearProyecto: function () {
      let _this = this;
      var datos = {
        datos: {
          cuit: this.cuitProyectoNuevo,
          direccion: this.direccionProyectoNuevo,
          director: this.directorProyectoNuevo,
          nombre: this.nombreProyectoNuevo,
          productora: this.nombreProductoraProyectoNuevo,
          razonSocial: this.razonSocialProyectoNuevo,
          sigla: this.siglaProyectoNuevo,
        },
        tipoProyecto: this.tipoProyectoNuevo
      };
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          user.getIdToken()
            .then(function (token) {
              fetch('https://us-central1-colmena-cac87.cloudfunctions.net/webApi/proyectos', {
                method: 'POST',
                headers: {'Authorization': 'Bearer ' + token},
                body: JSON.stringify(datos)
              })
                .then(response => {
                  return response.json();
                })
                .then(data => {
                  store.commit('POST_PROYECTO_PRODUCTORA', {
                    director: datos.datos.director,
                    id: data.id,
                    nombre: datos.datos.nombre,
                    productora: datos.datos.productora,
                    tipoProyecto: datos.tipoProyecto,
                  });
                  _this.dialog = false;
                  _this.$toast.open({
                    message: "Proyecto creado.",
                    type: "success"
                  })
                  console.log(data);
                })
                .catch(function (error) {
                  _this.$toast.open({
                    message: error.message,
                    type: "error"
                  })
                  console.log('Hubo un problema con la creación del proyecto: ' + error.message);
                })
            })
            .catch(function (error) {
              _this.$toast.open({
                message: error.message,
                type: "error"
              })
              console.log('Hubo un problema con la obtención del token: ' + error.message);
            })
        }
      })
    },
    eliminaTecnicoDeLaLista: function (index) {
      if (this.tecnicosNuevos.length > 1) {
        this.tecnicosNuevos.splice(index, 1);
      }
    },
    agregarNuevoUsuarioALaLista: function () {
      this.tecnicosNuevos.push({
        email: '',
        area: '',
        puesto: '',
        permisos: []
      });
      setTimeout(function() {
        document.getElementById('form-tecnicos-proyecto-nuevo').scrollBy({
          top: 246,
          behaviour: 'smooth'
        });
        }, 100);
    },
    cancelarProyectoNuevo: function () {
      this.dialog = false;
      this.pasoProyecto = 1;
      this.nombreProyectoNuevo = '';
      this.siglaProyectoNuevo = '';
      this.directorProyectoNuevo = '';
      this.tipoProyectoNuevo = '';
      this.tecnicosNuevos = [
        {
        email: '',
        area: '',
        puesto: '',
        permisos: []
        }
      ];
      this.$refs.formDatos.resetValidation();
      this.$refs.formTecnicos.resetValidation();
      this.$refs.formConsentimiento.resetValidation();
    },
    siguienteFilminaProyectoNuevo: function (seccion) {
      this.pasoProyecto++;
      if (seccion == 'datos') {
        this.$refs.formDatos.validate();
      } else if (seccion == 'tecnicos') {
        this.$refs.formTecnicos.validate();
      }
    },
    filtroPuestos: function (index) {
      this.listaPuestos = Object.keys(this.areasPuestosSueldos[this.tecnicosNuevos[index].area]);
    }
  },
  store,
  computed: Vuex.mapState({
    // Datos Técnico
    proyectosTecnico: state => state.tecnico.proyectos,

    // Datos Productora
    proyectosProductora: state => state.productora.proyectos,
    nombreProductora: state => state.productora.datos.nombre,
    razonSocialProductora: state => state.productora.datos.razonSocial,
    cuitProductora: state => state.productora.datos.cuit,
    direccionProductora: state => state.productora.datos.direccion,

    // Datos Globales
    isTecnico: state => state.isTecnico,
    isProductora: state => state.isProductora,
    listaTiposProyecto: state => state.globales.tiposProyecto,
    areasPuestosSueldos: state => state.globales.areasPuestosSueldos,
    listaAreas: state => Object.keys(state.globales.areasPuestosSueldos),
    listaPermisos: state => state.globales.permisos,
    completeFormValidation: function() {return this.formDatosValidation && this.formTecnicosValidation && this.formFotoValidation;},
  }),
  template:
    `<div class="col-12 stretch-card">
    <div class="card">
      <div class="card-body">
        <div v-if="isTecnico">
          <h6 class="font-weight-bold mb-3">MIS PROYECTOS</h6>
          <v-divider></v-divider>
          <div class="row">
            <div v-for="(proyecto, index) in proyectosTecnico" class="col-md-3">
              <v-hover v-slot="{hover}">
                <v-card
                  class="proyectos-card bg-light"
                  :class="{'on-hover': hover}"
                >
                  <v-responsive :aspect-ratio="4/4">
                    <v-card-text>
                      <h4 class="text-muted">{{proyecto.productora}}</h4>
                      <h3 class="nombre-episodio-tarjetas">
                        {{proyecto.nombre}}
                      </h3>
                      <hr />
                      <div class="text-muted">
                        <span>Dir.: {{proyecto.director}}</span>
                      </div>
                    </v-card-text>
                  </v-responsive>
                </v-card>
              </v-hover>
            </div>
          </div>
        </div>
        <div v-if="isProductora">
          <h6 class="font-weight-bold mb-3">PROYECTOS</h6>
          <v-divider></v-divider>
          <div class="row">
            <div class="col-md-3">
              <v-dialog v-model="dialog" persistent max-width="900px">
                <template v-slot:activator="{ on, attrs }">
                  <v-hover v-slot="{hover}">
                    <v-card
                      v-bind="attrs"
                      v-on="on"
                      v-on:click="aperturaMenuProyectoNuevo"
                      class="proyectos-card d-flex"
                      :class="{'on-hover': hover}"
                    >
                      <v-responsive :aspect-ratio="4/4">
                        <v-card-text class="h-100 d-flex align-items-center">
                          <div class="col">
                            <div class="row d-flex justify-content-center">
                              <i
                                id="boton-nuevo-proyecto"
                                class="mdi mdi-plus"
                              ></i>
                            </div>
                            <div class="row d-flex justify-content-center">
                              <h4 class="text-muted">Nuevo Proyecto</h4>
                            </div>
                          </div>
                        </v-card-text>
                      </v-responsive>
                    </v-card>
                  </v-hover>
                </template>
                <v-stepper v-model="pasoProyecto">
                  <v-stepper-header>
                    <v-stepper-step
                      color="#4d83ff"
                      :complete="pasoProyecto > 1 && formDatosValidation"
                      step="1"
                      :rules="[() => formDatosValidation]"
                      v-on:click="pasoProyecto = 1"
                    >
                      DATOS
                    </v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step
                      color="#4d83ff"
                      :complete="pasoProyecto > 2 && formTecnicosValidation"
                      step="2"
                      :rules="[() => formTecnicosValidation]"
                      v-on:click="pasoProyecto = 2"
                    >
                      TÉCNICOS Y PERMISOS
                    </v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step
                      color="#4d83ff"
                      step="3"
                      :rules="[() => formFotoValidation]"
                      v-on:click="pasoProyecto = 3"
                    >
                      FOTO Y LOGO
                    </v-stepper-step>
                  </v-stepper-header>
                  <v-stepper-items>
                    <v-stepper-content step="1">
                      <v-card id="form-datos-proyecto-nuevo" class="mb-12">
                        <v-form
                          lazy-validation
                          class="pt-3"
                          v-model="formDatosValidation"
                          ref="formDatos"
                        >
                          <div class="row w-100">
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model="nombreProyectoNuevo"
                                label="Nombre del proyecto"
                                :rules="[rules.obligatorio]"
                                clearable
                              ></v-text-field>
                            </div>
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model="directorProyectoNuevo"
                                label="Director/a"
                                :rules="[rules.obligatorio]"
                                clearable
                              ></v-text-field>
                            </div>
                          </div>
                          <div class="row w-100">
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model:value="siglaProyectoNuevo"
                                label="Sigla del proyecto"
                                :rules="[rules.obligatorio]"
                                clearable
                              ></v-text-field>
                            </div>
                            <div class="form-group col-12 col-md-6">
                              <v-select
                                :items="listaTiposProyecto"
                                v-model="tipoProyectoNuevo"
                                label="Tipo de proyecto"
                                :rules="[rules.obligatorio]"
                              ></v-select>
                            </div>
                          </div>
                          <div class="row w-100">
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model="nombreProductoraProyectoNuevo"
                                label="Nombre de la Productora"
                                :rules="[rules.obligatorio]"
                                clearable
                              ></v-text-field>
                            </div>
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model="razonSocialProyectoNuevo"
                                label="Razón Social"
                                :rules="[rules.obligatorio]"
                                clearable
                              ></v-text-field>
                            </div>
                          </div>
                          <div class="row w-100">
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model="cuitProyectoNuevo"
                                :rules="[rules.reglasCuit, rules.obligatorio]"
                                label="C.U.I.T."
                                v-mask="'##-########-#'"
                                clearable
                              ></v-text-field>
                            </div>
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model="direccionProyectoNuevo"
                                label="Dirección"
                                :rules="[rules.obligatorio]"
                                clearable
                              ></v-text-field>
                            </div>
                          </div>
                        </v-form>
                      </v-card>
                      <div class="row justify-content-center">
                        <div class="col">
                          <button
                            type="button"
                            class="btn btn-secondary btn-block btn-lg font-weight-medium auth-form-btn"
                            v-on:click="cancelarProyectoNuevo"
                          >
                            CANCELAR
                          </button>
                        </div>
                        <div class="col">
                          <button
                            type="button"
                            class="btn btn-primary btn-block btn-lg font-weight-medium auth-form-btn"
                            v-on:click="siguienteFilminaProyectoNuevo('datos')"
                          >
                            SIGUIENTE
                          </button>
                        </div>
                      </div>
                    </v-stepper-content>
                    <v-stepper-content step="2">
                      <v-card id="form-tecnicos-proyecto-nuevo" class="mb-12">
                        <v-card-text class="px-0">
                          Invite a sus primeros técnicos al proyecto. Indique el
                          área, el puesto y los permisos que le dará a cada uno de
                          ellos (podrá modificarlos luego). Recomendamos agregar
                          por lo menos al/los encargado/s de las Altas de los
                          técnicos para que le ayude a seguir invitando a otros
                          técnicos y a manejar sus permisos.
                        </v-card-text>
                        <v-form
                          lazy-validation
                          class="pt-3"
                          v-model="formTecnicosValidation"
                          ref="formTecnicos"
                        >
                          <div v-for="(tecnico, index) in tecnicosNuevos">
                            <div class="row w-100">
                              <div class="col-11">
                                <div class="row">
                                  <div class="form-group col-12 col-md-6">
                                    <v-text-field
                                      v-model="tecnico.email"
                                      :rules="[rules.obligatorio, rules.reglaEmail]"
                                      label="E-mail (solo Gmail)"
                                      clearable
                                    ></v-text-field>
                                  </div>
                                  <div class="form-group col-12 col-md-6">
                                    <v-select
                                      :items="listaAreas"
                                      v-model="tecnico.area"
                                      :rules="[rules.obligatorio]"
                                      label="Área"
                                      v-on:change="filtroPuestos(index)"
                                    ></v-select>
                                  </div>
                                </div>
                                <div class="row">
                                  <div class="form-group col-12 col-md-6">
                                    <v-select
                                      :items="listaPuestos"
                                      v-model="tecnico.puesto"
                                      :rules="[rules.obligatorio]"
                                      label="Puesto"
                                      no-data-text="Primero debe seleccionar el Área"
                                    ></v-select>
                                  </div>
                                  <div class="form-group col-12 col-md-6">
                                    <v-select
                                      :items="listaPermisos"
                                      v-model="tecnico.permisos"
                                      :rules="[rules.obligatorio]"
                                      label="Permisos"
                                      multiple
                                      chips
                                    ></v-select>
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
                          <span
                            id="boton-agregar-invitacion-tecnico"
                            v-on:click="agregarNuevoUsuarioALaLista"
                            ><i class="mdi mdi-account-plus btn-icon-prepend"></i>
                            Agregar otro técnico</span
                          >
                        </v-form>
                      </v-card>
                      <div class="row justify-content-center">
                        <div class="col-3">
                          <button
                            type="button"
                            class="btn btn-secondary btn-block btn-lg font-weight-medium auth-form-btn"
                            v-on:click="cancelarProyectoNuevo"
                          >
                            CANCELAR
                          </button>
                        </div>
                        <div class="col-3">
                          <button
                            type="button"
                            class="btn btn-outline-secondary btn-block btn-lg font-weight-medium auth-form-btn"
                            v-on:click="pasoProyecto--"
                          >
                            ATRÁS
                          </button>
                        </div>
                        <div class="col-6">
                          <button
                            type="button"
                            class="btn btn-primary btn-block btn-lg font-weight-medium auth-form-btn"
                            v-on:click="siguienteFilminaProyectoNuevo('tecnicos')"
                          >
                            SIGUIENTE
                          </button>
                        </div>
                      </div>
                    </v-stepper-content>
                    <v-stepper-content step="3">
                      <v-card
                        id="form-foto-proyecto-nuevo"
                        class="mb-12"
                      >
                        <v-form
                          lazy-validation
                          class="pt-3"
                          v-model="formFotoValidation"
                          ref="formConsentimiento"
                        >
                          <div class="row">
                            <div class="form-group col-12 col-md-6">
                              
                            </div>
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model="directorProyectoNuevo"
                                label="Director/a"
                                :rules="[rules.obligatorio]"
                                clearable
                              ></v-text-field>
                            </div>
                          </div>
                          <div class="row">
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model:value="siglaProyectoNuevo"
                                label="Sigla del proyecto"
                                :rules="[rules.obligatorio]"
                                clearable
                              ></v-text-field>
                            </div>
                            <div class="form-group col-12 col-md-6">
                              <v-select
                                :items="listaTiposProyecto"
                                v-model="tipoProyectoNuevo"
                                label="Tipo de proyecto"
                                :rules="[rules.obligatorio]"
                              ></v-select>
                            </div>
                          </div>
                        </v-form>
                      </v-card>
                      <div class="row justify-content-center">
                        <div class="col-3">
                          <button
                            type="button"
                            class="btn btn-secondary btn-block btn-lg font-weight-medium auth-form-btn"
                            v-on:click="cancelarProyectoNuevo"
                          >
                            CANCELAR
                          </button>
                        </div>
                        <div class="col-3">
                          <button
                            type="button"
                            class="btn btn-outline-secondary btn-block btn-lg font-weight-medium auth-form-btn"
                            v-on:click="pasoProyecto--"
                          >
                            ATRÁS
                          </button>
                        </div>
                        <div class="col-6">
                          <button
                            type="button"
                            class="btn btn-block btn-lg font-weight-medium auth-form-btn"
                            v-bind:class="{'btn-primary': completeFormValidation, 'btn-danger': !completeFormValidation}"
                            v-bind:disabled="!completeFormValidation"
                            v-on:click="crearProyecto"
                          >
                            <div v-if="!actualizando && completeFormValidation">
                              CREAR PROYECTO
                            </div>
                            <div v-if="actualizando && completeFormValidation">
                              <span
                                class="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              ></span>
                            </div>
                            <div v-if="!completeFormValidation">
                              <i
                                class="mdi mdi-close-octagon btn-icon-prepend"
                              ></i>
                              CORRIJA LOS ERRORES
                            </div>
                          </button>
                        </div>
                      </div>
                    </v-stepper-content>
                  </v-stepper-items>
                </v-stepper>
              </v-dialog>
            </div>
            <div
              v-for="(proyecto, index) in proyectosProductora"
              class="col-md-3"
            >
              <v-hover v-slot="{hover}">
                <v-card
                  class="proyectos-card bg-light"
                  :class="{'on-hover': hover}"
                >
                  <v-responsive :aspect-ratio="4/4">
                    <v-card-text>
                      <h4 class="text-muted">{{proyecto.productora}}</h4>
                      <h3 class="nombre-episodio-tarjetas">
                        {{proyecto.nombre}}
                      </h3>
                      <hr />
                      <div class="text-muted">
                        <span>Dir.: {{proyecto.director}}</span>
                      </div>
                    </v-card-text>
                  </v-responsive>
                </v-card>
              </v-hover>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})