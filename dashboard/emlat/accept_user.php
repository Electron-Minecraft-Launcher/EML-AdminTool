<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include('../../assets/includes/main.php');
check_config();
check_auth();

if (!check_perm(ADMIN)) {
	header('Location: /dashboard');
	return;
}

if (!isset($_POST['user']) || !is_numeric($_POST['user']) || $_POST['user'] == "") {
	header('Location: ./');
	return;
}

$get_user = $db->prepare('SELECT * FROM users WHERE id = ? AND accepted = 0 AND server_admin = 0');
$get_user->execute([$_POST['user']]);

if ($user = $get_user->fetch()) {
	$accept_user = $db->prepare('UPDATE users SET accepted = 1, p_files_updater = ?, p_bootstrap = ?, p_maintenance = ?, p_send_news = ?, p_edit_del_news = ?, p_background = ? WHERE id = ? AND accepted = 0 AND server_admin = 0');
	$accept_user->execute(array(
		convert_on_off($_POST['p_files_updater']),
		convert_on_off($_POST['p_bootstrap']),
		convert_on_off($_POST['p_maintenance']),
		convert_on_off($_POST['p_send_news']),
		convert_on_off($_POST['p_edit_del_news']),
		convert_on_off($_POST['p_background']),
		$_POST['user']
	));

	header('Location: ./?success=user%20accepted');

} else {
	header('Location: ./?error=user%20not%20found');
}


function convert_on_off($on_off)
{
	if ($on_off == "on") {
		return 1;
	} else {
		return 0;
	}
}