const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nixDesktop', {
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('window:set-always-on-top', enabled),
  setCompact: (enabled) => ipcRenderer.invoke('window:set-compact', enabled),
  notify: (title, body) => ipcRenderer.invoke('notify', { title, body }),
  fetchAmazonSchedule: () => ipcRenderer.invoke('schedule:fetch-amazon'),
  getAppInfo: () => ipcRenderer.invoke('app:get-info'),
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  openReleases: () => ipcRenderer.invoke('updater:open-releases'),
  onUpdaterStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on('updater:status', listener);
    return () => ipcRenderer.removeListener('updater:status', listener);
  }
});
