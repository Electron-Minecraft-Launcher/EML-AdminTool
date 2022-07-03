<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include('../assets/includes/main.php');
check_config();
check_auth();

if (!check_perm(ADMIN)) {
	header('Location: /dashboard');
	return;
}

?>

<!DOCTYPE html>
<html lang="fr">

<head>
	<meta charset="UTF-8">
	<title>upgrading • EML AdminTool</title>
	<link rel="stylesheet" href="../assets/css/configure.css">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.24.0/axios.min.js"></script>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
	<script>
		/**
		 * This function make requests to 'upgrader.php' file to upgrade the web application.
		 * @param string j The version of the web application that the user wants to install.
		 */
		async function upgradeToVersion(j) {
			axios.get('/upgrader.php?version=' + j)
				.then(function(response) {
					if (response.status == 200) {
						console.log('Upgraded to version ' + j);
						document.getElementById('counter').innerHTML = document.getElementById('counter').innerHTML - 1;
						if (document.getElementById('counter').innerHTML == 0) {
							window.location.href = './?success=true';
						}
					} else {
						console.log('Error while upgrading to version ' + j + ': ' + response.data);
					}
				})
				.catch(function(error) {
					console.log('Error while upgrading to version ' + j + ': ' + error.response.data);
				})
		}
	</script>
</head>

<body>

	<?php

	// +---------------------------------------------------------------------+
	// |     PLEASE READ THE INSTRUCTIONS BELOW BEFORE USING THIS SCRIPT     |
	// +---------------------------------------------------------------------+

	/**
	 * This file is the main part of the easy-upgrader-client.
	 * It will download the 'upgrader.php' file from the easy-upgrader-server website to the root of THIS (the client) website.
	 * Then, it will GET the 'upgrader.php' file with the new version variable to upgrade your web application.
	 * At the end, it will delete the 'upgrader.php' file.
	 * 
	 * You NEED to link (include()) this file to another PHP file to get some functions like the current version of your web application.
	 */


	/**
	 * @var string Please indicate the address of your easy-upgrader-server website
	 */
	$easy_upgrader_server_url = SERVER_URL;

	/**
	 * @var string Please indicate the RELATIVE path from this file to the root of your website (eg. '../', '../../', etc.)
	 */
	$upgrader_php_path = '../'; // Don't forget the trailing slash.


	$i = 0;
	$updates = [];
	foreach (get_versions()[0] as $key => $value) {
		if ($value->version == get_current_version()) {
			break;
		}
		array_push($updates, $value->version);
		$i++;
	}

	if ($i == 0 && !isset($_GET['success'])) {
		echo '<h1>No updates available.</h1>';
		echo '<meta http-equiv="refresh" content="5;url=/">';
		if (file_exists('../upgrader.php'))
			unlink($upgrader_php_path . 'upgrader.php');
		exit;
	} else if ($i == 0 && isset($_GET['success']) && $_GET['success'] == 'true') {
		echo '<h1>Up to date!</h1>';
		if (file_exists('../upgrader.php'))
			unlink($upgrader_php_path . 'upgrader.php');
		echo '<meta http-equiv="refresh" content="5;url=/">';
		exit;
	}

	fopen($upgrader_php_path . 'upgrader.php', 'w');
	file_put_contents(
		$upgrader_php_path . 'upgrader.php',
		file_get_contents(SERVER_URL . 'versions/files/upgrader.php')
	);

	$version = get_versions()[0];

	echo '<h1><span id="counter">' . $i . '</span> upgrade(s) remaining.</h1>';

	echo '<script>
	async function upgrade() {';

	foreach ($updates as $key => $value) {
	?>

		await upgradeToVersion('<?= $value; ?>');

	<?php
	}

	echo '	}
	upgrade();
</script>';

	?>

</body>

</html>