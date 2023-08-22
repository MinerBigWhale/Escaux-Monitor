<?php
if(isset($_GET['s']) && !empty($_GET['s'])) { $site = $_GET['s']; } else { http_response_code(400); die("400 Bad Request : Parameter not provided"); }
if(isset($_GET['q']) && !empty($_GET['q'])) { $queue = $_GET['q']; } else { http_response_code(400); die("400 Bad Request : Parameter not provided"); }

$debug = isset($_GET['d']);

if ($debug) { echo '<html><body><table><thead><tr><th>debug activated</th></tr></thead><tbody>'; } 
else { 
	header('Content-Type: application/json'); 
	if(apcu_exists("queuemembers_".$site."_".$queue)) {
		echo apcu_fetch("queuemembers_".$site."_".$queue);
		exit;
	}
}

function get_http($url) {
	global $debug;
	$curl = curl_init();

	curl_setopt_array($curl, [
		CURLOPT_URL => $url,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_FOLLOWLOCATION => true
	]);

	$resp = curl_exec($curl);
	if ($debug) { 
		$info = curl_getinfo($curl);
		echo '<tr><td>Get '.$info['url'].' with code '.$info['http_code'].' in '.$info['total_time'].'</td>';
	}

	curl_close($curl);
	if ($debug) { echo '<td><pre><code>'.$resp.'</code></pre></td></tr>'; }
	return $resp;
}

$resp = json_encode(simplexml_load_string(get_http('http://'.urlencode($site).'/xml/ccGetQueueMembers.php?queue='.urlencode($queue))));

if ($debug) { echo '</tbody></table></body></html>'; }
else { apcu_store("queuemembers_".$site."_".$queue, $resp, 1); } 
echo $resp;
?>