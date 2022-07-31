<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include '../../assets/includes/main.php';
check_config();
check_auth();

if (!check_perm(EDIT_DEL_NEWS)) {
	header('Location: /');
	return;
}

if (!isset($_GET['id']) || $_GET['id'] == "") {
	header('Location: ../?error=emtpy%20fields');
	return;
}

$get_news = $db->prepare('SELECT * FROM news WHERE id = ?');
$get_news->execute(array(htmlspecialchars($_GET['id'])));

$get_news_data = $get_news->fetch();

if ($get_news_data == null) {
	header('Location: ../?error=invalid%20parameter');
	return;
}

try {
	$del_news = $db->prepare('DELETE FROM news WHERE id = ?');
	$del_news->execute(array($_GET['id']));
	header('Location: ./?success=news%20deleted');
	return;
} catch (\Throwable $th) {
	header('Location: ./?error=unknow');
	die();
}
