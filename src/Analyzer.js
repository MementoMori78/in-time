import xl from 'xlsx'
import csv from 'fast-csv'
import fs from 'fs'
import { delimiter } from 'path';

export default class Analyzer {
    constructor(){
        this.orderWS;
        this.dataWS;
        this.orderWSFilepath;
        this.dataWSFilepath;
    }
    loadOrderWS () {
        csv. 
        fromPath('C:/dev/data/static data.csv', {delimiter: "|"})
        .on("data", function(data){
            if(data[9] == 'NCR') console.log(data);
        })
        .on("end", function(){
            console.log("done");
        });
    }
}
