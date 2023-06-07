const { app, BrowserWindow, ipcMain } = require("electron");
const { XMLParser } = require('fast-xml-parser');
const path = require("path");
const fs = require("fs");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, site, queue, version;

String.prototype.xml2json = function () {
    const parser = new XMLParser();
	return parser.parse(this);
};

async function Init() {
	
  // Check for new version 
  version = app.getVersion()
  var splash = new BrowserWindow({
     width: 500, 
     height: 150, 
     transparent: true, 
     frame: false, 
     alwaysOnTop: true 
  });
  splash.loadFile('splash.html');
  splash.center();
	setTimeout( () => {
	  fetch('https://api.github.com/repos/MinerBigWhale/Escaux-Monitor/releases', { 
				headers: {
					'Accept' : 'application/vnd.github.v3+json'
				}})
		.then(response => response.json()) //Converting the response to a JSON object
		.then( data => {
		  console.log(data[0].tag_name)
		  if (parseInt(data[0].tag_name.substr(data[0].tag_name - 4)) > parseInt(version.substr(version.length - 4))){
			console.log('new version '+data[0].tag_name+' is availiable to download.')
			console.log('-- app need to be updated')
		  }
		  else {
			console.log('-- app is up to date')
		  }
		  // Create the browser window.
		  win = new BrowserWindow({
			width: 900,
			height: 600,
			title: 'Escaux-Monitor-v' + version,
			show: false,
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
		  
		  win.once('ready-to-show', () => {
			splash.close()
			win.show()
		  })
		  
		  win.on('closed', () => {
			win = null
		  })
		})
		.catch(error => {
		  console.error('Error:', error);
		  app.quit()
		});
    }, 2000)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    Init()
  }
})

app.on("ready", Init);

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