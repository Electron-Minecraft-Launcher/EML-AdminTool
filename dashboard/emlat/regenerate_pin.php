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

$pin = random_int(0, 9) . random_int(0, 9) . random_int(0, 9);

if (strlen($pin) < 3) {
	$pin = '0' . $pin;
}

$update_pin = $db->prepare('UPDATE env SET pin = ?');
$update_pin->execute(array($pin));

header('Location: ./?success=pin%20regenerated');