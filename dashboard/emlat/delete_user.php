<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include '../../assets/includes/main.php';
check_config();
check_auth();

if (!check_perm(ADMIN)) {
	header('Location: /dashboard');
	return;
}

if (!isset($_GET['user']) || !is_numeric($_GET['user']) || $_GET['user'] == "") {
	header('Location: ./');
	return;
}

$get_user = $db->prepare('SELECT * FROM users WHERE id = ? AND server_admin = 0');
$get_user->execute([$_GET['user']]);

if ($user = $get_user->fetch()) {
	$delete_user = $db->prepare('UPDATE users SET accepted = 2 WHERE id = ? AND server_admin = 0');
	$delete_user->execute([$_GET['user']]);

	header('Location: ./?success=user%20deleted');

} else {
	header('Location: ./?error=user%20not%20found');
}