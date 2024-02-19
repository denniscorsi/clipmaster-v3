import { join } from 'node:path';
import {
  app,
  BrowserWindow,
  clipboard,
  ipcMain,
  globalShortcut,
  Notification,
} from 'electron';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minWidth: 300,
    minHeight: 400,
    maxHeight: 900,
    maxWidth: 500,
    maximizable: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  mainWindow.webContents.openDevTools({ mode: 'detach' });

  return mainWindow;
};

app.on('ready', () => {
  const mainWindow = createWindow();
  globalShortcut.register('CommandOrControl+Option+Shift+C', () => {
    app.focus();
    mainWindow.show();
    mainWindow.focus();
  });
  globalShortcut.register('CommandOrControl+Option+Shift+X', () => {
    let content = clipboard.readText();
    content = content.toUpperCase();
    new Notification({
      title: 'Capitalized Clipboard',
      subtitle: 'Copied to clipboard',
      body: content,
    }).show();
  });
});

app.on('quit', globalShortcut.unregisterAll);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('write-to-clipboard', (_, content: string) => {
  clipboard.writeText(content);
});

ipcMain.handle('read-from-clipboard', (event) => {
  const content = clipboard.readText();
  return content;
});
