<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include('../../../assets/includes/main.php');
check_config();
check_auth();

if (!check_perm(EDIT_DEL_NEWS)) {
	header('Location: /');
	return;
}

if (!isset($_POST['id']) || $_POST['id'] == "") {
	header('Location: ../?error=emtpy%20fields');
	return;
}

$get_news = $db->prepare('SELECT * FROM news WHERE id = ?');
$get_news->execute(array(htmlspecialchars($_POST['id'])));

$get_news_data = $get_news->fetch();

if ($get_news_data == null) {
	header('Location: ../?error=invalid%20parameter');
	return;
}

if (
	!isset($_POST['news-title-edit']) || $_POST['news-title-edit'] == null ||
	!isset($_POST['news-content-edit']) || $_POST['news-content-edit'] == null
) {
	header('Location: ./?error=empty%20fields');
	return;
}

// News ID
preg_match_all('/([a-zA-ZéèàùêçÉÈÀÙÊÇ]*?)( *?)/Um', htmlspecialchars($_POST['news-title-edit']), $out_news_id, PREG_PATTERN_ORDER);
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

if ($_POST['news-img-edit'] == null || !isset($_POST['news-img-edit'])) {
	$img_url = "null";
} else {
	$img_url = htmlspecialchars($_POST['news-img-edit']);
}

try {
	$edit_news = $db->prepare('UPDATE news SET news_id = ?, title = ?, content = ?, image_url = ? WHERE id = ?');
	$edit_news->execute(array(
		$news_id,
		htmlspecialchars($_POST['news-title-edit']),
		$_POST['news-content-edit'],
		$img_url,
		$get_news_data['id']
	));
	header('Location: ../?success=news%20edited');
	return;
} catch (\Throwable $th) {
	header('Location: ./?error=unknow');
	die();
}
