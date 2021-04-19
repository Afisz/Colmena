'use strict'

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        window.location.href = "./index.html";
    }
});

var vmIngreso = new Vue({
    el: "#vmIngreso",
    data: {
    },
    methods: {
        signInButtonGoogle: function () {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(() => {
                    window.location.href = "./index.html";
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }
})