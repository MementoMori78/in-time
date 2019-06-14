import xl from 'xlsx'
import csv from 'fast-csv'
import fs from 'fs'
import { delimiter } from 'path';
import ipcMain from 'electron';
export default class Analyzer {
    constructor() {
        this.orderWS;
        this.dataWS;
        this.ordersWSFilepath = '';
        this.dataWSFilepath = '';
        this.showDataCard = false;
        this.showOrdersCard = false;
        this.allOrdersData = [];
        this.allOrdersCount;
        this.closedOrders = [];
        this.closedOrdersCount;
    }
    getStateForHome() {
        return {
            showDataCard: this.showDataCard,
            showOrdersCard: this.showOrdersCard,
            dataCardName: 'Статичні дані',
            ordersCardName: 'Дані заявок',
            dataCardPath: this.dataWSFilepath,
            ordersCardPath: this.ordersWSFilepath,
            allOrdersCount: this.allOrdersCount,
            closedOrdersCount: this.closedOrdersCount
        }
    }
    loadOrdersWS(filepath, win) {
        if (!filepath) return;
        filepath = filepath[0];
        this.ordersWSFilepath = filepath;
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
            rowDelimiter: "\n",
            headers: true,
            //headers: customHeaders,
            //renameHeaders: true,
            objectMode: true
        }
        const parser = csv.parse(parseOptions);
        let rowCount = 0;
        this.allOrdersData = [];
        fileStream
            .pipe(parser)
            .on('error', error => console.error(error))
            .on('data', (orderObj) => {
                this.allOrdersData.push(orderObj);
                rowCount++
            })
            .on('end', (rows) => {
                console.log(`done, parsed ${rows} rows`);
                this.analyzeAllOrders();
                win.send('orders:upload',  this.getStateForHome());
            });

    }
    loadDataWS(filepath, win) {
        if (!filepath) return;
        filepath = filepath[0];
        this.dataWSFilepath = filepath;
        this.showDataCard = true;
        let rowsCount = 0;
        csv.
            fromPath(filepath, { delimiter: "|" })
            .on("data", function (data) {
                if (data[9] == 'NCR') rowsCount++;
            })
            .on("end", () => {
                console.log(`done. found ${rowsCount} NCR's`);
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
        console.log(`Результат аналізу: Заявок всього: ${this.allOrdersCount} Закритих заявок: ${this.closedOrdersCount}`)
    }
}
