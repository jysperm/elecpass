const {app, shell} = require('electron')

module.exports = [
  {
    label: app.getName(),
    submenu: [
      {
        label: 'About',
        click() { shell.openExternal('https://github.com/jysperm/elecpass') }
      },
      {role: 'quit'}
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'delete'},
      {role: 'selectall'},
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'toggledevtools'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'GitHub homepage',
        click() { shell.openExternal('https://github.com/jysperm/elecpass') }
      }
    ]
  }
]
