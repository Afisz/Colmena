'use strict'

var vmInicio = Vue.component('inicio', {
  data: function () {
    return {
      // Ayudas varias
      dialogCreacionProyecto: false,
      dialogInvitacionProyecto: false,
      dialogDeclinacionInvitacion: false,
      dialogGuardarDatos: false,
      dialogEditor: false,
      creandoAceptando: false,
      declinandoProyecto: false,
      pasoProyecto: 1,
      menu: false,
      date: '',
      listaAfiliacionSica: [{ text: 'No afiliado al SICA', value: false }, { text: 'Afiliado al SICA', value: true }],
      listaAfiliacionSat: [{ text: 'No afiliado al SATSAID', value: false }, { text: 'Afiliado al SATSAID', value: true }],
      formDatosContacto: true,
      formDatosCobroHaberes: true,
      formDatosValidation: true,
      formTecnicosValidation: true,
      formFotoValidation: true,
      // Proyecto nuevo:
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
      tecnicosNuevos: [
        {
          email: '',
          area: '',
          permisos: []
        }
      ],
      // Formulario fotos
      usaLogoActual: false,
      logoProductoraProyecto: null,
      portadaProyecto: null,
      myDropzoneLogo: null,
      myDropzonePortada: null,
      // Invitación proyecto:
      idInvitacionPorAceptar: '',
      idProyectoAceptado: '',
      nombreProyectoAceptado: '',
      productoraProyectoAceptado: '',
      tipoProyectoAceptado: '',
      fotoProyectoAceptado: '',
      directorProyectoAceptado: '',
      indexProyectoAceptado: null,
      tecnicoNombre: '',
      tecnicoApellido: '',
      tecnicoEmail: '',
      tecnicoCodArea: '',
      tecnicoTelefono: '',
      tecnicoDireccion: '',
      tecnicoCodigoPostal: '',
      tecnicoFechaNacimiento: '',
      tecnicoCuil: '',
      tecnicoNacionalidad: '',
      tecnicoEstudiosCursados: '',
      tecnicoObraSocial: '',
      tecnicoSica: false,
      tecnicoSat: false,
      tecnicoBanco: '',
      tecnicoTipoCuenta: '',
      tecnicoNumeroCuenta: '',
      tecnicoCbu: '',
      // Reglas formularios
      rules: {
        reglasCuil: v => v == null || v.length >= 13 || v.length == 0 || 'El C.U.I.L. debe tener 11 dígitos',
        reglasCuit: v => v == null || v.length >= 13 || v.length == 0 || 'El C.U.I.T. debe tener 11 dígitos',
        obligatorio: v => (v != null && v.length > 0) || 'Este campo es obligatorio',
        reglaEmail: v => /.+@gmail.com+/.test(v) || 'Introduzca un E-mail de Gmail válido',
        reglaEmailNoRepetido: v => v == null || this.tecnicosNuevos.filter(tecnicoNuevo => tecnicoNuevo.email == v).length <= 1 || 'Este E-mail ya fue ingresado anteriormente',
        reglasCbu: v => v == null || v.length >= 22 || v.length == 0 || 'El C.B.U. debe tener 22 dígitos',
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
    // Pre-carga los datos del técnico en el formulario datos invitación proyecto
    aperturaMenuInvitacionProyecto: function (proyecto, index) {
      this.idInvitacionPorAceptar = proyecto.idInvitacion;
      this.idProyectoAceptado = proyecto.idProyecto;
      this.nombreProyectoAceptado = proyecto.nombre;
      this.productoraProyectoAceptado = proyecto.productora;
      this.tipoProyectoAceptado = proyecto.tipoProyecto;
      this.fotoProyectoAceptado = proyecto.foto;
      this.directorProyectoAceptado = proyecto.director;
      this.indexProyectoAceptado = index;
      this.tecnicoNombre = this.nombreTecnico;
      this.tecnicoApellido = this.apellido;
      this.tecnicoCodArea = this.codigoArea;
      this.tecnicoTelefono = this.telefono;
      this.tecnicoEmail = this.email;
      this.tecnicoCuil = this.cuil;
      this.tecnicoFechaNacimiento = this.fechaNacimiento;
      this.tecnicoObraSocial = this.obraSocial;
      this.tecnicoNacionalidad = this.nacionalidad;
      this.tecnicoEstudiosCursados = this.estudiosCursados;
      this.tecnicoDireccion = this.direccion;
      this.tecnicoCodigoPostal = this.codigoPostal;
      this.tecnicoBanco = this.banco;
      this.tecnicoTipoCuenta = this.tipoCuenta;
      this.tecnicoNumeroCuenta = this.numeroCuenta;
      this.tecnicoCbu = this.cbu;
      if (proyecto.tipoProyecto == 'Cine') {
        this.tecnicoSica = this.sica;
      } else if (proyecto.tipoProyecto == 'TV') {
        this.tecnicoSat = this.sat;
      }
      this.dialogInvitacionProyecto = true;
    },
    // Post proyecto nuevo
    crearProyecto: function () {
      this.creandoAceptando = true;
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
                  _this.creandoAceptando = false;
                  _this.$refs.formDatos.resetValidation();
                  _this.$refs.formTecnicos.resetValidation();
                  _this.$refs.formFoto.resetValidation();
                  _this.dialogCreacionProyecto = false;
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
                  _this.usaLogoActual = false;
                  _this.logoProductoraProyecto = null,
                    _this.portadaProyecto = null,
                    _this.myDropzonePortada.removeAllFiles(true);
                  _this.myDropzoneLogo.removeAllFiles(true);
                  _this.$toast.open({
                    message: "Proyecto creado.",
                    type: "success"
                  })
                  console.log(data);
                })
                .catch(function (error) {
                  _this.creandoAceptando = false;
                  _this.$toast.open({
                    message: error.message,
                    type: "error"
                  })
                  console.log('Hubo un problema con la creación del proyecto: ' + error.message);
                })
            })
            .catch(function (error) {
              _this.creandoAceptando = false;
              _this.$toast.open({
                message: error.message,
                type: "error"
              })
              console.log('Hubo un problema con la obtención del token: ' + error.message);
            })
        }
      })
    },
    // Post aceptar proyecto
    aceptarProyectoYGuardarDatos: function (guardaDatos) {
      let _this = this;
      this.dialogGuardarDatos = false;

      if (guardaDatos) {
        if (this.tipoProyectoAceptado == 'Cine') {
          var datosAGuardar = {
            consentimientoDatos: this.consentimientoDatos,
            datos: {
              apellido: this.tecnicoApellido,
              codigoArea: this.tecnicoCodArea,
              codigoPostal: this.tecnicoCodigoPostal,
              cuil: this.tecnicoCuil,
              datosBancarios: {
                banco: this.tecnicoBanco,
                cbu: this.tecnicoCbu,
                numeroCuenta: this.tecnicoNumeroCuenta,
                tipoCuenta: this.tecnicoTipoCuenta,
              },
              direccion: this.tecnicoDireccion,
              dni: this.tecnicoCuil.slice(3, -2),
              estudiosCursados: this.tecnicoEstudiosCursados,
              fechaNacimiento: this.tecnicoFechaNacimiento,
              nacionalidad: this.tecnicoNacionalidad,
              nombre: this.tecnicoNombre,
              obraSocial: this.tecnicoObraSocial,
              sat: this.sat,
              sica: this.tecnicoSica,
              telefono: this.tecnicoTelefono,
            },
            nuevoUsuario: false,
            isTecnico: true,
            isProductora: false
          };
        } else if (this.tipoProyectoAceptado == 'TV') {
          var datosAGuardar = {
            consentimientoDatos: this.consentimientoDatos,
            datos: {
              apellido: this.tecnicoApellido,
              codigoArea: this.tecnicoCodArea,
              codigoPostal: this.tecnicoCodigoPostal,
              cuil: this.tecnicoCuil,
              datosBancarios: {
                banco: this.tecnicoBanco,
                cbu: this.tecnicoCbu,
                numeroCuenta: this.tecnicoNumeroCuenta,
                tipoCuenta: this.tecnicoTipoCuenta,
              },
              direccion: this.tecnicoDireccion,
              dni: this.tecnicoCuil.slice(3, -2),
              estudiosCursados: this.tecnicoEstudiosCursados,
              fechaNacimiento: this.tecnicoFechaNacimiento,
              nacionalidad: this.tecnicoNacionalidad,
              nombre: this.tecnicoNombre,
              obraSocial: this.tecnicoObraSocial,
              sat: this.tecnicoSat,
              sica: this.sica,
              telefono: this.tecnicoTelefono,
            },
            nuevoUsuario: false,
            isTecnico: true,
            isProductora: false
          };
        }
        var formData = new FormData();
        formData.append("data", JSON.stringify(datosAGuardar));
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
                    store.commit('PUT_INFO_TECNICO', datosAGuardar);
                    console.log(data);
                  })
                  .catch(function (error) {
                    _this.$toast.open({
                      message: error.message,
                      type: 'error'
                    })
                    console.log(`Hubo un problema con la petición Fetch de Mis Datos: ${error.message}`);
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
      }

      if (this.tipoProyectoAceptado == 'Cine') {
        var datos = {
          datos: {
            apellido: this.tecnicoApellido,
            codigoArea: this.tecnicoCodArea,
            codigoPostal: this.tecnicoCodigoPostal,
            cuil: this.tecnicoCuil,
            datosBancarios: {
              banco: this.tecnicoBanco,
              cbu: this.tecnicoCbu,
              numeroCuenta: this.tecnicoNumeroCuenta,
              tipoCuenta: this.tecnicoTipoCuenta,
            },
            direccion: this.tecnicoDireccion,
            dni: this.tecnicoCuil.slice(3, -2),
            email: this.tecnicoEmail,
            estudiosCursados: this.tecnicoEstudiosCursados,
            fechaNacimiento: this.tecnicoFechaNacimiento,
            nacionalidad: this.tecnicoNacionalidad,
            nombre: this.tecnicoNombre,
            obraSocial: this.tecnicoObraSocial,
            sica: this.tecnicoSica,
            telefono: this.tecnicoTelefono,
          },
          idProyecto: this.idProyectoAceptado,
          tipoProyecto: this.tipoProyectoAceptado,
        };
      } else if (this.tipoProyectoAceptado == 'TV') {
        var datos = {
          datos: {
            apellido: this.tecnicoApellido,
            codigoArea: this.tecnicoCodArea,
            codigoPostal: this.tecnicoCodigoPostal,
            cuil: this.tecnicoCuil,
            datosBancarios: {
              banco: this.tecnicoBanco,
              cbu: this.tecnicoCbu,
              numeroCuenta: this.tecnicoNumeroCuenta,
              tipoCuenta: this.tecnicoTipoCuenta,
            },
            direccion: this.tecnicoDireccion,
            dni: this.tecnicoCuil.slice(3, -2),
            email: this.tecnicoEmail,
            estudiosCursados: this.tecnicoEstudiosCursados,
            fechaNacimiento: this.tecnicoFechaNacimiento,
            nacionalidad: this.tecnicoNacionalidad,
            nombre: this.tecnicoNombre,
            obraSocial: this.tecnicoObraSocial,
            sat: this.tecnicoSat,
            telefono: this.tecnicoTelefono,
          },
          idProyecto: this.idProyectoAceptado,
          tipoProyecto: this.tipoProyectoAceptado,
        };
      }
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          user.getIdToken()
            .then(function (token) {
              fetch('https://us-central1-colmena-cac87.cloudfunctions.net/webApi/tecnicoProyectos', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(datos)
              })
                .then((response) => {
                  if (response.ok) {
                    _this.$toast.open({
                      message: 'Proyecto aceptado.',
                      type: 'success'
                    })
                  } else {
                    _this.$toast.open({
                      message: 'Error al aceptar el proyecto.',
                      type: 'error'
                    })
                  }
                  _this.creandoAceptando = false;
                  _this.$refs.formDatosContacto.resetValidation();
                  _this.$refs.formDatosCobroHaberes.resetValidation();
                  _this.dialogInvitacionProyecto = false;
                  _this.pasoProyecto = 1;
                  return response.json();
                })
                .then((data) => {
                  store.commit('POST_PROYECTO_ACEPTADO', {
                    proyecto: {
                      director: _this.directorProyectoAceptado,
                      idInvitacion: _this.idInvitacionPorAceptar,
                      idProyecto: _this.idProyectoAceptado,
                      idTecnicoProyecto: data.idTecnicoProyecto,
                      nombre: _this.nombreProyectoAceptado,
                      productora: _this.productoraProyectoAceptado,
                      tipoProyecto: _this.tipoProyectoAceptado,
                      foto: _this.fotoProyectoAceptado,
                    },
                    index: _this.indexProyectoAceptado,
                  });
                  console.log(data);
                })
                .catch(function (error) {
                  _this.creandoAceptando = false;
                  _this.$toast.open({
                    message: error.message,
                    type: 'error'
                  })
                  console.log('Hubo un problema con la petición Fetch de la Invitación al Proyecto: ' + error.message);
                })
            })
            .catch(function (error) {
              _this.creandoAceptando = false;
              _this.$toast.open({
                message: error.message,
                type: 'error'
              })
              console.log('Hubo un problema con la obtención del token: ' + error.message);
            })
        }
      })
    },
    // Delete invitación a proyecto
    declinarInvitacionAProyecto: function () {
      let _this = this;
      this.declinandoProyecto = true;
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          user.getIdToken()
            .then(function (token) {
              fetch(`https://us-central1-colmena-cac87.cloudfunctions.net/webApi/tecnicoProyectos/invitacionAProyecto/${_this.idProyectoAceptado}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ idInvitacion: _this.idInvitacionPorAceptar })
              })
                .then(response => {
                  if (response.ok) {
                    store.commit('DELETE_PROYECTO_DECLINADO', { indexProyecto: _this.indexProyectoAceptado, idNotificacion: _this.idInvitacionPorAceptar });
                  } else {
                    _this.$toast.open({
                      message: 'Error al declinar la invitación.',
                      type: 'error'
                    })
                  }
                  _this.$refs.formDatosContacto.resetValidation();
                  _this.$refs.formDatosCobroHaberes.resetValidation();
                  _this.dialogInvitacionProyecto = false;
                  _this.dialogDeclinacionInvitacion = false;
                  _this.declinandoProyecto = false;
                  _this.pasoProyecto = 1;
                  return response.json();
                })
                .then(data => { console.log(data) })
                .catch(function (error) {
                  _this.dialogDeclinacionInvitacion = false;
                  _this.$toast.open({
                    message: error.message,
                    type: 'error'
                  })
                  console.log(`Hubo un problema con la petición Fetch de la declinación de la invitación: ${error.message}`);
                })
            })
            .catch(function (error) {
              _this.dialogDeclinacionInvitacion = false;
              _this.$toast.open({
                message: error.message,
                type: 'error'
              })
              console.log(`Hubo un problema con la obtención del token: ${error.message}`);
            })
        }
      })
    },
    // Abre el dialog para saber si guarda o no datos a la hora de aceptar el proyecto
    preAceptarProyecto: function () {
      this.creandoAceptando = true;
      this.dialogGuardarDatos = true;
    },
    // Abre / Get el proyecto seleccionado
    abrirProyecto: function (proyecto) {
      let _this = this;
      if (this.isTecnico) {
        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            user.getIdToken()
              .then(function (token) {
                fetch(`https://us-central1-colmena-cac87.cloudfunctions.net/webApi/tecnicoProyectos/${proyecto.idProyecto}/${proyecto.idTecnicoProyecto}`, {
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
                    _this.$router.push({path: `/${vmMain.idProyectoSeleccionado}/dashboard`});
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
      this.dialogCreacionProyecto = false;
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
    cancelarAceptarProyecto: function () {
      this.dialogInvitacionProyecto = false;
      this.pasoProyecto = 1;
      this.$refs.formDatosContacto.resetValidation();
      this.$refs.formDatosCobroHaberes.resetValidation();
    },
    siguienteFilminaProyecto: function (paso) {
      this.pasoProyecto = paso + 1;
      if (this.$refs.formDatosContacto) {
        if (paso == 1) {
          this.$refs.formDatosContacto.validate();
        }
      } else if (this.$refs.formDatos) {
        if (paso == 1) {
          this.$refs.formDatos.validate();
        } else if (paso == 2) {
          this.$refs.formDatos.validate();
          this.$refs.formTecnicos.validate();
        }
      }
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
        this.logoProductoraProyecto = null;
      }
    },
    save(date) {
      this.$refs.menu.save(date)
    },
    // Formatea la fecha del Date-Picker
    formatDate(date) {
      if (!date) return null

      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`
    },
  },
  store,
  computed: Vuex.mapState({
    // Datos Técnico
    proyectosTecnico: state => state.tecnico.proyectos,
    invitacionesProyectos: state => state.tecnico.invitacionesProyectos,
    nombreTecnico: state => state.tecnico.datos.nombre,
    apellido: state => state.tecnico.datos.apellido,
    codigoArea: state => state.tecnico.datos.codigoArea,
    telefono: state => state.tecnico.datos.telefono,
    email: state => state.tecnico.datos.email,
    cuil: state => state.tecnico.datos.cuil,
    fechaNacimiento: state => state.tecnico.datos.fechaNacimiento,
    obraSocial: state => state.tecnico.datos.obraSocial,
    nacionalidad: state => state.tecnico.datos.nacionalidad,
    direccion: state => state.tecnico.datos.direccion,
    codigoPostal: state => state.tecnico.datos.codigoPostal,
    sica: state => state.tecnico.datos.sica,
    sat: state => state.tecnico.datos.sat,
    estudiosCursados: state => state.tecnico.datos.estudiosCursados,
    banco: state => state.tecnico.datos.datosBancarios.banco,
    tipoCuenta: state => state.tecnico.datos.datosBancarios.tipoCuenta,
    numeroCuenta: state => state.tecnico.datos.datosBancarios.numeroCuenta,
    cbu: state => state.tecnico.datos.datosBancarios.cbu,
    consentimientoDatos: state => state.tecnico.consentimientoDatos,

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
    listaBancos: state => state.globales.bancos,
    listaTiposCuenta: state => state.globales.tiposCuenta,
    listaEstudiosCursados: state => state.globales.estudiosCursados,
    completeFormValidationAceptarProyecto: function () { return this.formDatosContacto && this.formDatosCobroHaberes; },
    completeFormValidationProyectoNuevo: function () { return this.formDatosValidation && this.formTecnicosValidation && this.formFotoValidation; },
  }),
  watch: {
    // Call again the method if the route changes
    '$route': 'fetchData',
    // Arranca el Date-Picker en la vista de años
    menu(val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
    },
    // Formatea correctamente la fecha del Date-Picker antes de guardarla
    date(val) {
      this.tecnicoFechaNacimiento = this.formatDate(this.date);
    }
  },
  template:
    `<div class="col-12 stretch-card">
    <div class="card">
      <div class="card-body">
        <div v-if="isTecnico">
          <template v-if="invitacionesProyectos == undefined || invitacionesProyectos.length == 0">
            <h6 class="font-weight-bold mb-3">MIS PROYECTOS</h6>
            <v-divider></v-divider>
            <h3 v-if="proyectosTecnico == undefined || proyectosTecnico.length == 0" class="mt-5 pt-5 text-muted text-center">
              Aún no tenés proyectos...
            </h3>
            <div class="row">
              <div v-for="(proyecto, index) in proyectosTecnico" class="col-md-3">
                <v-hover v-slot="{hover}">
                  <v-card class="proyectos-card bg-light" :class="{'on-hover': hover}" v-on:click="abrirProyecto(proyecto)">
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
                      <v-card class="proyectos-card bg-light" :class="{'on-hover': hover}" v-on:click="aperturaMenuInvitacionProyecto(proyecto, index)">
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
                <h3 v-if="proyectosTecnico == undefined || proyectosTecnico.length == 0" class="mt-5 pt-5 text-muted text-center">
                  Aún no tenés proyectos...
                </h3>
                <div class="row">
                  <div v-for="(proyecto, index) in proyectosTecnico" class="col-md-4">
                    <v-hover v-slot="{hover}">
                      <v-card class="proyectos-card bg-light" :class="{'on-hover': hover}" v-on:click="abrirProyecto(proyecto)">
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
              <v-dialog v-model="dialogCreacionProyecto" persistent max-width="900px">
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
                      :complete="pasoProyecto > 1 && formDatosValidation"
                      step="1"
                      :rules="[() => formDatosValidation]"
                      v-on:click="siguienteFilminaProyecto(0)"
                    >
                      DATOS
                    </v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step
                      :complete="pasoProyecto > 2 && formTecnicosValidation"
                      step="2"
                      :rules="[() => formTecnicosValidation]"
                      v-on:click="siguienteFilminaProyecto(1)"
                    >
                      TÉCNICXS Y PERMISOS
                    </v-stepper-step>
                    <v-divider></v-divider>
                    <v-stepper-step step="3" :rules="[() => formFotoValidation]" v-on:click="siguienteFilminaProyecto(2)"> FOTO Y LOGO </v-stepper-step>
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
                      <div class="row">
                        <v-spacer></v-spacer>
                        <div class="col">
                          <v-btn v-on:click="cancelarProyectoNuevo" color="normal" width="416" height="48"> CANCELAR </v-btn>
                        </div>
                        <v-spacer></v-spacer>
                        <div class="col">
                          <v-btn v-on:click="siguienteFilminaProyecto(1)" color="primary" width="416" height="48"> SIGUIENTE </v-btn>
                        </div>
                        <v-spacer></v-spacer>
                      </div>
                    </v-stepper-content>
                    <v-stepper-content step="2">
                      <v-card id="form-tecnicos-proyecto-nuevo" class="mb-12">
                        <v-card-text class="px-0">
                          Invite a sus primerxs técnicxs al proyecto. Indique el área y los permisos que les dará a cada unx de ellxs (podrá
                          modificarlos luego). Recomendamos agregar por lo menos una persona con el permiso "Técnicxs" para que le ayude a seguir
                          invitando a otrxs técnicxs y a manejar sus permisos.
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
                          <v-btn v-on:click="cancelarProyectoNuevo" color="normal" width="198" height="48"> CANCELAR </v-btn>
                        </div>
                        <div class="col-3">
                          <v-btn v-on:click="pasoProyecto--" color="normal" outlined width="198" height="48"> ATRÁS </v-btn>
                        </div>
                        <div class="col-6">
                          <v-btn v-on:click="siguienteFilminaProyecto(2)" color="primary" width="416" height="48"> SIGUIENTE </v-btn>
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
                          <v-btn v-on:click="cancelarProyectoNuevo" :disabled="creandoAceptando" color="normal" width="198" height="48"> CANCELAR </v-btn>
                        </div>
                        <div class="col-3">
                          <v-btn v-on:click="pasoProyecto--" :disabled="creandoAceptando" color="normal" outlined width="198" height="48"> ATRÁS </v-btn>
                        </div>
                        <div class="col-6">
                          <v-btn v-on:click="crearProyecto" :disabled="creandoAceptando || !completeFormValidationProyectoNuevo" color="primary" width="416" height="48">
                            <div v-if="!creandoAceptando && completeFormValidationProyectoNuevo">CREAR PROYECTO</div>
                            <div v-else-if="creandoAceptando && completeFormValidationProyectoNuevo">
                              <span class="custom-loader">
                                <v-icon light>mdi-cached</v-icon>
                              </span>
                            </div>
                            <div v-else-if="!completeFormValidationProyectoNuevo">
                              <i class="mdi mdi-close-octagon btn-icon-prepend"></i>
                              CORRIJA LOS ERRORES
                            </div>
                          </v-btn>
                        </div>
                      </div>
                    </v-stepper-content>
                  </v-stepper-items>
                </v-stepper>
              </v-dialog>
            </div>
            <div v-for="(proyecto, index) in proyectosProductora" class="col-md-3">
              <v-hover v-slot="{hover}">
                <v-card class="proyectos-card bg-light" :class="{'on-hover': hover}" v-on:click="abrirProyecto(proyecto)">
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
            <v-btn id="cancelar-edicion-imagen" color="normal" width="416" height="48"> CANCELAR </v-btn>
          </div>
          <div class="col pr-0 pb-4">
            <v-btn id="confirmar-edicion-imagen" color="primary" width="416" height="48"> CONFIRMAR </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogInvitacionProyecto" persistent max-width="900px">
      <v-stepper v-model="pasoProyecto">
        <v-stepper-header>
          <v-stepper-step
            :complete="pasoProyecto > 1 && formDatosContacto"
            step="1"
            :rules="[() => formDatosContacto]"
            v-on:click="siguienteFilminaProyecto(0)"
          >
            DATOS DE CONTACTO
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step step="2" :rules="[() => formDatosCobroHaberes]" v-on:click="siguienteFilminaProyecto(1)">
            DATOS PARA EL COBRO DE HABERES
          </v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card id="form-datos-proyecto-nuevo" class="mb-12">
              <v-card-text class="px-0">
                Fuiste invitadx a participar en {{tipoProyectoAceptado == 'Cine' ? 'la nueva película' : tipoProyectoAceptado == 'TV' ? 'la nueva serie' : 'el nuevo proyecto'}}
                 de {{productoraProyectoAceptado}}: "{{nombreProyectoAceptado}}". Completá y/o corregí tus datos y aceptá el proyecto para compartirlos con la productora (o presioná
                <a style="color: #1976d2" v-on:click="dialogDeclinacionInvitacion = true">acá</a> para declinar la invitación):
              </v-card-text>
              <v-form lazy-validation class="pt-3" v-model="formDatosContacto" ref="formDatosContacto">
                <div class="row w-100">
                  <div class="form-group col-12 col-md-6">
                    <v-text-field v-model="tecnicoNombre" label="Nombre/s" :rules="[rules.obligatorio]" clearable></v-text-field>
                  </div>
                  <div class="form-group col-12 col-md-6">
                    <v-text-field v-model="tecnicoApellido" label="Apellido/s" :rules="[rules.obligatorio]" clearable></v-text-field>
                  </div>
                </div>
                <div class="row w-100">
                  <div class="form-group col-12 col-md-6">
                    <v-text-field v-bind:value="tecnicoEmail" label="E-mail" disabled></v-text-field>
                  </div>
                  <div class="form-group col-12 col-sm-6 col-md-3">
                    <v-text-field
                      v-model="tecnicoCodArea"
                      label="Código de área (sin 0)"
                      v-mask="'#####'"
                      :rules="[rules.obligatorio]"
                      clearable
                    ></v-text-field>
                  </div>
                  <div class="form-group col-12 col-sm-6 col-md-3">
                    <v-text-field
                      v-model="tecnicoTelefono"
                      label="Celular (sin 15)"
                      v-mask="'########'"
                      :rules="[rules.obligatorio]"
                      clearable
                    ></v-text-field>
                  </div>
                </div>
                <div class="row w-100">
                  <div class="form-group col-12 col-sm-4 col-md-5">
                    <v-text-field v-model="tecnicoDireccion" label="Dirección" :rules="[rules.obligatorio]" clearable></v-text-field>
                  </div>
                  <div class="form-group col-12 col-sm-2 col-md-1">
                    <v-text-field v-model="tecnicoCodigoPostal" label="C.P." :rules="[rules.obligatorio]" clearable></v-text-field>
                  </div>
                  <div class="form-group col-12 col-md-6">
                    <v-menu ref="menu" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="tecnicoFechaNacimiento"
                          label="Fecha de nacimiento"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                          :rules="[rules.obligatorio]"
                          clearable
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        class="selects-mis-datos"
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
              </v-form>
            </v-card>
            <div class="row">
              <v-spacer></v-spacer>
              <div class="col">
                <v-btn v-on:click="cancelarAceptarProyecto" color="normal" width="416" height="48"> CANCELAR </v-btn>
              </div>
              <v-spacer></v-spacer>
              <div class="col">
                <v-btn v-on:click="siguienteFilminaProyecto(1)" color="primary" width="416" height="48"> SIGUIENTE </v-btn>
              </div>
              <v-spacer></v-spacer>
            </div>
          </v-stepper-content>
          <v-stepper-content step="2">
            <v-card id="form-foto-proyecto-nuevo" class="mb-12">
              <v-form lazy-validation class="pt-3" v-model="formDatosCobroHaberes" ref="formDatosCobroHaberes">
                <div class="row w-100">
                  <div class="form-group col-12 col-md-6">
                    <v-text-field
                      v-model="tecnicoCuil"
                      :rules="[rules.reglasCuil, rules.obligatorio]"
                      label="C.U.I.L."
                      v-mask="'##-########-#'"
                      clearable
                    ></v-text-field>
                  </div>
                  <div class="form-group col-12 col-md-6">
                    <v-text-field v-model="tecnicoNacionalidad" :rules="[rules.obligatorio]" label="Nacionalidad" clearable></v-text-field>
                  </div>
                </div>
                <div class="row w-100">
                  <div class="form-group col-12 col-md-6">
                    <v-text-field v-model="tecnicoObraSocial" :rules="[rules.obligatorio]" label="Obra Social" clearable></v-text-field>
                  </div>
                  <div v-if="tipoProyectoAceptado == 'Cine'" class="form-group col-12 col-sm-6 col-md-3">
                    <v-select :items="listaAfiliacionSica" v-model="tecnicoSica" label="Afiliación SICA"></v-select>
                  </div>
                  <div v-else-if="tipoProyectoAceptado == 'TV'" class="form-group col-12 col-sm-6 col-md-3">
                    <v-select :items="listaAfiliacionSat" v-model="tecnicoSat" label="Afiliación SATSAID"></v-select>
                  </div>
                  <div class="form-group col-12 col-sm-6 col-md-3">
                    <v-select
                      :items="listaEstudiosCursados"
                      v-model="tecnicoEstudiosCursados"
                      :rules="[rules.obligatorio]"
                      label="Estudios Cursados"
                    ></v-select>
                  </div>
                </div>
                <div class="row w-100">
                  <div class="form-group col-12 col-md-6">
                    <v-select
                      no-data-text="No hay datos disponibles"
                      :items="listaBancos"
                      v-model="tecnicoBanco"
                      :rules="[rules.obligatorio]"
                      label="Banco"
                    ></v-select>
                  </div>
                  <div class="form-group col-12 col-md-6">
                    <v-select
                      no-data-text="No hay datos disponibles"
                      :items="listaTiposCuenta"
                      v-model="tecnicoTipoCuenta"
                      :rules="[rules.obligatorio]"
                      label="Tipo de cuenta"
                    ></v-select>
                  </div>
                </div>
                <div class="row w-100">
                  <div class="form-group col-12 col-md-6">
                    <v-text-field
                      v-model="tecnicoNumeroCuenta"
                      :rules="[rules.obligatorio]"
                      label="Número de cuenta"
                      v-mask="'####################'"
                      clearable
                    ></v-text-field>
                  </div>
                  <div class="form-group col-12 col-md-6">
                    <v-text-field
                      v-model="tecnicoCbu"
                      label="C.B.U."
                      :rules="[rules.reglasCbu, rules.obligatorio]"
                      counter="22"
                      v-mask="'######################'"
                      clearable
                    ></v-text-field>
                  </div>
                </div>
              </v-form>
            </v-card>
            <div class="row justify-content-center">
              <div class="col-3">
                <v-btn v-on:click="cancelarAceptarProyecto" :disabled="creandoAceptando" color="normal" width="198" height="48"> CANCELAR </v-btn>
              </div>
              <div class="col-3">
                <v-btn v-on:click="pasoProyecto--" :disabled="creandoAceptando" color="normal" outlined width="198" height="48"> ATRÁS </v-btn>
              </div>
              <div class="col-6">
                <v-btn v-on:click="preAceptarProyecto" :disabled="creandoAceptando || !completeFormValidationAceptarProyecto" color="primary" width="416" height="48">
                  <div v-if="!creandoAceptando && completeFormValidationAceptarProyecto">ACEPTAR PROYECTO</div>
                  <div v-else-if="creandoAceptando && completeFormValidationAceptarProyecto">
                    <span class="custom-loader">
                      <v-icon light>mdi-cached</v-icon>
                    </span>
                  </div>
                  <div v-else-if="!completeFormValidationAceptarProyecto">
                    <i class="mdi mdi-close-octagon btn-icon-prepend"></i>
                    CORRIJA LOS ERRORES
                  </div>
                </v-btn>
              </div>
            </div>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>
    <dialog-dos-botones-multifuncion
      v-bind:activador="dialogDeclinacionInvitacion"
      v-bind:enProceso="declinandoProyecto"
      titulo="RECHAZAR INVITACIÓN"
      texto="¿Estás seguro/a de querer rechazar esta invitación?"
      textoBotonCancelar="CANCELAR"
      textoBotonPrincipal="RECHAZAR"
      v-bind:funcionBotonPrincipal="declinarInvitacionAProyecto"
      v-on:cancelar="dialogDeclinacionInvitacion = false"
    ></dialog-dos-botones-multifuncion>
    <dialog-dos-botones-multifuncion
      v-bind:activador="dialogGuardarDatos"
      v-bind:enProceso="false"
      titulo="ACTUALIZAR MIS DATOS"
      texto="¿Querés guardar estos datos para futuros proyectos?"
      textoBotonCancelar="NO"
      textoBotonPrincipal="SI"
      v-bind:funcionBotonPrincipal="aceptarProyectoYGuardarDatos.bind(true)"
      v-on:cancelar="aceptarProyectoYGuardarDatos(false)"
    ></dialog-dos-botones-multifuncion>
  </div>`
})