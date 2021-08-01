'use strict'

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        window.location.href = "./index.html";
    }
});

var vmIngreso = new Vue({
  el: "#vmIngreso",
  methods: {
    signInButtonGoogle: function () {
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider)
        .then((result) => {
          if (result.user.metadata.creationTime == result.user.metadata.lastSignInTime) {
            setTimeout(() => {window.location.href = "./index.html";}, 1000);
          } else {
            window.location.href = "./index.html";
          }
        })
        .catch((error) => {
          console.log(error);
        });
        }
  }
})