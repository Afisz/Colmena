'use strict'

firebase.auth().onAuthStateChanged(function (user) {
  if (!user) {
    window.location.href = "./ingreso.html";
  }

  if (user != null) {
    store.commit('GET_INFO_USUARIO', user);
    user.getIdToken()
      .then(function (token) {
        fetch('https://us-central1-colmena-cac87.cloudfunctions.net/webApi/usuarios/' + user.uid, {
          method: 'get',
          headers: { 'Authorization': 'Bearer ' + token }
        })
          .then(response => response.json())
          .then(data => {
            if (data.isTecnico) {
              store.commit('GET_INFO_TECNICO', data);
            } else if (data.isProductora) {
              store.commit('GET_INFO_PRODUCTORA', data);
            }

            if (window.location.pathname == '/mis-datos') {
              // Método del componente "Mis Datos"
              vmMain.$route.matched[0].instances.default.fetchData();
            }
          })
          .catch(function (error) {
            Vue.$toast.open({
              message: error.message,
              type: 'error'
            })
            console.log('Hubo un problema con la petición Fetch del Usuario: ' + error.message);
          })

          fetch('https://us-central1-colmena-cac87.cloudfunctions.net/webApi/globales', {
          method: 'get',
          headers: { 'Authorization': 'Bearer ' + token }
        })
          .then(response => response.json())
          .then(data => {
            store.commit('GET_GLOBALES', data);
           
            if (window.location.pathname == '/mis-datos') {
              // Método del componente "Mis Datos"
              vmMain.$route.matched[0].instances.default.fetchData();
            }
          })
          .catch(function (error) {
            Vue.$toast.open({
              message: error.message,
              type: 'error'
            })
            console.log('Hubo un problema con la petición Fetch de los Globales: ' + error.message);
          })
      })
      .catch(function (error) {
        Vue.$toast.open({
          message: error.message,
          type: 'error'
        })
        console.log('Hubo un problema con la obtención del token: ' + error.message);
      })
  }
});
