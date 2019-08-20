//OAuth
const dialog = require('electron').remote.dialog;
const ipcRenderer = require("electron").ipcRenderer;
const twitter = require('twitter')

function twitterOauth() {
    //IPC通信でメインプロセスへ
    localStorage.setItem('consumer_key', document.getElementById('consumer_key').value)
    localStorage.setItem('consumer_secret', document.getElementById('consumer_secret').value)
    //IPC通信？でmain.jsへじゃんぷ
    ipcRenderer.send('consumer_key', document.getElementById('consumer_key').value)
    ipcRenderer.send('consumer_secret', document.getElementById('consumer_secret').value)
    ipcRenderer.send('message', 'twitter_oauth')
    //受信
    ipcRenderer.on('token', (event, arg) => {

        const json = JSON.parse(arg)
        localStorage.setItem('accesstoken_key', json.token)
        localStorage.setItem('accesstoken_secret', json.token_secret)

        //APIてすと
        var client = new twitter({
            consumer_key: localStorage.getItem('consumer_key'),
            consumer_secret: localStorage.getItem('consumer_secret'),
            access_token_key: localStorage.getItem('accesstoken_key'),
            access_token_secret: localStorage.getItem('accesstoken_secret')
        })
        client.get("account/verify_credentials", function (error, tweets, response) {
            if (error) {
                //エラー
                dialog.showErrorBox('API取得エラー', 'API取得で問題が発生しました。');
            } else {
                const display_name = tweets.name
                //ダイアログ
                var options = {
                    type: 'info',
                    title: 'アカウント認証に成功しました。',
                    message: display_name,
                }
                dialog.showMessageBox(null, options)
                closeWindow()
            }
        })
    })
}

function closeWindow() {
    const window = require('electron').remote.BrowserWindow;
    const loginWindow = window.getFocusedWindow()
    loginWindow.close()
}
