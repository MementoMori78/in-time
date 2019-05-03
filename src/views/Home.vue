<template>
  <div class="home">
    <div class="row">
      <div class="col s12 m12">
        <div class="card white">
          <div class="card-content black-text">
            <span class="card-title">Для початку роботи необхідно:</span>
            <br>
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
                  Завантажити таблицю зі статичними даними АТМ
                  <a href="#!" class="secondary-content" v-on:click="uploadData">
                    <i class="material-icons black-text">arrow_upward</i>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="row" >
      <template v-if="showOrdersCard">
        <div class="col s5 offset-s1">
            <FileCaption  :name="ordersCardName" :filename="ordersCardPath" >  </FileCaption>
        </div>
      </template>
      <template v-if="showDataCard">
        <div class="col s5" >
            <FileCaption  :name="dataCardName" :filename="dataCardPath"> </FileCaption>
        </div>
      </template>
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
      showDataCard: Boolean,
      showOrdersCard: Boolean,
      dataCardName: String,
      ordersCardName: String,
      dataCardPath: String,
      ordersCardPath: String
    }
  },
  methods: {
    uploadOrders: () => {
      //request to backgroung.js
      ipcRenderer.send('orders:upload');
      //answer on same channel
      ipcRenderer.on('orders:upload', (event, state) => {
        this.showDataCard = state.showDataCard;
        this.showOrdersCard = state.showOrdersCard;
        this.dataCardName = state.dataCardName;
        this.ordersCardName = state.ordersCardName;
        this.dataCardPath = state.dataCardPath;
        this.ordersCardPath = state.ordersCardPath;
      })
    },
    uploadData: () => {
      ipcRenderer.send('data:upload');
      ipcRenderer.on('data:upload', (event, state) => {
        this.showDataCard = state.showDataCard;
        this.showOrdersCard = state.showOrdersCard;
        this.dataCardName = state.dataCardName;
        this.ordersCardName = state.ordersCardName;
        this.dataCardPath = state.dataCardPath;
        this.ordersCardPath = state.ordersCardPath;
      })  
    }
  },
  mounted(){
    ipcRenderer.send('home:mounted');
    ipcRenderer.on('home:mounted', (event, data) => {
        this.showDataCard = data.showDataCard;
        this.showOrdersCard = data.showOrdersCard;
        this.dataCardName = data.dataCardName;
        this.ordersCardName = data.ordersCardName;
        this.dataCardPath = data.dataCardPath;
        this.ordersCardPath = data.ordersCardPath;
    })
  }
};
</script>
