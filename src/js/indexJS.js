//アカウント設定読み込み
function setAccountWindow() {
    const electron = require('electron')
    const BrowserWindow = electron.remote.BrowserWindow

    const childWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    childWindow.loadFile("./src/account_setting.html")

    //閉じたとき
    childWindow.on('closed', function () {
        childWindow = null
    })

}

function addAccountWindow() {
    //IPC通信？でmain.jsへじゃんぷ
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('message', 'add_account_show')
}

//Window読み込み時
window.onload = function () {
    //読み込む
    loadAccountList()
    //アカウント追加後更新するIPC通信を受け取る
    const ipcMain = require("electron").remote.ipcMain;
    ipcMain.on("loadAccount", (event, body) => {
        document.getElementById('account_list').innerHTML = ``
        loadAccountList()
    })
}

function loadAccountList() {
    //アカウントリスト取得
    let accountArray = new Array()
    let accountNameArray = new Array()
    if (localStorage.getItem('account_list') != null) {
        //読み込む
        const accountList = localStorage.getItem('account_list')
        let jsonArray = JSON.parse(accountList)
        //配列に保存
        for (var i = 0; i < jsonArray.length; i++) {
            accountArray.push(jsonArray[i])
        }
    }
    if (localStorage.getItem('account_name_list') != null) {
        //読み込む
        const accountList = localStorage.getItem('account_name_list')
        let jsonArray = JSON.parse(accountList)
        //配列に保存
        for (var i = 0; i < jsonArray.length; i++) {
            accountNameArray.push(jsonArray[i])
        }
    }
    //Card追加
    for (var i = 0; i < accountNameArray.length; i++) {
        const account = accountArray[i]
        const name = accountNameArray[i]
        addAccountCard(name, account)
    }
}

//アカウント一覧
function addAccountCard(name, account) {
    const html = `
    
    <div class="col s12 m6">
            <div class="card light-blue lighten-1">
                <div class="card-content white-text">
                    <span class="card-title">${name}</span>
                    <p></p>
                </div>
                <div class="card-action">
                    <a href="#" onclick="deleteAccount(${account})">削除</a>
                </div>
            </div>
        </div>


    `

    document.getElementById('account_list').innerHTML = document.getElementById('account_list').innerHTML + html
}

//削除
function deleteAccount(id) {
    //アカウントリスト取得
    let accountArray = new Array()
    let accountNameArray = new Array()
    if (localStorage.getItem('account_list') != null) {
        //読み込む
        const accountList = localStorage.getItem('account_list')
        let jsonArray = JSON.parse(accountList)
        //配列に保存
        for (var i = 0; i < jsonArray.length; i++) {
            accountArray.push(jsonArray[i])
        }
    }
    if (localStorage.getItem('account_name_list') != null) {
        //読み込む
        const accountList = localStorage.getItem('account_name_list')
        let jsonArray = JSON.parse(accountList)
        //配列に保存
        for (var i = 0; i < jsonArray.length; i++) {
            accountNameArray.push(jsonArray[i])
        }
    }
    //削除
    const index = accountArray.indexOf(id)
    accountArray.splice(index, 1)
    accountNameArray.splice(index, 1)
    //保存
    localStorage.setItem('account_list', JSON.stringify(accountArray))
    localStorage.setItem('account_name_list', JSON.stringify(accountNameArray))
    //Toast
    M.toast({ html: '削除しました' })
    //さいよみこみ
    document.getElementById('account_list').innerHTML = ""
    loadAccountList()

}

function filterStream() {
    const twitter = require('twitter')
    const dialog = require('electron').remote.dialog
    const { shell } = require('electron');
    //アカウントリスト取得
    let accountArray = new Array()
    if (localStorage.getItem('account_list') != null) {
        //読み込む
        const accountList = localStorage.getItem('account_list')
        let jsonArray = JSON.parse(accountList)
        //配列に保存
        for (var i = 0; i < jsonArray.length; i++) {
            accountArray.push(jsonArray[i])
        }
    }

    //Twitter準備
    //TwitterAPI叩く
    var client = new twitter({
        consumer_key: localStorage.getItem('consumer_key'),
        consumer_secret: localStorage.getItem('consumer_secret'),
        access_token_key: localStorage.getItem('accesstoken_key'),
        access_token_secret: localStorage.getItem('accesstoken_secret')
    })
    //アカウントをカンマ区切り
    let account = ""
    for (var i = 0; i < accountArray.length; i++) {
        if (i == 0) {
            account = account + accountArray[i]
        } else {
            account = account + "," + accountArray[i]
        }
    }

    //接続
    var options = {
        type: 'info',
        title: 'リアルタイム更新',
        message: 'FliterStreamへ接続します。',
    }
    dialog.showMessageBox(null, options)

    //FilterStream接続
    var stream = client.stream('statuses/filter', { follow: account });
    stream.on('data', function (event) {
        const tweet = event.text
        const id = event.user.id_str
        console.log(tweet)
        console.log(id)
        //ユーザーが本人なら
        if (accountArray.indexOf(id) != -1) {
            console.log('本人ですん')
            if (tweet.match("lv")) {
                //正規表現
                const nicoLiveRegex = "(lv)([0-9]+)"
                const liveId = tweet.match(nicoLiveRegex)[0]
                console.log(liveId)
                //Web開く
                shell.openExternal("https://live2.nicovideo.jp/watch/" + liveId)

                //通知出す
                new Notification("ニコ生アラート（青鳥）- 番組へ移動します。", {
                    body: tweet
                })

                //Card追加
                addNotification(tweet)
            }
        }
    });

    stream.on('error', function (error) {
        //Toast
        console.log(error)
        dialog.showErrorBox('問題が発生しました。', "FilterStream接続時に問題が発生しました。")
    });
}

function addNotification(title) {
    const html = `
    
       <div class="col s12 m6">
            <div class="card light-blue lighten-1">
                <div class="card-content white-text">
                    <span class="card-title">${title}</span>
                    <p></p>
                </div>
            </div>
        </div>

    
    `
    document.getElementById('notification_list').innerHTML = `${html}${document.getElementById('notification_list').innerHTML}`
}
