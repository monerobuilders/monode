const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
    homedir = app.getPath('home');
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(homedir, './.monode/config.json');
    if (!fs.existsSync(configPath)) {
        if (fs.existsSync(path.join(homedir, './.monode/'))) {
            fs.rmSync(path.join(homedir, './.monode'), { recursive: true });
        }
        const mainWindow = new BrowserWindow({
            width: 1000, // 500
            height: 800, // 250
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            resizable: false,
            icon: 'assets/favicon.png',
        });
        mainWindow.setMenu(null);
        mainWindow.webContents.openDevTools();
        mainWindow.loadFile('src/wait.html');
    } else {
        const mainWindow = new BrowserWindow({
            width: 400,
            height: 400,
            webPreferences: {
                nodeIntegration: true,
            },
            resizable: false,
            icon: 'assets/favicon.png',
        });
        mainWindow.setMenu(null);
        mainWindow.loadFile('src/index.html');   
    }
});