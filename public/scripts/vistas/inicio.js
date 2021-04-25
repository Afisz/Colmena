'use strict'

var vmInicio = Vue.component('inicio', {
  data: function () {
    return {
      // Ayudas varias
      dialog: false,
      dialogEditor: false,
      creando: false,
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
      // Formulario fotos
      usaLogoActual: false,
      logoProductoraProyecto: null,
      portadaProyecto: null,
      myDropzoneLogo: null,
      myDropzonePortada: null,
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
      this.inicializacionDropzone();
    },
    // Post proyecto nuevo
    crearProyecto: function () {
      document.getElementById('boton-crear-proyecto').disabled = true;
      this.creando = true;
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
        tipoProyecto: this.tipoProyectoNuevo,
        logoProductora: this.usaLogoActual ? this.logoProductora : '',
        tecnicosInvitados: this.tecnicosNuevos
      };
      var formData = new FormData();
      formData.append("data", JSON.stringify(datos));
      if (this.logoProductoraProyecto) {
        formData.append("logo", this.logoProductoraProyecto, 'logo-productora-proyecto.png');
      }
      if (this.portadaProyecto) {
        formData.append("portada", this.portadaProyecto, 'portada-proyecto.png');
      }
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          user.getIdToken()
            .then(function (token) {
              fetch('https://us-central1-colmena-cac87.cloudfunctions.net/webApi/proyectos', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData
              })
                .then(response => response.json())
                .then(data => {
                  store.commit('POST_PROYECTO_PRODUCTORA', {
                    director: datos.datos.director,
                    id: data.id,
                    nombre: datos.datos.nombre,
                    productora: datos.datos.productora,
                    tipoProyecto: datos.tipoProyecto,
                    foto: data.portada
                  });
                  _this.creando = false;
                  document.getElementById('boton-crear-proyecto').disabled = false;
                  _this.$refs.formDatos.resetValidation();
                  _this.$refs.formTecnicos.resetValidation();
                  _this.$refs.formFoto.resetValidation();
                  _this.dialog = false;
                  _this.pasoProyecto = 1;
                  _this.nombreProyectoNuevo = '';
                  _this.siglaProyectoNuevo = '';
                  _this.directorProyectoNuevo = '';
                  _this.tipoProyectoNuevo = '';
                  _this.tecnicosNuevos = [
                    {
                      email: '',
                      area: '',
                      puesto: '',
                      permisos: []
                    }
                  ];
                  _this.myDropzonePortada.removeAllFiles(true);
                  _this.myDropzoneLogo.removeAllFiles(true);
                  _this.$toast.open({
                    message: "Proyecto creado.",
                    type: "success"
                  })
                  console.log(data);
                })
                .catch(function (error) {
                  _this.creando = false;
                  document.getElementById('boton-crear-proyecto').disabled = false;
                  _this.$toast.open({
                    message: error.message,
                    type: "error"
                  })
                  console.log('Hubo un problema con la creación del proyecto: ' + error.message);
                })
            })
            .catch(function (error) {
              _this.creando = false;
              document.getElementById('boton-crear-proyecto').disabled = false;
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
      setTimeout(function () {
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
      this.myDropzonePortada.removeAllFiles(true);
      this.myDropzoneLogo.removeAllFiles(true);
      this.$refs.formDatos.resetValidation();
      this.$refs.formTecnicos.resetValidation();
      this.$refs.formFoto.resetValidation();
    },
    siguienteFilminaProyectoNuevo: function (paso) {
      this.pasoProyecto = paso + 1;
      if (paso == 1) {
        this.$refs.formDatos.validate();
      } else if (paso == 2) {
        this.$refs.formDatos.validate();
        this.$refs.formTecnicos.validate();
      }
    },
    filtroPuestos: function (index) {
      this.listaPuestos = Object.keys(this.areasPuestosSueldos[this.tecnicosNuevos[index].area]);
    },
    inicializacionDropzone: function () {
      var _this = this;

      var intervalDropzoneLogo = setInterval(function () {
        try {
          _this.myDropzoneLogo = new Dropzone("div#logo-upload", {
            url: "/file/post",
            maxFilesize: 0.5,
            maxFiles: 1,
            acceptedFiles: '.png, .jpg, .jpeg',
            addRemoveLinks: true,
            dictDefaultMessage: 'Tirá acá el logo de la productora (únicamente .PNG o .JPEG)',
            dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}Mb). Tamaño máx.: {{maxFilesize}}Mb.',
            dictInvalidFileType: 'Tipo de archivo inválido (solo se acepta .PNG o .JPEG).',
            dictRemoveFile: 'Quitar archivo',
            dictMaxFilesExceeded: 'Solo podés cargar un archivo.',
            transformFile: function (file, done) {
              // Crea una referencia de Dropzone
              var myDropZone = this;

              // Crea un nodo de imagen para Cropper.js
              var image = new Image();
              image.style.display = 'block';
              image.style.maxWidth = '100%';
              image.src = URL.createObjectURL(file);

              // Abre el modal
              _this.dialogEditor = true;

              //Inicializa el editor de imagen
              var intervalEditorImagen = setInterval(function () {
                try {
                  var editor = document.getElementById('editor-imagen');

                  // Inicia Cropper.js
                  var cropper = new Cropper(image, {
                    aspectRatio: 1,
                    highlight: false,
                    zoomable: true,
                    dragMode: 'move'
                  });

                  // Botón confirmar
                  var buttonConfirm = document.getElementById('confirmar-edicion-imagen');
                  buttonConfirm.addEventListener('click', function () {
                    // Inicializa el canvas con data de Cropper JS
                    var canvas = cropper.getCroppedCanvas({
                      width: 256,
                      height: 256,
                    });
                    // Convierte el canvas en un Blob
                    canvas.toBlob(function (blob) {
                      // Crea un nuevo archivo de vista previa de Dropzone
                      myDropZone.createThumbnail(
                        blob,
                        myDropZone.options.thumbnailWidth,
                        myDropZone.options.thumbnailHeight,
                        myDropZone.options.thumbnailMethod,
                        false,
                        function (dataURL) {

                          // Actualiza la vista previa de Dropzone
                          myDropZone.emit('thumbnail', file, dataURL);
                          // Return the file to Dropzone
                          _this.logoProductoraProyecto = blob;
                          done(blob);
                        });
                    });

                    // Sale del editor de imágen
                    _this.usaLogoActual = false;
                    _this.dialogEditor = false;
                    editor.innerHTML = '';
                  });

                  // Botón cancelar
                  var buttonCancel = document.getElementById('cancelar-edicion-imagen');
                  buttonCancel.addEventListener('click', function () {

                    // Sale del editor de imágen
                    _this.dialogEditor = false;
                    editor.innerHTML = '';
                    _this.logoProductoraProyecto = null;
                    myDropZone.removeAllFiles(true);
                    return;
                  });

                  editor.appendChild(image);

                  clearInterval(intervalEditorImagen);
                } catch {
                }
              }, 10);
            },
            removedfile: function (file) {
              if (file.status == 'success') {
                _this.logoProductoraProyecto = null;
              }
              file.previewElement.remove();
            },
          });
          clearInterval(intervalDropzoneLogo);
        } catch {
        }
      }, 10);

      var intervalDropzonePortada = setInterval(function () {
        try {
          _this.myDropzonePortada = new Dropzone("div#portada-proyecto-upload", {
            url: "/file/post",
            maxFilesize: 1,
            maxFiles: 1,
            acceptedFiles: '.png, .jpg, .jpeg',
            addRemoveLinks: true,
            dictDefaultMessage: 'Tirá acá la portada del proyecto (únicamente .PNG o .JPEG)',
            dictFileTooBig: 'El archivo es demasiado grande ({{filesize}}Mb). Tamaño máx.: {{maxFilesize}}Mb.',
            dictInvalidFileType: 'Tipo de archivo inválido (solo se acepta .PNG o .JPEG).',
            dictRemoveFile: 'Quitar archivo',
            dictMaxFilesExceeded: 'Solo podés cargar un archivo.',
            transformFile: function (file, done) {
              // Crea una referencia de Dropzone
              var myDropZone = this;

              // Crea un nodo de imagen para Cropper.js
              var image = new Image();
              image.style.display = 'block';
              image.style.maxWidth = '100%';
              image.src = URL.createObjectURL(file);

              // Abre el modal
              _this.dialogEditor = true;

              //Inicializa el editor de imagen
              var intervalEditorImagen = setInterval(function () {
                try {
                  var editor = document.getElementById('editor-imagen');

                  // Inicia Cropper.js
                  var cropper = new Cropper(image, {
                    aspectRatio: 1,
                    highlight: false,
                    zoomable: true,
                    dragMode: 'move'
                  });

                  // Botón confirmar
                  var buttonConfirm = document.getElementById('confirmar-edicion-imagen');
                  buttonConfirm.addEventListener('click', function () {
                    // Inicializa el canvas con data de Cropper JS
                    var canvas = cropper.getCroppedCanvas({
                      width: 512,
                      height: 512,
                      fillColor: '#000000'
                    });
                    // Convierte el canvas en un Blob
                    canvas.toBlob(function (blob) {
                      // Crea un nuevo archivo de vista previa de Dropzone
                      myDropZone.createThumbnail(
                        blob,
                        myDropZone.options.thumbnailWidth,
                        myDropZone.options.thumbnailHeight,
                        myDropZone.options.thumbnailMethod,
                        false,
                        function (dataURL) {

                          // Actualiza la vista previa de Dropzone
                          myDropZone.emit('thumbnail', file, dataURL);
                          // Return the file to Dropzone
                          _this.portadaProyecto = blob;
                          done(blob);
                        });
                    });

                    // Sale del editor de imágen
                    _this.dialogEditor = false;
                    editor.innerHTML = '';
                  });

                  // Botón cancelar
                  var buttonCancel = document.getElementById('cancelar-edicion-imagen');
                  buttonCancel.addEventListener('click', function () {

                    // Sale del editor de imágen
                    _this.dialogEditor = false;
                    editor.innerHTML = '';
                    _this.portadaProyecto = null;
                    myDropZone.removeAllFiles(true);
                    return;
                  });

                  editor.appendChild(image);

                  clearInterval(intervalEditorImagen);
                } catch {
                }
              }, 10);
            },
            removedfile: function (file) {
              if (file.status == 'success') {
                _this.portadaProyecto = null;
              }
              file.previewElement.remove();
            },
          });
          clearInterval(intervalDropzonePortada);
        } catch {
        }
      }, 10);
    },
    usaLogoActualCambio: function () {
      if (this.usaLogoActual == true) {
        this.myDropzoneLogo.removeAllFiles(true);
        this.logoProductoraProyecto = this.logoProductora;
      }
    }
  },
  store,
  computed: Vuex.mapState({
    // Datos Técnico
    proyectosTecnico: state => state.tecnico.proyectos,
    invitacionesProyectos: state => state.tecnico.invitacionesProyectos,

    // Datos Productora
    proyectosProductora: state => state.productora.proyectos,
    nombreProductora: state => state.productora.datos.nombre,
    razonSocialProductora: state => state.productora.datos.razonSocial,
    cuitProductora: state => state.productora.datos.cuit,
    direccionProductora: state => state.productora.datos.direccion,
    logoProductora: state => state.productora.foto,

    // Datos Globales
    isTecnico: state => state.isTecnico,
    isProductora: state => state.isProductora,
    listaTiposProyecto: state => state.globales.tiposProyecto,
    areasPuestosSueldos: state => state.globales.areasPuestosSueldos,
    listaAreas: state => Object.keys(state.globales.areasPuestosSueldos),
    listaPermisos: state => state.globales.permisos,
    completeFormValidation: function () { return this.formDatosValidation && this.formTecnicosValidation && this.formFotoValidation; },
  }),
  template:
    `<div class="col-12 stretch-card">
    <div class="card">
      <div class="card-body">
        <div v-if="isTecnico">
          <template v-if="invitacionesProyectos.length == 0">
            <h6 class="font-weight-bold mb-3">MIS PROYECTOS</h6>
            <v-divider></v-divider>
            <div class="row">
              <div v-for="(proyecto, index) in proyectosTecnico" class="col-md-3">
                <v-hover v-slot="{hover}">
                  <v-card class="proyectos-card bg-light" :class="{'on-hover': hover}">
                    <template v-if="proyecto.foto != ''">
                      <v-img class="white--text align-end" height="100%" v-bind:src="proyecto.foto">
                        <v-responsive :aspect-ratio="4/4">
                          <v-card-text>
                            <h4><span class="fondo-texto-card-proyectos">{{proyecto.productora}}</span></h4>
                            <h3 class="nombre-episodio-tarjetas"><span class="fondo-texto-card-proyectos">{{proyecto.nombre}}</span></h3>
                            <div><span class="fondo-texto-card-proyectos">Dir.: {{proyecto.director}}</span></div>
                          </v-card-text>
                        </v-responsive>
                      </v-img>
                    </template>
                    <template v-else-if="proyecto.foto == ''">
                      <v-responsive :aspect-ratio="4/4">
                        <v-card-text>
                          <h4 class="text-muted">{{proyecto.productora}}</h4>
                          <h3 class="nombre-episodio-tarjetas">{{proyecto.nombre}}</h3>
                          <hr />
                          <div>
                            <span class="text-muted">Dir.: {{proyecto.director}}</span>
                          </div>
                        </v-card-text>
                      </v-responsive>
                    </template>
                  </v-card>
                </v-hover>
              </div>
            </div>
          </template>
          <template v-else-if="invitacionesProyectos.length > 0">
            <div class="row">
              <div class="col-md-3">
                <h6 class="font-weight-bold mb-3">INVITACIONES</h6>
                <v-divider></v-divider>
                <div class="row">
                  <div v-for="(proyecto, index) in invitacionesProyectos" class="col-md-12">
                    <v-hover v-slot="{hover}">
                      <v-card class="proyectos-card bg-light" :class="{'on-hover': hover}">
                        <template v-if="proyecto.foto != ''">
                          <v-img class="white--text align-end" height="100%" v-bind:src="proyecto.foto">
                            <v-responsive :aspect-ratio="4/4">
                              <v-card-text>
                                <h4><span class="fondo-texto-card-proyectos">{{proyecto.productora}}</span></h4>
                                <h3 class="nombre-episodio-tarjetas"><span class="fondo-texto-card-proyectos">{{proyecto.nombre}}</span></h3>
                                <div><span class="fondo-texto-card-proyectos">Dir.: {{proyecto.director}}</span></div>
                              </v-card-text>
                            </v-responsive>
                          </v-img>
                        </template>
                        <template v-else-if="proyecto.foto == ''">
                          <v-responsive :aspect-ratio="4/4">
                            <v-card-text>
                              <h4 class="text-muted">{{proyecto.productora}}</h4>
                              <h3 class="nombre-episodio-tarjetas">{{proyecto.nombre}}</h3>
                              <hr />
                              <div>
                                <span class="text-muted">Dir.: {{proyecto.director}}</span>
                              </div>
                            </v-card-text>
                          </v-responsive>
                        </template>
                      </v-card>
                    </v-hover>
                  </div>
                </div>
              </div>
              <div class="col-md-9">
                <h6 class="font-weight-bold mb-3">MIS PROYECTOS</h6>
                <v-divider></v-divider>
                <div class="row">
                  <div v-for="(proyecto, index) in proyectosTecnico" class="col-md-4">
                    <v-hover v-slot="{hover}">
                      <v-card class="proyectos-card bg-light" :class="{'on-hover': hover}">
                        <template v-if="proyecto.foto != ''">
                          <v-img class="white--text align-end" height="100%" v-bind:src="proyecto.foto">
                            <v-responsive :aspect-ratio="4/4">
                              <v-card-text>
                                <h4><span class="fondo-texto-card-proyectos">{{proyecto.productora}}</span></h4>
                                <h3 class="nombre-episodio-tarjetas"><span class="fondo-texto-card-proyectos">{{proyecto.nombre}}</span></h3>
                                <div><span class="fondo-texto-card-proyectos">Dir.: {{proyecto.director}}</span></div>
                              </v-card-text>
                            </v-responsive>
                          </v-img>
                        </template>
                        <template v-else-if="proyecto.foto == ''">
                          <v-responsive :aspect-ratio="4/4">
                            <v-card-text>
                              <h4 class="text-muted">{{proyecto.productora}}</h4>
                              <h3 class="nombre-episodio-tarjetas">{{proyecto.nombre}}</h3>
                              <hr />
                              <div>
                                <span class="text-muted">Dir.: {{proyecto.director}}</span>
                              </div>
                            </v-card-text>
                          </v-responsive>
                        </template>
                      </v-card>
                    </v-hover>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div v-if="isProductora">
          <h6 class="font-weight-bold mb-3">PROYECTOS</h6>
          <v-divider></v-divider>
          <div class="row">
            <div class="col-md-3">
              <v-dialog v-model="dialog" persistent max-width="900px">
                <template v-slot:activator="{ on, attrs }">
                  <v-hover v-slot="{hover}">
                    <v-card v-bind="attrs" v-on="on" v-on:click="aperturaMenuProyectoNuevo" class="proyectos-card d-flex" :class="{'on-hover': hover}">
                      <v-responsive :aspect-ratio="4/4">
                        <v-card-text class="h-100 d-flex align-items-center">
                          <div class="col">
                            <div class="row d-flex justify-content-center">
                              <i id="boton-nuevo-proyecto" class="mdi mdi-plus"></i>
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
                      v-on:click="siguienteFilminaProyectoNuevo(0)"
                    >
                      DATOS
                    </v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step
                      color="#4d83ff"
                      :complete="pasoProyecto > 2 && formTecnicosValidation"
                      step="2"
                      :rules="[() => formTecnicosValidation]"
                      v-on:click="siguienteFilminaProyectoNuevo(1)"
                    >
                      TÉCNICOS Y PERMISOS
                    </v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step color="#4d83ff" step="3" :rules="[() => formFotoValidation]" v-on:click="siguienteFilminaProyectoNuevo(2)">
                      FOTO Y LOGO
                    </v-stepper-step>
                  </v-stepper-header>
                  <v-stepper-items>
                    <v-stepper-content step="1">
                      <v-card id="form-datos-proyecto-nuevo" class="mb-12">
                        <v-form lazy-validation class="pt-3" v-model="formDatosValidation" ref="formDatos">
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
                              <v-text-field v-model="directorProyectoNuevo" label="Director/a" :rules="[rules.obligatorio]" clearable></v-text-field>
                            </div>
                          </div>
                          <div class="row w-100">
                            <div class="form-group col-12 col-md-6">
                              <v-text-field
                                v-model:value="siglaProyectoNuevo"
                                label="Sigla del proyecto"
                                v-mask="'AAAAAAAA'"
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
                              <v-text-field v-model="direccionProyectoNuevo" label="Dirección" :rules="[rules.obligatorio]" clearable></v-text-field>
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
                            v-on:click="siguienteFilminaProyectoNuevo(1)"
                          >
                            SIGUIENTE
                          </button>
                        </div>
                      </div>
                    </v-stepper-content>
                    <v-stepper-content step="2">
                      <v-card id="form-tecnicos-proyecto-nuevo" class="mb-12">
                        <v-card-text class="px-0">
                          Invite a sus primeros técnicos al proyecto. Indique el área, el puesto y los permisos que le dará a cada uno de ellos (podrá
                          modificarlos luego). Recomendamos agregar por lo menos al/los encargado/s de las Altas de los técnicos para que le ayude a
                          seguir invitando a otros técnicos y a manejar sus permisos.
                        </v-card-text>
                        <v-form lazy-validation class="pt-3" v-model="formTecnicosValidation" ref="formTecnicos">
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
                          <span id="boton-agregar-invitacion-tecnico" v-on:click="agregarNuevoUsuarioALaLista"
                            ><i class="mdi mdi-account-plus btn-icon-prepend"></i> Agregar otro técnico</span
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
                            v-on:click="siguienteFilminaProyectoNuevo(2)"
                          >
                            SIGUIENTE
                          </button>
                        </div>
                      </div>
                    </v-stepper-content>
                    <v-stepper-content step="3">
                      <v-card id="form-foto-proyecto-nuevo" class="mb-12">
                        <v-form lazy-validation class="pt-3" v-model="formFotoValidation" ref="formFoto">
                          <div class="row justify-content-center">
                            <div class="form-group col-6 mt-3">
                              <h6 class="font-weight-bold mb-3">LOGO DE LA PRODUCTORA PARA ESTE PROYECTO</h6>
                              <v-divider></v-divider>
                              <div id="logo-upload" class="dropzone"></div>
                              <div class="form-check">
                                <label class="form-check-label text-muted">
                                  <div class="d-flex justify-content-left">
                                    <input type="checkbox" class="form-control" v-model:value="usaLogoActual" v-on:change="usaLogoActualCambio" />
                                    Usar el logo de la productora actualmente cargado
                                    <i class="input-helper"></i>
                                  </div>
                                </label>
                              </div>
                            </div>
                            <div class="form-group col-6 mt-3">
                              <h6 class="font-weight-bold mb-3">PORTADA DEL PROYECTO</h6>
                              <v-divider></v-divider>
                              <div id="portada-proyecto-upload" class="dropzone"></div>
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
                            id="boton-crear-proyecto"
                            type="button"
                            class="btn btn-block btn-lg font-weight-medium auth-form-btn"
                            style="height: 48px; padding: 0px"
                            v-bind:class="{'btn-primary': completeFormValidation, 'btn-danger': !completeFormValidation}"
                            v-bind:disabled="!completeFormValidation"
                            v-on:click="crearProyecto"
                          >
                            <div v-if="!creando && completeFormValidation">CREAR PROYECTO</div>
                            <div v-if="creando && completeFormValidation">
                              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </div>
                            <div v-if="!completeFormValidation">
                              <i class="mdi mdi-close-octagon btn-icon-prepend"></i>
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
            <div v-for="(proyecto, index) in proyectosProductora" class="col-md-3">
              <v-hover v-slot="{hover}">
                <v-card class="proyectos-card bg-light" :class="{'on-hover': hover}">
                  <template v-if="proyecto.foto != ''">
                    <v-img class="white--text align-end" height="100%" v-bind:src="proyecto.foto">
                      <v-responsive :aspect-ratio="4/4">
                        <v-card-text>
                          <h4><span class="fondo-texto-card-proyectos">{{proyecto.productora}}</span></h4>
                          <h3 class="nombre-episodio-tarjetas"><span class="fondo-texto-card-proyectos">{{proyecto.nombre}}</span></h3>
                          <div><span class="fondo-texto-card-proyectos">Dir.: {{proyecto.director}}</span></div>
                        </v-card-text>
                      </v-responsive>
                    </v-img>
                  </template>
                  <template v-else-if="proyecto.foto == ''">
                    <v-responsive :aspect-ratio="4/4">
                      <v-card-text>
                        <h4 class="text-muted">{{proyecto.productora}}</h4>
                        <h3 class="nombre-episodio-tarjetas">{{proyecto.nombre}}</h3>
                        <hr />
                        <div>
                          <span class="text-muted">Dir.: {{proyecto.director}}</span>
                        </div>
                      </v-card-text>
                    </v-responsive>
                  </template>
                </v-card>
              </v-hover>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-dialog v-model="dialogEditor" persistent max-width="900px">
      <v-card id="card-editor-imagen">
        <h6 class="font-weight-bold mb-3">RECORTÁ TU IMAGEN (1:1)</h6>
        <v-divider></v-divider>
        <div class="row m-0">
          <div id="editor-imagen"></div>
        </div>
        <div id="botones-editor-imagen" class="row justify-content-center mx-0">
          <div class="col pl-0 pb-4">
            <button id="cancelar-edicion-imagen" type="button" class="btn btn-secondary btn-block btn-lg font-weight-medium auth-form-btn">
              CANCELAR
            </button>
          </div>
          <div class="col pr-0 pb-4">
            <button id="confirmar-edicion-imagen" type="button" class="btn btn-primary btn-block btn-lg font-weight-medium auth-form-btn">
              CONFIRMAR
            </button>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>`
})