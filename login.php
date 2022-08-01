<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include 'assets/includes/main.php';
check_config();

if (isset($_COOKIE['TOKEN'])) {
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
		password_verify($_POST['password'], $data_get_auth['password'])
	) {

		$random_token = uniqid() . random_str(96 - 13);
		$set_token = $db->prepare('INSERT INTO tokens (user_id, token, expiration_date, ip) VALUES (?, ?, ?, ?)');
		$set_token->execute(array(
			$data_get_auth['id'],
			$random_token,
			time() + 60 * 60 * 24 * 90,
			$_SERVER['REMOTE_ADDR']
		));

		setcookie('TOKEN', $random_token, time() + 60 * 60 * 24 * 90, '/', "", false, true);

		header('Location: dashboard/?success=login');
	} else {
		header('Location: ./?error=login');
	}
} else {
	header('Location: ./?error=empty%20fields');
}
