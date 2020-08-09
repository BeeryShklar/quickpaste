const {
	app,
	BrowserWindow,
	globalShortcut,
	screen,
	Tray,
	Menu,
	ipcMain,
	MenuItem,
	clipboard,
} = require('electron')
const path = require('path')
const fs = require('fs')
const { uniqueUuid, store } = require('./src/js/helpers.js')

let mainWindow
let tray
let ctxMenu

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 250,
		height: 350,
		resizable: true,
		frame: false,
		show: false,
		webPreferences: {
			nodeIntegration: true,
		},
		icon: './src/img/icon.png',
		alwaysOnTop: true,
		skipTaskbar: true,
	})
	mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'))

	mainWindow.on('closed', () => {
		mainWindow = null
		app.quit()
	})

	mainWindow.on('blur', () => {
		mainWindow.hide()
	})
}

// Init app
app.on('ready', () => {
	createMainWindow()
	initTray()
	initCtxMenu()
	registerGlobalShortcuts()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (mainWindow === null) createMainWindow()
})

function quitApp() {
	app.quit()
}

function initTray() {
	tray = new Tray(path.join(__dirname, 'src', 'img', 'icon.ico'))
	tray.on('click', onTrayClick)

	const { menu, tooltip } = generateTrayOptions()
	tray.setContextMenu(menu)
	tray.setToolTip(tooltip)
}

function onTrayClick(event, iconBounds, position) {
	const [width, height] = mainWindow.getSize()
	mainWindow.setPosition(position.x - width, position.y - height - 30)

	mainWindow.show()
}

function generateTrayOptions() {
	return {
		menu: Menu.buildFromTemplate([
			{
				label: 'Import Old Items',
				click: importOldItems,
			},
			{
				label: 'Show',
				click: () => {
					mainWindow.show()
				},
			},
			{
				label: 'Quit',
				click: quitApp,
			},
		]),
		tooltip: 'Quickpaste - A GUI for saving the common things you type',
	}
}

function initCtxMenu() {
	ctxMenu = new Menu.buildFromTemplate([
		{
			label: 'Hide Window',
			click: () => {
				mainWindow.hide()
			},
		},
		{
			label: 'Quit',
			click: quitApp,
		},
	])
}

ipcMain.on('ctxmenu:show', (event, msg) => {
	if (msg.ID) {
		const separator = new MenuItem({
			type: 'separator',
		})
		const menuItem = new MenuItem({
			label: 'Delete Item',
			click: () => {
				event.reply('delete-item', msg.ID)
				initCtxMenu()
			},
		})
		ctxMenu.insert(0, separator)
		ctxMenu.insert(0, menuItem)
	}
	ctxMenu.popup()
	initCtxMenu()
})

ipcMain.on('copy-and-hide', (event, text) => {
	clipboard.writeText(text)
	mainWindow.hide()
})

// Setup Global Shortcuts
function registerGlobalShortcuts() {
	globalShortcut.register('Alt+`', () => {
		if (mainWindow.isVisible()) {
			mainWindow.hide()
		} else {
			const mousePos = screen.getCursorScreenPoint()
			const display = getNearestDisplay(mousePos)
			moveMainWindowToPos(display, mousePos.x, mousePos.y)
			mainWindow.show()
		}
	})
}

// set the position of the window near the mouse
function moveMainWindowToPos(display, x, y) {
	const screenSize = display.workAreaSize
	const [width, height] = mainWindow.getSize()
	const newPosition = {
		x: x + width >= screenSize.width ? x - width : x,
		y: y + height >= screenSize.height ? y - height : y,
	}
	mainWindow.setPosition(newPosition.x, newPosition.y)
}

function getNearestDisplay(point) {
	return screen.getDisplayNearestPoint(point)
}

let replyToReload
ipcMain.on('ready-to-reload', event => (replyToReload = event.reply))

// Import all the items from the previous version
function importOldItems() {
	const oldItems = store.get('texts')
	oldItems.forEach(item => {
		store.set('items.' + uniqueUuid(), item)
		replyToReload('reload-items')
	})
}
