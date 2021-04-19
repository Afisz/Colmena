'use strict'

var vmTareas = Vue.component('tareas', {
  data: function () {
    return {
      tareaNueva: '',
      userTareas: []
    }
  },
  methods: {
    fetchData: function () {
      if (this.isTecnico) {
        this.userTareas = this.userTareasTecnicoStore;
      } else if (this.isProductora) {
        this.userTareas = this.userTareasProductoraStore;
      }
    },
    updateData: function () {
      let _this = this;
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          user.getIdToken()
            .then(function (token) {
              fetch('https://us-central1-colmena-cac87.cloudfunctions.net/webApi/tareas/' + user.uid, {
                method: 'put',
                headers: { 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(_this.userTareas)
              })
                .then(response => {
                  store.commit('PUT_TAREAS', _this.userTareas);
                  return response.json();
                })
                .then(data => {
                  console.log(data);
                })
                .catch(function (error) {
                  _this.$toast.open({
                    message: error.message,
                    type: "error"
                  })
                  console.log('Hubo un problema con la actualización de las tareas: ' + error.message);
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
    agregarTarea: function () {
      if (this.tareaNueva.length > 62) {
        this.userTareas.push({ tarea: this.tareaNueva + '..------', hecha: false });
      } else {
        this.userTareas.push({ tarea: this.tareaNueva, hecha: false });
      }
      this.updateData();
      this.tareaNueva = '';
    },
    quitarTarea: function (index) {
      this.userTareas.splice(index, 1);
      this.updateData();
    }
  },
  store,
  computed: Vuex.mapState({
    isTecnico: state => state.isTecnico,
    isProductora: state => state.isProductora,
    userTareasTecnicoStore: state => state.tecnico.tareas,
    userTareasProductoraStore: state => state.productora.tareas
  }),
  created() {
    this.fetchData();
  },
  watch: {
    // Call again the method if the route changes
    '$route': 'fetchData'
  },
  template:
  `<div class="tab-pane fade show active scroll-wrapper" role="tabpanel">
    <div class="add-items d-flex px-3 mb-0">
      <div class="form w-100" v-on:keyup.enter="agregarTarea">
        <div class="form-group d-flex">
          <input type="text" class="form-control todo-list-input" placeholder="Añadir tarea" v-model:value="tareaNueva"/>
          <button class="add btn btn-primary todo-list-add-btn" v-on:click="agregarTarea">
            Añadir
          </button>
        </div>
      </div>
    </div>
    <div class="list-wrapper px-3">
      <ul id="tareas" class="d-flex flex-column-reverse todo-list">
        <li v-for="(tarea, index) in userTareas">
          <div class="form-check" v-bind:class="{'completed': tarea.hecha}">
            <label class="form-check-label tareas-label">
              <input class="checkbox" type="checkbox" v-on:change="updateData" v-model:value="tarea.hecha" v-bind:checked="{'checked': tarea.hecha}">
              {{tarea.tarea}}
              <i class="input-helper"></i>
            </label>
          </div>
          <i v-on:click="quitarTarea(index)" class="remove mdi mdi-close-circle-outline"></i>
        </li>
      </ul>
    </div>
  </div>`
})