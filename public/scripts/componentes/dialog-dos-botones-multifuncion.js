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
        <v-spacer></v-spacer>
        <v-btn class="mb-2" v-on:click="$emit('cancelar')" color="normal" width="100"> {{textoBotonCancelar}} </v-btn>
        <v-spacer></v-spacer>
        <v-btn class="mb-2" v-on:click="funcionBotonPrincipal" :disabled="enProceso" color="primary" width="100">
          <div v-if="!enProceso">{{textoBotonPrincipal}}</div>
          <div v-if="enProceso">
            <span class="custom-loader">
              <v-icon light>mdi-cached</v-icon>
            </span>
          </div>
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>`
})