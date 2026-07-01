const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: '简历编辑器',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Build app menu (remove default menu items like File/Edit)
  const menu = Menu.buildFromTemplate([
    {
      label: '文件',
      submenu: [
        { label: '导出 PDF', accelerator: 'CmdOrCtrl+Shift+P', click: () => mainWindow?.webContents.send('menu-export-pdf') },
        { type: 'separator' },
        { role: 'quit', label: '退出' },
      ],
    },
    { label: '编辑', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }] },
    { label: '视图', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' }] },
  ])
  Menu.setApplicationMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // IPC: Export PDF from rendered HTML
  ipcMain.handle('export-pdf', async (event, html) => {
    const win = new BrowserWindow({
      width: 800, height: 600, show: false,
      webPreferences: { contextIsolation: true, nodeIntegration: false },
    })
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    const pdf = await win.webContents.printToPDF({
      printBackground: true,
      printSelectionOnly: false,
      landscape: false,
      pageSize: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    })
    win.close()

    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: '导出 PDF',
      defaultPath: '简历.pdf',
      filters: [{ name: 'PDF 文件', extensions: ['pdf'] }],
    })
    if (!canceled && filePath) {
      fs.writeFileSync(filePath, pdf)
      return true
    }
    return false
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
