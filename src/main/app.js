const {app, BrowserWindow, Menu} = require('electron')
const path = require('path')
const url = require('url')

let win

process.env.PATH = `${process.env.PATH}:/usr/local/bin`

const menu = Menu.buildFromTemplate(require('./app-menu'))

function createWindow () {
  Menu.setApplicationMenu(menu)

  win = new BrowserWindow({width: 650, height: 450})

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../../public/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (process.env.REACT_DEBUG) {
    BrowserWindow.addDevToolsExtension(process.env.REACT_DEBUG)
    win.webContents.openDevTools()
  }

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
