<template>
  <div class="home">
    <div class="row" v-if="!showOrdersCard || !showDataCard">
      <div class="col s12 m12">
        <div class="card white">
          <div class="card-content black-text">
            <span class="card-title">Для початку роботи необхідно:</span>
            <br>
            <ul class="collection">
              <li class="collection-item" v-if="!showOrdersCard">
                1. Завантажити таблицю з даними заявок Printec
                <a
                  href="#"
                  class="secondary-content"
                  v-on:click="uploadOrders"
                >
                  <i class="material-icons black-text">arrow_upward</i>
                </a>
              </li>
              <li class="collection-item" v-if="!showDataCard">
                <div>
                  2. Завантажити таблицю зі статичними даними АТМ
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
        <div class="card" v-if="showOrdersCard">
          <div class="card-content black-text">
            <span class="card-title">{{ ordersCardName}}</span>
            <ul class="collection">
              <li class="collection-item">
                Шлях до файлу:
                <br>
                <span class="blue-text">{{ ordersCardPath }}</span>
              </li>
              <li class="collection-item">
                Кількість заявок:
                <span class="blue-text">{{ allOrdersCount }}</span>
              </li>
              <li class="collection-item">
                Закритих заявок :
                <span class="blue-text">{{ closedOrdersCount }}</span>
              </li>
              <li class="collection-item">
                Перше створення заявки - Останнє закриття заявки
                <br>
                <span class="blue-text">{{ordersStartTime }} - {{ ordersEndTime }}</span>
              </li>
              <li class="collection-item">
                Кількість унікальних АТМ зі списку закритих заявок:
                <span
                  class="blue-text"
                >{{ uniqueATMFromOrders }}</span>
              </li>
            </ul>
          </div>
          <div class="card-action">
            <a href="#" class="blue-text" v-on:click="uploadOrders">інший файл</a>
          </div>
        </div>
      </div>
      <div class="col s6">
        <div class="card white" v-if="showDataCard">
          <div class="card-content black-text">
            <span class="card-title">{{dataCardName}}</span>
            <ul class="collection">
              <li class="collection-item">
                Шлях до файлу:
                <br>
                <span class="blue-text">{{ dataCardPath }}</span>
              </li>
              <li class="collection-item">
                Кількість АТМ:
                <span class="blue-text">{{ staticDataAllATMCount }}</span>
              </li>
              <li class="collection-item">
                Виробник NCR:
                <span class="blue-text">{{ staticDataATMCount }}</span>
              </li>
              <li class="collection-item">
                Наявність статичних даних для АТМ зі списку закритих заявок:
                <span class="blue-text">
                  <b>{{ atmCoverage }}</b>
                </span>
              </li>
              <li class="collection-item">
                ID банкоматів для яких відсутні статичні дані:
                <span
                  class="blue-text"
                >{{ missingATMs }}</span>
              </li>
            </ul>
          </div>
          <div class="card-action">
            <a href="#" class="blue-text" v-on:click="uploadData">інший файл</a>
          </div>
        </div>
      </div>
    </div>
    <div class="row" v-if="showOrdersCard && showDataCard">
      <div class="col s12">
        <div class="card white">
          <div class="card-content">
            <div class="row">
              <div class="col s6">
                <span class="card-title">Оберіть вихідні дні</span>
                <div class="row">
                  <vc-date-picker
                    :locale="{ id: 'uk'}"
                    :columns="1"
                    :min-date="this.minDate"
                    :max-date="this.maxDate"
                    mode="multiple"
                    :value="null"
                    is-inline
                    is-expanded
                    @input="updateFreeDates"
                  ></vc-date-picker>
                </div>
              </div>

              <div class="col s6">
                <span class="card-title">Оберіть робочі суботи</span>
                <div class="row">
                  <vc-date-picker
                    :locale="{ id: 'uk'}"
                    :columns="1"
                    :disabled-dates="{ weekdays: [1, 2, 3, 4, 5, 6 ] }"
                    :min-date="this.minDate"
                    :max-date="this.maxDate"
                    mode="multiple"
                    :value="null"
                    is-inline
                    is-expanded
                    @input="updateWorkingSaturdays"
                  ></vc-date-picker>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col s12">
                <p class="center-align">
                  <a
                    class="waves-effect waves-light blue btn"
                    v-on:click="getStats"
                  >Отримати файл статистики</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<style>
.vc-rounded-lg {
  border-radius: 0;
}

.card-content {
  padding-top: 10px;
}
</style>


<script>
// @ is an alias to /src
const { remote, ipcRenderer } = require("electron");
import Calendar from "v-calendar";
import moment from "moment";
import { start } from "repl";
export default {
  name: "home",
  data() {
    return {
      showDataCard: false,
      showOrdersCard: false,
      dataCardName: "1",
      ordersCardName: "",
      dataCardPath: "",
      ordersCardPath: "",
      allOrdersCount: 0,
      closedOrdersCount: 0,
      ordersOk: true,
      dataOk: true,
      uniqueATMFromOrders: 0,
      ordersStartTime: "",
      ordersEndTime: "",
      staticDataATMcount: 0,
      staticDataAllATMCount: 0,
      atmCoverage: "Недостатньо даних",
      missingATMs: "",
      minDate: moment().toDate(),
      maxDate: moment().toDate(),
      selectedDates: [],
      workingSaturdays: []
    };
  },
  methods: {
    uploadOrders: () => {
      ipcRenderer.send("orders:upload");
    },
    uploadData: () => {
      ipcRenderer.send("data:upload");
    },
    getStats() {
      ipcRenderer.send("stats:get", { dates: this.selectedDates , workingSaturdays: this.workingSaturdays});
    },
    updateState(state) {
      this.showDataCard = state.showDataCard;
      this.showOrdersCard = state.showOrdersCard;
      this.dataCardName = state.dataCardName;
      this.ordersCardName = state.ordersCardName;
      this.dataCardPath = state.dataCardPath;
      this.ordersCardPath = state.ordersCardPath;
      this.allOrdersCount = state.allOrdersCount;
      this.closedOrdersCount = state.closedOrdersCount;
      this.uniqueATMFromOrders = state.uniqueATMFromOrders;
      this.ordersStartTime = state.ordersStartTime;
      this.ordersEndTime = state.ordersEndTime;
      this.staticDataATMCount = state.staticDataATMCount;
      this.staticDataAllATMCount = state.staticDataAllATMCount;
      this.atmCoverage = state.atmCoverage;
      this.missingATMs = state.missingATMs;
      this.minDate = moment(
        this.ordersStartTime,
        "DD.MM.YYYY HH:mm:ss"
      ).toDate();
      this.maxDate = moment(this.ordersEndTime, "DD.MM.YYYY HH:mm:ss").toDate();
      //this.calendarAttributes[0].dates.end = moment(this.ordersEndTime, 'DD.MM.YYYY HH:mm:ss').toDate();
    },
    updateFreeDates(obj) {
      this.selectedDates = obj;
    },
    updateWorkingSaturdays(obj) {
      this.workingSaturdays = obj;
    }
  },
  beforeCreate() {
    ipcRenderer.send("home:mounted");
    ipcRenderer.on("home:mounted", (event, state) => {
      this.updateState(state);
    });
    ipcRenderer.on("orders:upload", (event, state) => {
      this.updateState(state);
    });
    ipcRenderer.on("data:upload", (event, state) => {
      this.updateState(state);
    });
    ipcRenderer.on("state:reload", (event, state) => {
      console.log("recieved state");
      this.updateState(state);
    });
  }
};
</script>
