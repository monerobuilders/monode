const { app, BrowserWindow, Tray, Menu } = require('electron');
const { ipcMain } = require('electron');

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
}

app.whenReady().then(() => {
    ipcMain.on("finished-initailization", (event, arg) => {
        tray = new Tray('./assets/favicon.png');
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Show', click: () => { showMain(); } },
            { label: 'Quit', click: () => { app.quit(); } },
        ]);
        tray.setContextMenu(contextMenu);
        showMain();
    });
    homedir = app.getPath('home');
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
        showMain();
    }
});