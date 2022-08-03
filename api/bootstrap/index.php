<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 * Bug found by ZeGamer.c
 */


include '../../assets/includes/main.php';

header("Content-Type: application/json; charset=UTF-8");


$get_bootstrap = $db->query('SELECT * FROM env');
$bootstrap = $get_bootstrap->fetch();
$bootstrap_array = array(
	"version" => $bootstrap['launcher_v']
);

echo json_encode($bootstrap_array);