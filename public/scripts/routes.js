'use strict';

const routes = [
  {
    path: '/',
    name: 'inicio',
    component: vmInicio,
    // meta: {requiresAuth : true}
  },
  {
    path: '/mis-datos',
    name: 'mis-datos',
    component: vmMisDatos
  },
  {
    path: '/ajustes',
    name: 'ajustes',
    component: vmAjustes
  }
]