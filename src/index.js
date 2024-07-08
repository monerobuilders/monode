const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
        nodeIntegration: true,
        },
        resizable: false,
    });
    
    mainWindow.loadFile('src/index.html');
});