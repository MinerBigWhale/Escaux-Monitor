const { app, BrowserWindow, ipcMain } = require("electron");
const { XMLParser } = require('fast-xml-parser');
const path = require("path");
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, site, queue;

String.prototype.xml2json = function () {
    const parser = new XMLParser();
	return parser.parse(this);
};

async function createWindow() {

  // Create the browser window.
  win = new BrowserWindow({
    width: 900,
    height: 600,
	icon: __dirname + '/scripts/foldercharts.ico',
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    }
  });

  // Load app
  win.loadFile(path.join(__dirname, "index.html"));

  //win.webContents.openDevTools(); // Open the DevTools (optional)
  
  win.on('closed', () => {
    win = null
  })
}

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

app.on("ready", createWindow);

// Listen for the request from the renderer process
ipcMain.handle('GetQueues', async () => {
  console.log(' -> GetQueues http://'+site+'/xml/dbGetQueueInfo.php');
  return await fetch('http://'+site+'/xml/dbGetQueueInfo.php')
    .then(response => response.text())
    .then(data => {
      // Send the retrieved data back to the renderer process
      return { Queues : data.xml2json().Queues.Queue};
    })
    .catch(error => {
      console.error('Error:', error);
    });
});
ipcMain.handle('SetQueue', (event, data) => {
  console.log(' <- SetQueue ' + data);
	queue = data;
	return;
});

ipcMain.handle('GetQueueMembers', async () => {
  console.log(' -> GetQueueMembers http://'+site+'/xml/ccGetQueueMembers.php?queue='+queue);
  return await fetch('http://'+site+'/xml/ccGetQueueMembers.php?queue='+queue)
    .then(response => response.text())
    .then(data => {
      // Send the retrieved data back to the renderer process
	  var result = data.xml2json().Members.Member;
	  if (!Array.isArray(result)) { result = new Array(result) }
      return { Members : result};
    })
    .catch(error => {
      console.error('Error:', error);
    });
});
ipcMain.handle('GetQueuecalls', async () => {
  console.log(' -> GetQueuecalls http://'+site+'/xml/ccGetQueueStatus.php?queue='+queue);
  return await fetch('http://'+site+'/xml/ccGetQueueStatus.php?queue='+queue)
    .then(response => response.text())
    .then(data => {
      // Send the retrieved data back to the renderer process
      return { Name : data.xml2json().Queues.Queue.Name, Calls : data.xml2json().Queues.Queue.Calls};
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

ipcMain.handle('GetSites', () => {
  console.log(' -> GetSites');
    return { Sites : [
		{Name : "BL / JB", Value : '100.65.39.2'},
		{Name : "EI / ML", Value : '100.65.39.6'}
	]};
});
site = '100.65.39.2';
ipcMain.handle('SetSite', (event, data) => {
  console.log(' <- SetSites ' + data);
	site = data;
	return;
});