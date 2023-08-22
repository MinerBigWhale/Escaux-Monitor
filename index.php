<?php
if(isset($_GET['s']) && !empty($_GET['s'])) { $site = $_GET['s']; } else { $site = "100.65.39.2"; }
if(isset($_GET['q']) && !empty($_GET['q'])) { $queue = $_GET['q']; } else { $queue = ""; }
?>

<script>
//Preload
let site, queue;
<?php
echo 'site = "'.$site.'"; _site = "'.$site.'"; queue = "'.$queue.'"; _queue = "'.$queue.'";' ;
?>

api = new Object({
        invoke: (channel, data) => {
            // whitelist channels
            let validChannels = ["GetQueues","SetQueue","GetQueueMembers","GetQueuecalls","GetSites","SetSite","GetAlerts"];
            if (validChannels.includes(channel)) {
                return new Promise((resolve, reject) => {
					resolve(window.api[channel](channel, data));
				});
            }
			console.error('Unauthorized API call ' + channel)
        },

		//forward to server
		'GetQueues': async () => {
		  console.log(' -> GetQueues ./get_queues.php?s='+site);
		  return await fetch('./get_queues.php?s='+site)
			.then(response => response.json())
			.then(data => {
			  return { Queues : data.Queue};
			})
			.catch(error => {
			  console.error('Error:', error);
			});
		},
		'SetQueue': (event, data) => {
		  console.log(' <- SetQueue ' + data);
			queue = data;
			return;
		},
		'GetAlerts': async () => {
		  console.log(' -> GetAlerts ./get_alert');
		  return await fetch('./get_alert.php')
			.then(response => response.json())
			.then(data => {
			  return { Alert : data.result};
			})
			.catch(error => {
			  console.error('Error:', error);
			});
		},

		'GetQueueMembers': async () => {
		  console.log(' -> GetQueueMembers ./get_queuemembers.php?s='+site+'&q='+queue);
		  return await fetch('./get_queuemembers.php?s='+site+'&q='+queue)
			.then(response => response.json())
			.then(data => {
			  // Send the retrieved data back to the renderer process
			  var result = data.Member;
			  if (!Array.isArray(result)) { result = new Array(result) }
			  return { Members : result};
			})
			.catch(error => {
			  console.error('Error:', error);
			});
		},
		'GetQueuecalls': async () => {
		  console.log(' -> GetQueuecalls ./get_queuecalls.php?s='+site+'&q='+queue);
		  return await fetch('./get_queuecalls.php?s='+site+'&q='+queue)
			.then(response => response.json())
			.then(data => {
			  // Send the retrieved data back to the renderer process
			  return { Name : data.Queue.Name, Calls : data.Queue.Calls};
			})
			.catch(error => {
			  console.error('Error:', error);
			});
		},

		'GetSites': () => {
		  console.log(' -> GetSites');
			return { Sites : [
				{Name : "BL / JB", Value : '100.65.39.2'},
				{Name : "EI / ML", Value : '100.65.39.6'}
			]};
		},
		'SetSite': (event, data) => {
		  console.log(' <- SetSites ' + data);
			site = data;
			return;
		}
    }
);
</script>

<?php
   include "index.html";
?>