<?php

include('../../assets/includes/main.php');
header("Content-Type: application/json; charset=UTF-8");

$get_maintenance = $db->query('SELECT * FROM env');
$maintenance = $get_maintenance->fetch();


if ($maintenance['maintenance'] == 1) {
	$maintenance_array = array(
		"maintenance" => true,
		"message" => $maintenance['maintenance_message'],
		"endDate" => $maintenance['maintenance_end_date']
	);
} else {
	$maintenance_array = array(
		"maintenance" => false
	);
}

echo json_encode($maintenance_array);
