'use strict'

var vmNotificaciones = Vue.component('dialog-dos-botones-multifuncion', {
  data: function () {
    return {
    }
  },
  props: ['activador',
    'titulo',
    'texto',
    'textoBotonCancelar',
    'textoBotonPrincipal',
    'funcionBotonPrincipal',
    'enProceso'
  ],
  template:
    `<v-dialog v-model="activador" max-width="500px">
    <v-card>
      <v-card-title>{{titulo}}</v-card-title>
      <v-card-text> {{texto}} </v-card-text>
      <v-card-actions>
        <div class="row justify-content-center">
          <div class="col">
            <button type="button" class="btn btn-secondary btn-block btn-lg font-weight-medium auth-form-btn" v-on:click="$emit('cancelar')">
              {{textoBotonCancelar}}
            </button>
          </div>
          <div class="col">
            <button
              type="button"
              class="btn btn-primary btn-block btn-lg font-weight-medium auth-form-btn"
              v-on:click="funcionBotonPrincipal"
              v-bind:disabled="enProceso"
            >
              <div v-if="!enProceso">{{textoBotonPrincipal}}</div>
              <div v-if="enProceso">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              </div>
            </button>
          </div>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>`
})