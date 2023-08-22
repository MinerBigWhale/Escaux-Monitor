const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        invoke: (channel, data) => {
            // whitelist channels
            let validChannels = ["GetQueues","SetQueue","GetQueueMembers","GetQueuecalls","GetSites","SetSite","GetAlerts"];
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, data);
            }
			console.error('Unauthorized API call ' + channel)
        }
    }
);