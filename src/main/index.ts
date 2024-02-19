import { join } from 'node:path';
import {
  app,
  BrowserWindow,
  clipboard,
  ipcMain,
  globalShortcut,
  Notification,
  Tray,
  Menu,
} from 'electron';
import Positioner from 'electron-positioner';

let tray: Tray | null = null;

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
    show: false,
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

  // mainWindow.webContents.openDevTools({ mode: 'detach' });

  return mainWindow;
};

app.on('ready', () => {
  const mainWindow = createWindow();
  tray = new Tray('./src/icons/trayTemplate.png');

  const positioner = new Positioner(mainWindow);

  tray.on('click', () => {
    if (!tray) return;
    if (mainWindow.isVisible()) {
      return mainWindow.hide();
    }

    const trayPosition = positioner.calculate('trayCenter', tray.getBounds());
    mainWindow.setPosition(trayPosition.x, trayPosition.y, false);

    mainWindow.show();
  });

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

  // const contextMenu = Menu.buildFromTemplate([
  //   {
  //     label: 'Show Window',
  //     click: () => {
  //       mainWindow.show();
  //       mainWindow.focus();
  //     },
  //   },
  //   {
  //     label: 'Quit',
  //     role: 'quit',
  //   },
  // ]);

  // tray = new Tray('./src/icons/trayTemplate.png');
  // tray.setContextMenu(contextMenu);
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
