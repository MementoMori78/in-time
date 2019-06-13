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
               Завантажити таблицю з даними заявок Printec
                  <a href="#" class="secondary-content" v-on:click="uploadOrders">
                    <i class="material-icons black-text">arrow_upward</i>
                  </a>
              </li>
              <li class="collection-item">
                <div>
                  Завантажити таблицю зі статичними даними АТМ
                  <a
                    href="#"
                    class="secondary-content"
                    v-on:click="uploadData"
                  >
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
      <div class="col s6">
        <div class="card white" v-if="showOrdersCard">
          <div class="card-content balck-text">
            <span class="card-title">{{ ordersCardName}}</span>
            <p>Шлях до файлу:</p>
            <p>{{ ordersCardPath }}</p>
          </div>
        </div>
      </div>
      <div class="col s6">
        <div class="card white" v-if="showDataCard">
          <div class="card-content balck-text">
            <span class="card-title">{{ dataCardName}}</span>
            <p>Шлях до файлу:</p>
            <p>{{ dataCardPath }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<style>
</style>


<script>
// @ is an alias to /src
const { remote, ipcRenderer } = require("electron");
export default {
  name: "home",
  data() {
    return {
      showDataCard: false,
      showOrdersCard: false,
      dataCardName: "1",
      ordersCardName: "",
      dataCardPath: "",
      ordersCardPath: ""
    };
  },
  methods: {
    uploadOrders: () => {
      ipcRenderer.send("orders:upload");
    },
    uploadData: () => {
      ipcRenderer.send("data:upload");
    }
  },
  beforeCreate() {
    ipcRenderer.send("home:mounted");
    ipcRenderer.on("home:mounted", (event, data) => {
      this.showDataCard = data.showDataCard;
      this.showOrdersCard = data.showOrdersCard;
      this.dataCardName = data.dataCardName;
      this.ordersCardName = data.ordersCardName;
      this.dataCardPath = data.dataCardPath;
      this.ordersCardPath = data.ordersCardPath;
    });
    ipcRenderer.on("orders:upload", (event, state) => {
      this.showDataCard = state.showDataCard;
      this.showOrdersCard = state.showOrdersCard;
      this.dataCardName = state.dataCardName;
      this.ordersCardName = state.ordersCardName;
      this.dataCardPath = state.dataCardPath;
      this.ordersCardPath = state.ordersCardPath;
    });
    ipcRenderer.on("data:upload", (event, state) => {
      this.showDataCard = state.showDataCard;
      this.showOrdersCard = state.showOrdersCard;
      this.dataCardName = state.dataCardName;
      this.ordersCardName = state.ordersCardName;
      this.dataCardPath = state.dataCardPath;
      this.ordersCardPath = state.ordersCardPath;
    });
  }
};
</script>
