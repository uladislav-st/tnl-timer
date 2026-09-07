const { app, BrowserWindow, ipcMain, Notification, net, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;
let updateCheckTimer;
let updaterStatus = { state: 'idle' };

const RELEASES_URL = 'https://github.com/uladislav-st/tnl-timer/releases/latest';
const isPortable = Boolean(process.env.PORTABLE_EXECUTABLE_FILE);

function sendUpdaterStatus(status) {
  updaterStatus = { ...status, version: app.getVersion(), portable: isPortable };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:status', updaterStatus);
  }
}

function configureAutoUpdater() {
  if (!app.isPackaged || isPortable) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;

  autoUpdater.on('checking-for-update', () => sendUpdaterStatus({ state: 'checking' }));
  autoUpdater.on('update-available', (info) => {
    sendUpdaterStatus({ state: 'available', newVersion: info.version });
  });
  autoUpdater.on('update-not-available', () => sendUpdaterStatus({ state: 'current' }));
  autoUpdater.on('download-progress', (progress) => {
    sendUpdaterStatus({ state: 'downloading', percent: Math.round(progress.percent) });
  });
  autoUpdater.on('update-downloaded', (info) => {
    sendUpdaterStatus({ state: 'downloaded', newVersion: info.version });
  });
  autoUpdater.on('error', (error) => {
    console.error('Auto-update error:', error);
    sendUpdaterStatus({ state: 'error' });
  });
}

async function checkForUpdates() {
  if (!app.isPackaged) {
    sendUpdaterStatus({ state: 'development' });
    return { ok: false, reason: 'development' };
  }
  if (isPortable) {
    sendUpdaterStatus({ state: 'portable' });
    return { ok: false, reason: 'portable' };
  }

  try {
    await autoUpdater.checkForUpdates();
    return { ok: true };
  } catch (error) {
    console.error('Update check failed:', error);
    sendUpdaterStatus({ state: 'error' });
    return { ok: false, reason: 'error' };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 760,
    minHeight: 560,
    backgroundColor: '#080b12',
    title: 'Nix Tracker',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.webContents.once('did-finish-load', () => {
    sendUpdaterStatus(app.isPackaged
      ? { state: isPortable ? 'portable' : 'idle' }
      : { state: 'development' });
    updateCheckTimer = setTimeout(checkForUpdates, 3000);
  });
}

app.whenReady().then(() => {
  configureAutoUpdater();
  createWindow();
  setInterval(checkForUpdates, 6 * 60 * 60 * 1000);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  clearTimeout(updateCheckTimer);
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('app:get-info', () => ({
  version: app.getVersion(),
  packaged: app.isPackaged,
  portable: isPortable,
  updaterStatus
}));

ipcMain.handle('updater:check', () => checkForUpdates());

ipcMain.handle('updater:install', () => {
  if (updaterStatus.state !== 'downloaded') return false;
  setImmediate(() => autoUpdater.quitAndInstall(false, true));
  return true;
});

ipcMain.handle('updater:open-releases', () => shell.openExternal(RELEASES_URL));

ipcMain.handle('window:set-always-on-top', (_event, enabled) => {
  if (!mainWindow) return false;
  mainWindow.setAlwaysOnTop(Boolean(enabled), 'floating');
  return mainWindow.isAlwaysOnTop();
});

ipcMain.handle('window:set-compact', (_event, enabled) => {
  if (!mainWindow) return;
  if (enabled) {
    mainWindow.setMinimumSize(390, 420);
    mainWindow.setSize(440, 740, true);
  } else {
    mainWindow.setMinimumSize(760, 560);
    mainWindow.setSize(1120, 760, true);
  }
});

ipcMain.handle('notify', (_event, { title, body }) => {
  if (!Notification.isSupported()) return false;
  new Notification({ title, body, silent: false }).show();
  return true;
});

ipcMain.handle('schedule:fetch-amazon', async () => {
  try {
    const response = await net.fetch('https://thronewatch.app/schedule.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (text.length > 1_000_000) throw new Error('Schedule response is too large');
    const data = JSON.parse(text);
    if (!data?.rotationSchedule?.tiers?.t4?.days) throw new Error('Invalid T4 schedule');
    return { ok: true, data, syncedAt: Date.now() };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});
