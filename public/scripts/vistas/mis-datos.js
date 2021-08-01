'use strict'

var vmMisDatos = Vue.component('mis-datos', {
  data: function () {
    return {
      actualizando: false,
      menu: false,
      date: '',
      formValidation: true,
      dialog: false,
      myDropzone: null,
      // Reglas formularios
      rules: {
        reglasCuil: v => v == null || v.length >= 13 || v.length == 0 || 'El C.U.I.L. debe tener 11 dígitos',
        reglasCuit: v => v == null || v.length >= 13 || v.length == 0 || 'El C.U.I.T. debe tener 11 dígitos',
        reglasCbu: v => v == null || v.length >= 22 || v.length == 0 || 'El C.B.U. debe tener 22 dígitos',
      },
      listaAfiliacionSica: [{ text: 'No afiliado al SICA', value: false }, { text: 'Afiliado al SICA', value: true }],
      listaAfiliacionSat: [{ text: 'No afiliado al SATSAID', value: false }, { text: 'Afiliado al SATSAID', value: true }],
      userNombre: '',
      userApellido: '',
      userCodArea: '',
      userTelefono: '',
      userEmail: '',
      userCuilCuit: '',
      userRazonSocial: '',
      userFechaNacimiento: '',
      userObraSocial: '',
      userNacionalidad: '',
      userEstudiosCursados: '',
      userDireccion: '',
      userCodigoPostal: '',
      userSica: false,
      userSat: false,
      userBanco: '',
      userTipoCuenta: '',
      userNumeroCuenta: '',
      userCbu: '',
      userConsentimiento: false,
      imagen: null,
      nombreImagen: ''
    }
  },
  methods: {
    fetchData() {
      if (this.isTecnico) {
        this.userNombre = this.nombreTecnico;
        this.userApellido = this.apellido;
        this.userCodArea = this.codigoArea;
        this.userTelefono = this.telefono;
        this.userEmail = this.email;
        this.userCuilCuit = this.cuil;
        this.userFechaNacimiento = this.fechaNacimiento;
        this.userObraSocial = this.obraSocial;
        this.userNacionalidad = this.nacionalidad;
        this.userEstudiosCursados = this.estudiosCursados;
        this.userDireccion = this.direccion;
        this.userCodigoPostal = this.codigoPostal;
        this.userSica = this.sica;
        this.userSat = this.sat;
        this.userBanco = this.banco;
        this.userTipoCuenta = this.tipoCuenta;
        this.userNumeroCuenta = this.numeroCuenta;
        this.userCbu = this.cbu;
        this.userConsentimiento = this.consentimientoDatos;
      } else if (this.isProductora) {
        this.userNombre = this.nombreProductora;
        this.userRazonSocial = this.razonSocial;
        this.userCodArea = this.codigoAreaProductora;
        this.userTelefono = this.telefonoProductora;
        this.userEmail = this.emailProductora;
        this.userCuilCuit = this.cuit;
        this.userDireccion = this.direccionProductora;
        this.userConsentimiento = this.consentimientoDatosProductora;
      }
    },
    updateData() {
      document.getElementById('actualizar-datos').disabled = true;
      this.actualizando = true;
      let _this = this;
      if (this.isTecnico) {
        var datos = {
          consentimientoDatos: this.userConsentimiento,
          datos: {
            apellido: this.userApellido,
            telefono: this.userTelefono,
            codigoArea: this.userCodArea,
            cuil: this.userCuilCuit,
            datosBancarios: {
              banco: this.userBanco,
              cbu: this.userCbu,
              numeroCuenta: this.userNumeroCuenta,
              tipoCuenta: this.userTipoCuenta,
            },
            direccion: this.userDireccion,
            codigoPostal: this.userCodigoPostal,
            dni: this.userCuilCuit.slice(3, -2),
            fechaNacimiento: this.userFechaNacimiento,
            nacionalidad: this.userNacionalidad,
            estudiosCursados: this.userEstudiosCursados,
            nombre: this.userNombre,
            obraSocial: this.userObraSocial,
            sat: this.userSat,
            sica: this.userSica,
          },
          nuevoUsuario: false,
          isTecnico: true,
          isProductora: false
        };
        this.nombreImagen = 'foto-perfil.png';
      } else if (this.isProductora) {
        var datos = {
          consentimientoDatos: this.userConsentimiento,
          datos: {
            telefono: this.userTelefono,
            codigoArea: this.userCodArea,
            cuit: this.userCuilCuit,
            direccion: this.userDireccion,
            nombre: this.userNombre,
            razonSocial: this.userRazonSocial,
          },
          nuevoUsuario: false,
          isTecnico: false,
          isProductora: true
        };
        this.nombreImagen = 'logo-productora.png';
      }
      var formData = new FormData();
      formData.append("data", JSON.stringify(datos));
      if (this.imagen) {
        formData.append("imagen", this.imagen, this.nombreImagen);
      }
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          user.getIdToken()
            .then(function (token) {
              fetch(`https://us-central1-colmena-cac87.cloudfunctions.net/webApi/usuarios/${user.uid}`, {
                method: 'put',
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData
              })
                .then(response => {
                  if (response.ok) {
                    _this.$toast.open({
                      message: 'Datos actualizados.',
                      type: 'success'
                    })
                  } else {
                    _this.$toast.open({
                      message: 'Error PUT Mis Datos',
                      type: 'error'
                    })
                  }
                  return response.json();
                })
                .then(data => {
                  if (data.img) {
                    datos['foto'] = data.img;
                  }
                  if (_this.isTecnico) {
                    store.commit('PUT_INFO_TECNICO', datos);
                  } else if (_this.isProductora) {
                    store.commit('PUT_INFO_PRODUCTORA', datos);
                  }
                  _this.actualizando = false;
                  document.getElementById('actualizar-datos').disabled = false;
                  _this.myDropzone.removeAllFiles(true);
                  console.log(data);
                })
                .catch(function (error) {
                  _this.actualizando = false;
                  document.getElementById('actualizar-datos').disabled = false;
                  _this.$toast.open({
                    message: error.message,
                    type: 'error'
                  })
                  console.log(`Hubo un problema con la petición Fetch de Mis Datos: ${error.message}`);
                })
            })
            .catch(function (error) {
              _this.actualizando = false;
              document.getElementById('actualizar-datos').disabled = false;
              _this.$toast.open({
                message: error.message,
                type: 'error'
              })
              console.log(`Hubo un problema con la obtención del token: ${error.message}`);
            })
        }
      })
    },
    save(date) {
      this.$refs.menu.save(date);
    },
    // Formatea la fecha del Date-Picker
    formatDate(date) {
      if (!date) return null

      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`
    },
    inicializacionDropzone: function () {
      var _this = this;

      var intervalDropzone = setInterval(function () {
        try {
          _this.myDropzone = new Dropzone("div#foto-logo-upload", {
            url: "/file/post",
            maxFilesize: 0.5,
            maxFiles: 1,
            acceptedFiles: '.png, .jpg, .jpeg',
            addRemoveLinks: true,
            dictDefaultMessage: _this.mensajeInicialDropzone,
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
              _this.dialog = true;

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
                          _this.imagen = blob;
                          done(blob);
                        });
                    });

                    // Sale del editor de imágen
                    _this.dialog = false;
                    editor.innerHTML = '';
                  });

                  // Botón cancelar
                  var buttonCancel = document.getElementById('cancelar-edicion-imagen');
                  buttonCancel.addEventListener('click', function () {

                    // Sale del editor de imágen
                    _this.dialog = false;
                    editor.innerHTML = '';
                    _this.imagen = null;
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
                _this.imagen = null;
              }
              file.previewElement.remove();
            },
          });
          clearInterval(intervalDropzone);
        } catch {
        }
      }, 10);
    }
  },
  store,
  computed: Vuex.mapState({
    // Datos Técnico
    nombreTecnico: state => state.tecnico.datos.nombre,
    apellido: state => state.tecnico.datos.apellido,
    codigoArea: state => state.tecnico.datos.codigoArea,
    telefono: state => state.tecnico.datos.telefono,
    email: state => state.tecnico.datos.email,
    cuil: state => state.tecnico.datos.cuil,
    fechaNacimiento: state => state.tecnico.datos.fechaNacimiento,
    obraSocial: state => state.tecnico.datos.obraSocial,
    nacionalidad: state => state.tecnico.datos.nacionalidad,
    estudiosCursados: state => state.tecnico.datos.estudiosCursados,
    direccion: state => state.tecnico.datos.direccion,
    codigoPostal: state => state.tecnico.datos.codigoPostal,
    sica: state => state.tecnico.datos.sica,
    sat: state => state.tecnico.datos.sat,
    banco: state => state.tecnico.datos.datosBancarios.banco,
    tipoCuenta: state => state.tecnico.datos.datosBancarios.tipoCuenta,
    numeroCuenta: state => state.tecnico.datos.datosBancarios.numeroCuenta,
    cbu: state => state.tecnico.datos.datosBancarios.cbu,
    consentimientoDatos: state => state.tecnico.consentimientoDatos,

    // Datos Productora
    nombreProductora: state => state.productora.datos.nombre,
    codigoAreaProductora: state => state.productora.datos.codigoArea,
    telefonoProductora: state => state.productora.datos.telefono,
    emailProductora: state => state.productora.datos.email,
    cuit: state => state.productora.datos.cuit,
    razonSocial: state => state.productora.datos.razonSocial,
    direccionProductora: state => state.productora.datos.direccion,
    consentimientoDatosProductora: state => state.productora.consentimientoDatos,

    // Datos Globales
    isTecnico: state => state.isTecnico,
    isProductora: state => state.isProductora,
    mensajeInicialDropzone: state => { if (state.isTecnico) { return 'Tirá acá tu foto de perfil (únicamente .PNG o .JPEG)' } else if (state.isProductora) { return 'Tirá acá el logo de la productora (únicamente .PNG o .JPEG)' } },
    listaBancos: state => state.globales.bancos,
    listaTiposCuenta: state => state.globales.tiposCuenta,
    listaEstudiosCursados: state => state.globales.estudiosCursados,
  }),
  created() {
    // Inicializa Dropzone en la creación del componente
    this.inicializacionDropzone();
    // Busca la información durante la creación del componente
    this.fetchData();
  },
  watch: {
    // Call again the method if the route changes
    '$route': 'fetchData',
    // Arranca el Date-Picker en la vista de años
    menu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
    },
    // Formatea correctamente la fecha del Date-Picker antes de guardarla
    date(val) {
      this.userFechaNacimiento = this.formatDate(this.date);
    }
  },
  template:
    `<div class="col-12 stretch-card">
    <div class="card">
      <div class="card-body">
        <v-form v-if="isTecnico" id="sign-up-form" class="pt-3" v-model="formValidation">
          <h6 class="font-weight-bold mb-3">DATOS PERSONALES</h6>
          <v-divider></v-divider>
          <div class="row">
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userNombre" label="Nombre/s" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userApellido" label="Apellido/s" clearable></v-text-field>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-12 col-md-6">
              <v-text-field v-bind:value="userEmail" label="E-mail" disabled></v-text-field>
            </div>
            <div class="form-group col-12 col-sm-6 col-md-3">
              <v-text-field v-model="userCodArea" label="Código de área (sin 0)" v-mask="'#####'" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-sm-6 col-md-3">
              <v-text-field v-model="userTelefono" label="Celular (sin 15)" v-mask="'########'" clearable></v-text-field>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userCuilCuit" :rules="[rules.reglasCuil]" label="C.U.I.L." v-mask="'##-########-#'" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-md-6">
              <v-menu ref="menu" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="userFechaNacimiento"
                    label="Fecha de nacimiento"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                    clearable
                  ></v-text-field>
                </template>
                <v-date-picker
                  class="selects-mis-datos"
                  color="#4D83FF"
                  ref="picker"
                  locale="es"
                  v-model="date"
                  :max="new Date().toISOString().substr(0, 10)"
                  min="1950-01-01"
                  @change="save"
                ></v-date-picker>
              </v-menu>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userObraSocial" label="Obra Social" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-sm-6 col-md-3">
              <v-text-field v-model="userNacionalidad" label="Nacionalidad" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-sm-6 col-md-3">
              <v-select :items="listaEstudiosCursados" v-model="userEstudiosCursados" label="Estudios Cursados"></v-select>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-12 col-sm-4 col-md-5">
              <v-text-field v-model="userDireccion" label="Dirección" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-sm-2 col-md-1">
              <v-text-field v-model="userCodigoPostal" label="C.P." clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-sm-6 col-md-3">
              <v-select :items="listaAfiliacionSica" v-model="userSica" label="Afiliación SICA"></v-select>
            </div>
            <div class="form-group col-12 col-sm-6 col-md-3">
              <v-select :items="listaAfiliacionSat" v-model="userSat" label="Afiliación SATSAID"></v-select>
            </div>
          </div>
          <h6 class="font-weight-bold my-3">DATOS PARA EL COBRO DE HABERES</h6>
          <v-divider></v-divider>
          <div class="row">
            <div class="form-group col-12 col-md-6">
              <v-select no-data-text="No hay datos disponibles" :items="listaBancos" v-model="userBanco" label="Banco"></v-select>
            </div>
            <div class="form-group col-12 col-md-6">
              <v-select no-data-text="No hay datos disponibles" :items="listaTiposCuenta" v-model="userTipoCuenta" label="Tipo de cuenta"></v-select>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userNumeroCuenta" label="Número de cuenta" v-mask="'####################'" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userCbu" label="C.B.U." :rules="[rules.reglasCbu]" counter="22" v-mask="'######################'" clearable></v-text-field>
            </div>
          </div>
          <h6 class="font-weight-bold mb-3">FOTO DE PERFIL</h6>
          <v-divider></v-divider>
          <div class="row justify-content-center">
            <div class="form-group col-9 mt-3">
              <div id="foto-logo-upload" class="dropzone"></div>
            </div>
          </div>
          <div class="mb-4">
            <div class="form-check">
              <label class="form-check-label text-muted">
                <div class="d-flex justify-content-left">
                  <input type="checkbox" class="form-control" v-model:value="userConsentimiento" />
                  Acepto compartir mis datos con las productoras que me contraten
                  <i class="input-helper"></i>
                </div>
              </label>
            </div>
          </div>
          <div class="row justify-content-center mt-3">
            <div class="col-12 col-md-6">
              <button
                id="actualizar-datos"
                type="button"
                class="btn btn-block btn-lg font-weight-medium auth-form-btn"
                v-bind:class="{'btn-primary': formValidation, 'btn-danger': !formValidation}"
                v-bind:disabled="!formValidation"
                v-on:click="updateData"
              >
                <div v-if="!actualizando && formValidation">
                  <i class="mdi mdi-file-check btn-icon-prepend"></i>
                  ACTUALIZAR
                </div>
                <div v-if="actualizando && formValidation">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </div>
                <div v-if="!formValidation">
                  <i class="mdi mdi-close-octagon btn-icon-prepend"></i>
                  CORRIJA LOS ERRORES
                </div>
              </button>
            </div>
          </div>
        </v-form>
        <v-form v-if="isProductora" id="sign-up-form" class="pt-3" v-model="formValidation">
          <h6 class="font-weight-bold mb-3">DATOS DE LA PRODUCTORA</h6>
          <v-divider></v-divider>
          <div class="row">
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userNombre" label="Nombre" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userRazonSocial" label="Razón Social" clearable></v-text-field>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-12 col-md-6">
              <v-text-field v-bind:value="userEmail" label="E-mail" disabled></v-text-field>
            </div>
            <div class="form-group col-12 col-sm-6 col-md-3">
              <v-text-field v-model="userCodArea" label="Código de área (sin 0)" v-mask="'#####'" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-sm-6 col-md-3">
              <v-text-field v-model="userTelefono" label="Celular (sin 15)" v-mask="'########'" clearable></v-text-field>
            </div>
          </div>
          <div class="row">
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userCuilCuit" :rules="[rules.reglasCuit]" label="C.U.I.T." v-mask="'##-########-#'" clearable></v-text-field>
            </div>
            <div class="form-group col-12 col-md-6">
              <v-text-field v-model="userDireccion" label="Dirección" clearable></v-text-field>
            </div>
          </div>
          <h6 class="font-weight-bold mb-3">LOGO DE LA PRODUCTORA</h6>
          <v-divider></v-divider>
          <div class="row justify-content-center">
            <div class="form-group col-9 mt-3">
              <div id="foto-logo-upload" class="dropzone"></div>
            </div>
          </div>
          <div class="mb-4">
            <div class="form-check">
              <label class="form-check-label text-muted">
                <div class="d-flex justify-content-left">
                  <input type="checkbox" class="form-control" v-model:value="userConsentimiento" />
                  Acepto compartir mis datos
                  <i class="input-helper"></i>
                </div>
              </label>
            </div>
          </div>
          <div class="row justify-content-center mt-3">
            <div class="col-12 col-md-6">
              <button
                id="actualizar-datos"
                type="button"
                class="btn btn-block btn-lg font-weight-medium auth-form-btn"
                v-bind:class="{'btn-primary': formValidation, 'btn-danger': !formValidation}"
                v-bind:disabled="!formValidation"
                v-on:click="updateData"
              >
                <div v-if="!actualizando && formValidation">
                  <i class="mdi mdi-file-check btn-icon-prepend"></i>
                  ACTUALIZAR
                </div>
                <div v-if="actualizando && formValidation">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                </div>
                <div v-if="!formValidation">
                  <i class="mdi mdi-close-octagon btn-icon-prepend"></i>
                  CORRIJA LOS ERRORES
                </div>
              </button>
            </div>
          </div>
        </v-form>
      </div>
    </div>
    <v-dialog v-model="dialog" persistent max-width="900px">
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