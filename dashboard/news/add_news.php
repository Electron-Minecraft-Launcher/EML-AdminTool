<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include('../../assets/includes/main.php');
check_config();
check_auth();

if (!check_perm(SEND_NEWS)) {
	header('Location: /');
	return;
}

if (
	!isset($_POST['news-title-add']) || $_POST['news-title-add'] == null ||
	!isset($_POST['news-content-add']) || $_POST['news-content-add'] == null
) {
	header('Location: ./?error=empty%20fileds');
	return;
}

// News ID
preg_match_all('/([a-zA-ZéèàùêçÉÈÀÙÊÇ]*?)( *?)/Um', htmlspecialchars($_POST['news-title-add']), $out_news_id, PREG_PATTERN_ORDER);
$news_id = null;
foreach ($out_news_id[0] as $key => $value) {
	$news_id .= preg_replace('/( *?)/Um', '', $value . '-');
}
$unwanted_array = array('Š' => 'S', 'š' => 's', 'Ž' => 'Z', 'ž' => 'z', 'À' => 'A', 'Á' => 'A', 'Â' => 'A', 'Ã' => 'A', 'Ä' => 'A', 'Å' => 'A', 'Æ' => 'A', 'Ç' => 'C', 'È' => 'E', 'É' => 'E', 'Ê' => 'E', 'Ë' => 'E', 'Ì' => 'I', 'Í' => 'I', 'Î' => 'I', 'Ï' => 'I', 'Ñ' => 'N', 'Ò' => 'O', 'Ó' => 'O', 'Ô' => 'O', 'Õ' => 'O', 'Ö' => 'O', 'Ø' => 'O', 'Ù' => 'U', 'Ú' => 'U', 'Û' => 'U', 'Ü' => 'U', 'Ý' => 'Y', 'Þ' => 'B', 'ß' => 'Ss', 'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a', 'æ' => 'a', 'ç' => 'c', 'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e', 'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i', 'ð' => 'o', 'ñ' => 'n', 'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'ø' => 'o', 'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ý' => 'y', 'þ' => 'b', 'ÿ' => 'y');
$news_id = strtr($news_id, $unwanted_array);
while (substr($news_id, -1) == '-') {
	$news_id = substr_replace($news_id, '', -1);
}
$news_id = strtolower(random_int(0, 9) . random_int(0, 9) . random_int(0, 9) . random_int(0, 9) . random_int(0, 9) . '--' . $news_id);
// -----

if ($_POST['news-img-add'] == null || !isset($_POST['news-img-add'])) {
	$img_url = "null";
} else {
	$img_url = htmlspecialchars($_POST['news-img-add']);
}

$get_user_id = $db->prepare('SELECT id FROM users WHERE name = ?');
$get_user_id->execute(array(htmlspecialchars($_COOKIE['USERNAME'])));

$user_id = $get_user_id->fetch();

$add_news = $db->prepare(
	'INSERT INTO news(news_id, author_id, date, title, content, image_url) 
	VALUES (?, ?, ?, ?, ?, ?)'
);

$add_news->execute(array(
	$news_id,
	$user_id['id'],
	date('Y-m-d'),
	htmlspecialchars($_POST['news-title-add']),
	$_POST['news-content-add'],
	$img_url
));

header('Content-Type: charset=utf-8');

header('Location: ./?success=news%20sended');
