<template>
  <div class="home">
    <div class="row">
      <div class="col s12 m12">
        <div class="card white">
          <div class="card-content black-text">
            <span class="card-title">Для початку роботи необхідно:</span>
            <ul class="collection">
              <li class="collection-item">
                <div>
                  Завантажити таблицю з даними заявок Printec
                  <a href="#!" class="secondary-content" v-on:click="uploadOrders">
                    <i class="material-icons black-text">arrow_upward</i>
                  </a>
                </div>
              </li>
              <li class="collection-item">
                <div>
                  Завантажити таблицю з статичними даними АТМ
                  <a href="#!" class="secondary-content">
                    <i class="material-icons black-text">arrow_upward</i>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col s12 m6">
          <FileCaption :name="captionName"> </FileCaption>
      </div>
      <div class="col s12 m6">
          <FileCaption :name="captionName"> </FileCaption>
      </div>
    </div>
  </div>
</template>

<style>
</style>


<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import FileCaption from "@/components/FileCaption.vue";
const { remote, ipcRenderer } = require("electron");
export default {
  name: "home",
  components: {
    FileCaption
  },
  data(){
    return {
      captionName: 'Hello'
    }
  },
  methods: {
    uploadOrders: function(){
      alert('Hello');
      ipcRenderer.send('uploadOrders', 'hello')
    }
  }
};
</script>
