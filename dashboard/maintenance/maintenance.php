<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include('../../assets/includes/main.php');
check_config();
check_auth();

if (!check_perm(MAINTENANCE)) {
	header('Location: /dashboard');
	return;
}

if (isset($_POST['maintenance'])) {
	
	$set_maintenance = $db->prepare('UPDATE env SET maintenance = 1, maintenance_message = ?, maintenance_end_date = ?');
	$set_maintenance->execute(array(
		htmlspecialchars($_POST['maintenance-message']),
		$_POST['maintenance-end-date']
	));

} else {
	$set_maintenance = $db->prepare('UPDATE env SET maintenance = 0, maintenance_message = ?, maintenance_end_date = NULL');
	$set_maintenance->execute(array(
		htmlspecialchars($_POST['maintenance-message'])
	));
}

header('Location: ./?success=maintenance');