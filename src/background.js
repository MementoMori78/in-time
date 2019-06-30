'use strict'

import { app, protocol, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
import fs from 'fs'
import Analyzer from './Analyzer'
import { ECONNRESET } from 'constants';
import moment from 'moment';
import xl from 'xlsx'
import path from 'path'
import iconv from 'iconv-lite'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', secure: true }])

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    icon: path.join(__static, 'icon.png'),
    width: 910, height: 1050, webPreferences: {
      nodeIntegration: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) { }
    //win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    win.setMenu(null)
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  //Menu.setApplicationMenu(null); // delete functional menu on the top 
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

let an = new Analyzer()


let menuTemplate = [
  {
    label: 'File',
    submenu: [

    ]
  }
];


ipcMain.on('home:mounted', (event, data) => {
  event.sender.send('home:mounted', an.getStateForHome())
})

ipcMain.on('orders:upload', (event, data) => {
  let options = {
    filters: [{
      title: 'Завантаження файлу із даними заявок Printec',
      name: 'Файл з даними заявок Printec, згенерований Управлінням у кодуванні UTF-8',
      extensions: ['csv']
    }]
  };
  let filepath = dialog.showOpenDialog(options);
  
  an.loadOrdersData(filepath, win);
  //event.sender.send('orders:upload', an.getStateForHome());
})

ipcMain.on('data:upload', (event, data) => {
  let options = {
    filters: [{
      title: 'Завантаження файлу зі статичними даними',
      name: 'Файл зі статичними даними, згенерований Управлінням у кодуванні UTF-8',
      extensions: ['csv']
    }]
};
  let filepath = dialog.showOpenDialog(options);
  
  an.loadStaticData(filepath, win);
})

ipcMain.on('state:reload', (event, data) => {
  //console.log('reload state')
  event.sender.send('state:reload', an.getStateForHome())
})


ipcMain.on('stats:get', (event, data) => {
  let freeDates = [];
  let workingSaturdays = [];
  //creating moment object for each selected date in free dates datepicker
  data.dates.forEach(date => {
    let newDate = moment(date).add(3, 'h');
    freeDates.push(newDate)
  });
  //creating moment object for each selected date in working saturdays datepicker
  data.workingSaturdays.forEach(date => {
    let newDate = moment(date).add(3, 'h');
    workingSaturdays.push(newDate)
  });

  an.createReport(freeDates, workingSaturdays, data.fiveFLMswitch);

  var wb = xl.utils.book_new();
  let ws = xl.utils.json_to_sheet(an.arrForXLS);
  xl.utils.book_append_sheet(wb, ws, "Статистика заявок");
  let options = {
    title: 'Збереження файлу статистики виконнання заявок',
    defaultPath: 'C:\\',
    buttonLabel: 'Зберегти файл статистики',
    filters: [{
      name: 'Файл таблиці',
      extensions: ['xlsx']
    }]
  };
  let filepath = dialog.showSaveDialog(options)
  if(!filepath) return;
  xl.writeFile(wb, filepath);
})

function createWin1251(filepath){
  let str = fs.readFileSync(filepath, 'UTF-8');
  let buf = iconv.encode(str, "cp1251");
  let stream = fs.createWriteStream(`${filepath}.win1251`);
  stream.write(buf);
  stream.end();
}