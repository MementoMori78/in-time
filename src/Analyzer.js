import xl from 'xlsx'
import csv from 'fast-csv'
import fs from 'fs'
import { delimiter } from 'path';

export default class Analyzer {
    constructor(){
        this.orderWS;
        this.dataWS;
        this.ordersWSFilepath = '';
        this.dataWSFilepath = '';
        this.showDataCard = false;
        this.showOrdersCard = false;
    }
    getStateForHome() {
        return {
            showDataCard: this.showDataCard,
            showOrdersCard: this.showOrdersCard,
            dataCardName: 'Статичні дані',
            ordersCardName: 'Дані заявок',
            dataCardPath: this.dataWSFilepath,
            ordersCardPath: this.ordersWSFilepath
        }
    }
    loadOrdersWS (filepath) {
        if(!filepath) return;
        filepath = filepath[0];
        this.ordersWSFilepath = filepath;
        this.showOrdersCard = true;
        csv. 
            fromPath(filepath, {delimiter: "|"})
                .on("data", function(data){
                    console.log(data);
                })
                .on("end", function(){
                    console.log("done");
                });
    }
    
    loadDataWS (filepath) {
        if(!filepath) return;
        filepath = filepath[0];
        this.dataWSFilepath = filepath;
        this.showDataCard = true;
        csv. 
            fromPath(filepath, {delimiter: "|"})
                .on("data", function(data){
                    if(data[9] ==  'NCR') console.log(data);
                })
                .on("end", function(){
                    console.log("done");
                });
    }
}
