<?php

/** 
 * @copyright Copyright (c) 2021, GoldFrite
 * @license GNU GPLv3
 */

include 'assets/includes/main.php';
check_config();

if (isset($_COOKIE['USERNAME']) && isset($_COOKIE['PASSWORD'])) {
	header('Location: dashboard/');
	return;
}

if (
	isset($_POST['username']) &&
	isset($_POST['password'])
) {

	$get_auth = $db->prepare('SELECT * FROM users WHERE name = ?');
	$get_auth->execute(array(htmlspecialchars($_POST['username'])));

	$data_get_auth = $get_auth->fetch();

	if (
		$data_get_auth['name'] == $_POST['username'] &&
		$data_get_auth['password'] == crypt($_POST['password'], '$1$$' . $_POST['password'])
	) {

		setcookie("USERNAME", $data_get_auth['name'], time() + 3600 * 24 * 365, "/", "", false, true);
		setcookie("PASSWORD", $data_get_auth['password'], time() + 3600 * 24 * 365, "/", "", false, true);

		header('Location: dashboard/?success=login');
	} else {
		header('Location: ./?error=login');
	}
} else {
	header('Location: ./?error=empty%20fields');
}
