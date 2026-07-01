const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  exportPDF: (html) => ipcRenderer.invoke('export-pdf', html),
  onMenuExportPDF: (callback) => {
    ipcRenderer.on('menu-export-pdf', () => callback())
  },
})
