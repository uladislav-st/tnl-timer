const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nixDesktop', {
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('window:set-always-on-top', enabled),
  setCompact: (enabled) => ipcRenderer.invoke('window:set-compact', enabled),
  notify: (title, body) => ipcRenderer.invoke('notify', { title, body })
});
