// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let subWindow   //アカウント追加モーダルウィンドウ
let konoAppWindow

let consumer_key = ""
let consumer_secret = ""

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: __dirname + '/images/icon.png',
        webPreferences: {
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('./src/index.html')

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    createMenu()

    //モーダルウィンドウ表示
    ipcMain.on('message', (event, arg) => {
        if (arg == "add_account_show") {
            showModalWindow();
        }
        if (arg == "add_account_close") {
            subWindow.close();
        }
        if (arg == "twitter_oauth") {
            twitterOAuth()
        }
    })

    //コンシューマーキー
    ipcMain.on('consumer_key', (event, arg) => {
        consumer_key = arg
    })
    ipcMain.on('consumer_secret', (event, arg) => {
        consumer_secret = arg
    })



}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


//メニュー作成？
function createMenu() {
    //まずメニュー全消しする
    Menu.setApplicationMenu(null)
    const menuArray = Menu.buildFromTemplate([
        {
            label: "ヘルプ",
            submenu: [
                {
                    label: "このアプリについて",    //名前
                    click() {
                        showKonoApp()
                    }
                }
            ]
        }
    ])
    //トップ画面にのみメニュー表示
    mainWindow.setMenu(menuArray)
}

//このアプリについて
function showKonoApp() {
    konoAppWindow = new BrowserWindow({
        width: 600,
        height: 400,
        icon: __dirname + '/images/large_icon.png',
        webPreferences: {
            nodeIntegration: true
        }
    })
    //subWindow.webContents.openDevTools()
    konoAppWindow.loadURL(`file://${__dirname}/konoapp.html`)
    konoAppWindow.on('closed', function () {
        konoAppWindow = null
    })
}

//モーダルウィンドウ
function showModalWindow() {
    subWindow = new BrowserWindow({
        width: 400,
        height: 300,
        icon: __dirname + '/images/large_icon.png',
        parent: mainWindow,     //親ウィンドウのBrowserWindowオブジェクト
        webPreferences: {
            nodeIntegration: true
        }
    })
    //subWindow.webContents.openDevTools()
    subWindow.loadURL(`file://${__dirname}/add_account.html`)
    subWindow.on('closed', function () {
        subWindow = null
    })
}


function twitterOAuth() {
    //コンシューマーキーとかは別ファイルに
    //構造とかはたぶんどっかに書いてあります。
    var consumer = require('./js/consumer_key.js')

    const dialog = require('electron').dialog;

    const OauthTwitter = require('electron-oauth-twitter');

    const window = require('electron').BrowserWindow;

    const loginWindow = window.getFocusedWindow()

    let twitter = new OauthTwitter({
        key: consumer_key,
        secret: consumer_secret,
    });


    //loginWindow.webContents.send('token', 'hello World')

    twitter.startRequest()
        .then((result) => {
            //それぞれ
            const token = result.oauth_access_token
            const token_secret = result.oauth_access_token_secret

            loginWindow.webContents.send('token', `{"token":"${token}","token_secret":"${token_secret}"}`)

        }).catch((error) => {
            console.error(error, error.stack);
        });
}