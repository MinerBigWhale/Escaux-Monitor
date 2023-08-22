<?php

$debug = isset($_GET['d']);

if ($debug) { echo '<html><body><table><thead><tr><th>debug activated</th></tr></thead><tbody>'; } 
else { 
	header('Content-Type: application/json'); 
	if(apcu_exists("alert")) {
		echo apcu_fetch("alert");
		exit;
	}
}

function get_http($url) {
	global $token, $debug;
	$curl = curl_init();

	curl_setopt_array($curl, [
		CURLOPT_URL => $url,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTPHEADER => 
			array(
				'Content-Type:application/json',
				'X-AUTH-TOKEN: '.$token
			)
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

function post_http($url, $data) {
	global $debug;
	$curl = curl_init();

	curl_setopt_array($curl, [
		CURLOPT_URL => $url,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_POST => 1,
        CURLOPT_POSTFIELDS => $data 
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

if(!$debug && apcu_exists("token")) {
	$token = apcu_fetch("token");
}
if(!isset($token) || empty($token)) {
	$login = json_decode(post_http('http://srv-centreon:80/centreon/api/latest/login', '{"security": {"credentials": {"login": "centreonapi", "password": "$$$$"}}}'));
	$token = $login->security->token;
	apcu_store("token", $token, 360);
}
try {
	$resp = get_http('http://srv-centreon:80/centreon/api/latest/monitoring/services?limit=100&search={"$and":[{"service.state":{"$eq":"2"}},{"service.is_acknowledged":{"$eq":"false"}}]}');
	//$resp = get_http('http://srv-centreon:80/centreon/api/latest/monitoring/services');
} catch (Exception $e) {
	apcu_delete("token");
	throw $e;
}
	

if ($debug) { echo '</tbody></table></body></html>'; }
else { apcu_store("alert", $resp, 30); } 
echo $resp;
?>