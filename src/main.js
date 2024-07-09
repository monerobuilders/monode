const { app, BrowserWindow, Tray, Menu } = require('electron');
const { ipcMain } = require('electron');
const AutoLaunch = require('auto-launch');
const { homedir } = require('os');

function showMain() {
    const mainWindow = new BrowserWindow({
        width: 600,
        height: 460,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
        icon: 'assets/favicon.png',
    });
    mainWindow.setMenu(null);
    // mainWindow.webContents.openDevTools();
    mainWindow.loadFile('src/pages/index/index.html');
    mainWindow.on('close', function (event) {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
}

function showTray() {
    tray = new Tray('./assets/favicon.png');
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show', click: () => { showMain(); } },
        { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
    ]);
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
    ipcMain.on("finished-initailization", (event, arg) => {
        showTray();
        showMain();
    });
    ipcMain.handle("setup-auto-launch", async (event, arg) => {
        let exePath = app.getPath('exe');
        fs.copyFileSync(exePath, path.join(homedir, './.monode/monode_monero/monode.exe'));
        let autoLaunch = new AutoLaunch({
            name: 'Monode',
            path: path.join(homedir, './.monode/monode_monero/monode.exe'),
        })
        autoLaunch.enable();
        return;
    });
    const homedir = app.getPath('home');
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(homedir, './.monode/config.json');
    if (!fs.existsSync(configPath)) {
        if (fs.existsSync(path.join(homedir, './.monode/'))) {
            fs.rmSync(path.join(homedir, './.monode'), { recursive: true });
        }
        const mainWindow = new BrowserWindow({
            width: 500, // 500
            height: 320, // 250
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            resizable: false,
            icon: 'assets/favicon.png',
        });
        mainWindow.setMenu(null);
        // mainWindow.webContents.openDevTools();
        mainWindow.loadFile('src/pages/wait/wait.html');
    } else {
        showTray();
        if (!(app.getPath('exe') == homedir + '/.monode/monode_monero/monode.exe')) {
            showMain();
        }
    }
});