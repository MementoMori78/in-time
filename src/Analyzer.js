import xl from 'xlsx'
import csv from 'fast-csv'
import fs from 'fs'
import { delimiter } from 'path';
import ipcMain from 'electron';
import moment from 'moment';

export default class Analyzer {
    constructor() {
        this.orderWS;
        this.staticDataAll;
        this.staticData;
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
            ordersEndTime: `${this.ordersEndTime.format('DD.MM.YYYY HH:mm:ss')}`
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
        let rowsCount = 0;
        fileStream
            .pipe(parser)
            .on('error', error => console.error(rowsCount, error))
            .on('data', (orderObj) => {
                console.log(orderObj);
                this.allOrdersData.push(orderObj);
            })
            .on('end', (rows) => {
                console.log(`done, parsed ${rows} rows`);
                this.analyzeAllOrders();
                win.send('orders:upload', this.getStateForHome());
            });

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
            .on('error', error => console.error(rowsCount, error))
            .on('data', (dataObj) => {
                this.staticDataAll.push(dataObj);
                if (dataObj['виробник'] == "NCR") {
                    this.staticData.push(dataObj);
                    console.log(dataObj);
                }
            })
            .on('end', (rows) => {
                console.log(`done, found ${this.staticData.length} NCRs`);
                win.send('data:upload', this.getStateForHome());
            });
    }

    analyzeAllOrders() {
        if (!this.allOrdersData) return console.warn('No orders to analyze.');
        this.allOrdersCount = this.allOrdersData.length;
        this.closedOrders = [];
        this.allOrdersData.forEach((order) => {
            if (order['Стан заявки'] == "Заявка закрита")
                this.closedOrders.push(order);
        })
        this.closedOrdersCount = this.closedOrders.length;
        this.findUnique();
        this.findStartEndTime();
        console.log(`Результат аналізу: Заявок всього: ${this.allOrdersCount} Закритих заявок: ${this.closedOrdersCount}`)
    }

    findUnique() {
        this.arrUniqueATM = [];
        for (let i = 0; i < this.closedOrders.length; i++) {
            if (!this.arrUniqueATM.includes(this.closedOrders[i]['Id банкомата']))
                this.arrUniqueATM.push(this.closedOrders[i]['Id банкомата']);
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
}
