import xl from 'xlsx'
import csv from 'fast-csv'
import fs from 'fs'
import { delimiter } from 'path';
import ipcMain from 'electron';
import moment from 'moment';

export default class Analyzer {
    constructor() {
        this.orderWS;
        this.staticDataAll = [];
        this.staticData = [];
        this.ordersFilepath = '';
        this.dataFilepath = '';
        this.showDataCard = false;
        this.showOrdersCard = false;
        this.allOrdersData = [];
        this.allOrdersCount;
        this.closedOrders = [];
        this.closedOrdersCount;
        this.uniqueATMFromOrders;
        this.arrUniqueATM = [];
        this.ordersStartTime = moment();
        this.ordersEndTime = moment('1995-12-25');
        this.atmCoverage = 'Недостатньо даних';
        this.missingATMs = '';
    }
    getStateForHome() {
        return {
            showDataCard: this.showDataCard,
            showOrdersCard: this.showOrdersCard,
            dataCardName: 'Статичні дані',
            ordersCardName: 'Дані заявок',
            dataCardPath: this.dataFilepath,
            ordersCardPath: this.ordersFilepath,
            allOrdersCount: this.allOrdersCount,
            closedOrdersCount: this.closedOrdersCount,
            uniqueATMFromOrders: this.uniqueATMFromOrders,
            ordersStartTime: `${this.ordersStartTime.format('DD.MM.YYYY HH:mm:ss')}`,
            ordersEndTime: `${this.ordersEndTime.format('DD.MM.YYYY HH:mm:ss')}`,
            staticDataATMCount: this.staticData.length,
            staticDataAllATMCount: this.staticDataAll.length,
            atmCoverage: this.atmCoverage,
            missingATMs: this.missingATMs
        }
    }
    loadOrdersData(filepath, win) {
        if (!filepath) return;
        filepath = filepath[0];
        this.ordersFilepath = filepath;
        this.showOrdersCard = true;
        /*
        const customHeaders = [
            'orderId',//'Id заявки',
            'atmId', //'Id банкомата',
            'atmSn',  //'SN банкомата',
            'type', //'Тип',
            'model', //'Модель',
            'adress',//'Адреса',
            'city', //'Місто',
            'region',//'Область',
            'placedAt', //'Розташування'
            'localization',//'Локалізація',
            'orderDetails',//'Опис заявки',
            'orderReport',  //'Звіт',
            'orderState',//'Стан заявки',
            'createdTime',//'Час створення',
            'accessTime',  //'Час доступа',
            'plannedTime', //'Плановий час',
            'realTime' //'Фактичний час',
        ]
        */
        const fileStream = fs.createReadStream(filepath, {
            encoding: 'utf-8',
        });
        const parseOptions = {
            delimiter: "|",
            headers: true,
            objectMode: true
        }
        const parser = csv.parse(parseOptions);
        this.allOrdersData = [];
        this.closedOrdersCount = 0;
        this.allOrdersCount = 0;
        let rowsCount = 0;
        fileStream
            .pipe(parser)
            .on('error', error => {
                this.ordersFilepath = 'Помилка при зчитуванні ' + this.ordersFilepath;
                console.error(rowsCount, error);
            })
            .on('data', (orderObj) => {
                this.allOrdersData.push(orderObj);
            })
            .on('end', (rows) => {
                console.log(`parsed ${rows} rows`);
                this.analyzeAllOrders();
                this.findATMCoverage();
                win.send('orders:upload', this.getStateForHome());
            });
        //orders
    }
    loadStaticData(filepath, win) {
        if (!filepath) return;
        filepath = filepath[0];
        this.dataFilepath = filepath;
        this.showDataCard = true;
        const fileStream = fs.createReadStream(filepath, {
            encoding: 'utf-8',
        });
        const parseOptions = {
            delimiter: "|",
            headers: true,
            objectMode: true
        }
        const parser = csv.parse(parseOptions);
        this.staticDataAll = [];
        this.staticData = [];
        let rowsCount = 0;
        fileStream
            .pipe(parser)
            .on('error', error => {
                console.error(rowsCount, error);
                this.dataFilepath = 'Помилка при зчитуванні ' + this.dataFilepath;
                win.send('data:upload', this.getStateForHome());
            })
            .on('data', (dataObj) => {
                this.staticDataAll.push(dataObj);
                if (dataObj['виробник'] == "NCR") {
                    this.staticData.push(dataObj);
                }
            })
            .on('end', (rows) => {
                console.log(`static parsed, all:${this.staticDataAll.length}, ncr:${this.staticData.length}`);
                //checking if orders file has been parsed
                this.findATMCoverage();
                win.send('data:upload', this.getStateForHome());
            });
        //static
    }

    analyzeAllOrders() {
        if (!this.allOrdersData) return console.warn('No orders to analyze.');
        this.allOrdersCount = this.allOrdersData.length;
        this.closedOrders = [];
        this.allOrdersData.forEach((order) => {
            if (order['Стан заявки'] == "Заявка закрита"){
               this.closedOrders.push(order);
               console.log(`asc:${order['Час доступа']} pln:${order['Плановий час']} real:${order['Фактичний час']}`) 
            }
        })
        this.closedOrdersCount = this.closedOrders.length;
        this.findUnique();
        this.findStartEndTime();
        console.log(`analyzed orders, overall: ${this.allOrdersCount} closed: ${this.closedOrdersCount}`)
    }

    findUnique() {
        this.arrUniqueATM = [];
        for (let i = 0; i < this.closedOrders.length; i++) {
            if (!this.arrUniqueATM.some( e => e['Id банкомата'] == this.closedOrders[i]['Id банкомата']))
                this.arrUniqueATM.push(this.closedOrders[i]);
        }
        this.uniqueATMFromOrders = this.arrUniqueATM.length;
    }

    findStartEndTime() {
        this.ordersStartTime = moment();
        this.ordersEndTime = moment('1995-12-25');
        const format = 'DD.MM.YYYY hh:mm:ss'
        this.closedOrders.forEach((el) => {
            el.creationTime = moment(el['Час створення'], format);
            el.realTime = moment(el['Фактичний час'], format);

            //console.log(`[${el['Час створення']}][${el['Фактичний час']}]`);

            if (el.creationTime < this.ordersStartTime) {
                this.ordersStartTime = el.creationTime;
            }
            if (el.realTime > this.ordersEndTime) {
                this.ordersEndTime = el.realTime
            }
        });
    }

    findATMCoverage() {
        this.missingATMs = '';
        this.atmCoverage = 'Недостатньо даних';
        if (!this.closedOrdersCount || !this.staticDataAll.length || !this.arrUniqueATM.length) {
            return;
        }
        let found = 0;
        let notFoundInStatic = []
        this.arrUniqueATM.forEach((el) => {
            if (this.staticDataAll.some(e => e['ID'] == el['Id банкомата'])) {
                found++;
            } else {
                notFoundInStatic.push(el);
            }
        })
        this.closedOrders.forEach( (order) => {
            if(this.notFoundInStatic){
                
            }
        })

        this.atmCoverage = `${found}/${this.uniqueATMFromOrders}`;
        console.log(this.atmCoverage);
        console.log('Not found IDs:');
        notFoundInStatic.forEach((el) => {
            console.log(el['Id банкомата']);
            this.missingATMs += `${el['Id банкомата']}, `;
        })
        if(!notFoundInStatic.length){
            this.missingATMs = 'Статичні дані присутні для всіх АТМ';
        }else{
            this.missingATMs = this.missingATMs.slice(0, -2);
        }
    }
}
