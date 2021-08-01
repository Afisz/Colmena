'use strict';

const routes = [
  {
    path: '/',
    name: 'inicio',
    component: vmInicio,
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
  },
  {
    path: '/:idProyecto/dashboard',
    name: 'dashboard',
    component: vmDashboard
  },
  {
    path: '/:idProyecto/invitacionesypermisos',
    name: 'invitacionesypermisos',
    component: vmInvitacionesYPermisos,
  }
]