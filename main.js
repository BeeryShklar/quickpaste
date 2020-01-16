// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  globalShortcut,
  screen,
  Tray,
  Menu
} = require("electron");
const path = require("path");
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 250,
    height: 350,
    resizable: false,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true
    },
    icon: "./src/icon.png",
    alwaysOnTop: true,
    skipTaskbar: true
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
tray = null;
app.on("ready", () => {
  createWindow();
  // sets the tray icon
  tray = new Tray(path.join(__dirname, "/src/icon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setToolTip("quickpaste");
  tray.setContextMenu(contextMenu);

  // when clicking Alt + ` show the window
  globalShortcut.register("Alt+`", () => {
    const winSize = mainWindow.getSize();

    if (!mainWindow.isVisible()) {
      mainWindow.show();
    } else {
      mainWindow.hide();
    }
    setWindowPosition(winSize[0], winSize[1]);
  });
});

// set the position of the window near the moouse
function setWindowPosition(height, width) {
  const mousePos = screen.getCursorScreenPoint();
  const screenSize = screen.getPrimaryDisplay().size;
  // set position to mouse pos
  let position = [mousePos.x, mousePos.y];

  //if the window will be to close to the end of the screen pos = mousePos - winWidth
  if (mousePos.x + width >= screenSize.width) {
    position[0] = mousePos.x - width;
  }
  //if the window will be to close to the end of the screen pos = mousePos - winHeight
  if (mousePos.y + height >= parseInt(screenSize.height - height / 2)) {
    position[1] = mousePos.y - height - parseInt(height / 2);
  }
  // sets the position of the window
  mainWindow.setPosition(position[0], position[1]);
}

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
