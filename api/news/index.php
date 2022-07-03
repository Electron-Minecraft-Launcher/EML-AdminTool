<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

 
include('../../assets/includes/main.php');
header("Content-Type: application/json; charset=UTF-8");

$get_news = $db->query('SELECT * FROM news ORDER BY id DESC');

$news_array = [];

while ($news = $get_news->fetch()) {

	$id = $news['news_id'];

	$title = htmlspecialchars(str_replace("\"", "\\\"", $news['title']));

	$content = str_replace("\"", "\\\"", $news['content']);
	$content = str_replace("\n", "<br>", $content);
	$content = str_replace("\r", "", $content);

	if ($news['image_url'] != "null") {
		$image = htmlspecialchars($news['image_url']);
	} else {
		$image = null;
	}

	$get_author = $db->prepare('SELECT name FROM users WHERE id = ?');
	$get_author->execute(array($news['author_id']));
	$author = $get_author->fetch()['name'];

	$get_date = $db->prepare('SELECT DATE_FORMAT(date, "%d.%m.%Y") FROM news WHERE id = ?');
	$get_date->execute(array($news['id']));
	$date = $get_date->fetch()['DATE_FORMAT(date, "%d.%m.%Y")'];

	array_push($news_array, array(
		"id" => $id,
		"title" => $title,
		"content" => $content,
		"imageUrl" => $image,
		"author" => $author,
		"date" => $date
	));
}

echo json_encode(
	$news_array
);
