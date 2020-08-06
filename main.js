const {
	app,
	BrowserWindow,
	globalShortcut,
	screen,
	Tray,
	Menu,
} = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow
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
}

// Init app
app.on('ready', () => {
	createMainWindow()
	initTray()
	registerGlobalShortcuts()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (mainWindow === null) createMainWindow()
})

function initTray() {
	let tray = new Tray(path.join(__dirname, 'src', 'img', 'icon.ico'))
	tray.on('click', onTrayClick)

	const { menu, tooltip } = getTrayOptions()
	tray.setContextMenu(menu)
	tray.setToolTip(tooltip)
}

function onTrayClick(event, iconBounds, position) {
	const [width, height] = mainWindow.getSize()
	mainWindow.setPosition(position.x - width, position.y - height - 30)

	mainWindow.show()
}

function getTrayOptions() {
	return {
		menu: Menu.buildFromTemplate([
			{
				label: 'Show',
				click: () => {
					mainWindow.show()
				},
			},
			{
				label: 'Quit',
				click: () => {
					app.quit()
				},
			},
		]),
		tooltip: 'Quickpaste - A GUI for saving the common things you type',
	}
}

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
