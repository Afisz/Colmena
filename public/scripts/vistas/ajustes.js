'use strict'

var vmAjustes = Vue.component('ajustes', {
    data: function () {
        return {
        }
    },
    methods: {
    },
    template:
       `<transition name="slide" mode="out-in">
         <div class="row d-flex align-items-center h-100">
           <div class="col">
             <div class="circle-loader">
             </div>
           </div>
         </div>
        </transition>`
})
