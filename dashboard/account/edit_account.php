<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include '../../assets/includes/main.php';
check_config();
check_auth();

if (!isset($_POST['username']) || $_POST['username'] == '') {
	header('Location: /dashboard');
	return;
}

$get_user = $db->prepare('SELECT * FROM users WHERE name = ?');
$get_user->execute(array(get_username()));
$user = $get_user->fetch();

if ($user['name'] != $_POST['username']) {

	$get_users = $db->prepare('SELECT * FROM users WHERE name = ?');
	$get_users->execute(array(htmlspecialchars($_POST['username'])));
	while ($users = $get_users->fetch()) {
		if ($users['name'] == $_POST['username']) {
			header('Location: ./?error=username%20used');
			return;
		}
	}

	if (check_perm(ADMIN)) {
		$config = get_config();
		$server_id = strtolower(str_replace(' ', '-', htmlspecialchars($_POST['username'])));
		$config['info']['server_id'] = $server_id;
		$config['info']['server_name'] = htmlspecialchars($_POST['username']);
		edit_config($config);
	}

	$set_username = $db->prepare('UPDATE users SET name = ? WHERE id = ?');
	$set_username->execute(array(
		htmlspecialchars($_POST['username']),
		$user['id']
	));
}

if (isset($_POST['new-password']) && $_POST['new-password'] != '') {
	if ($_POST['new-password'] == $_POST['new-password-cfr']) {

		if (check_perm(ADMIN)) {
			$config = get_config();
			$config['info']['server_password'] = htmlspecialchars($_POST['new-password']);
			edit_config($config);
		}

		$set_password = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
		$set_password->execute(array(
			crypt($_POST['new-password'], '$1$$' . $_POST['new-password-cfr']),
			$user['id']
		));

	} else {
		header('Location: ./?error=password%20mismatch');
		return;
	}
}

header('Location: ./?success=info%20changed');
