const { app, BrowserWindow, ipcMain, Notification, net } = require('electron');
const path = require('path');

let mainWindow;

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
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

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
