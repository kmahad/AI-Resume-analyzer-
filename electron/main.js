const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    title: "AI Resume Analyzer + Job Matcher",
    backgroundColor: "#05070f",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // Preload script if needed
    }
  });

  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);

  // In development, load from Vite dev server.
  // In production (or fallback), load the built index.html.
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in dev mode if requested
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create preload.js to avoid electron warnings even if empty
const fs = require('fs');
const preloadPath = path.join(__dirname, 'preload.js');
if (!fs.existsSync(preloadPath)) {
  fs.writeFileSync(preloadPath, '// Preload script content\n');
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
