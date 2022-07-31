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

rmrf('../../api/files-updater/files/');
rmrf('../../api/bootstrap/');
rmrf('../../api/background/');

mkdir('../../api/files-updater/files/');
mkdir('../../api/bootstrap/');
mkdir('../../api/background/');

$file = fopen('../../api/files-updater/files/YOU_CAN_REMOVE_THIS_FILE', 'w');
fclose($file);

$file = fopen('../../api/bootstrap/DO_NOT_REMOVE_THIS_FILE', 'w');
fclose($file);

$file = fopen('../../api/background/DO_NOT_REMOVE_THIS_FILE', 'w');
fclose($file);


$db->query('DROP TABLE IF EXISTS users, env, news');

clear_config();

clearstatcache();

header('Location: /logout');


function rmrf($dir)
{

	if (is_dir($dir)) {

		$files = array_diff(scandir($dir), ['.', '..']);

		foreach ($files as $file) {
			rmrf($dir . "/" . $file);
		}

		rmdir($dir);
	} else {

		unlink($dir);
	}
}