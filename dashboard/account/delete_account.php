<?php

/** 
 * @copyright Copyright (c) 2021, GoldFrite
 * @license GNU GPLv3
 */

include '../../assets/includes/main.php';
check_config();
check_auth();

$get_user = $db->prepare('SELECT * FROM users WHERE name = ?');
$get_user->execute(array(get_username()));

if ($user = $get_user->fetch()) {
	
	if ($user['server_admin'] == 1) {
		header('Location: ./');
		return;
	}

	$delete_user = $db->prepare('DELETE FROM users WHERE name = ?');
	$delete_user->execute(array());

	header('Location: /logout');

}