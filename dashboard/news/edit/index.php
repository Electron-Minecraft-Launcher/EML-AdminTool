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

if (!isset($_GET['id']) || $_GET['id'] == "") {
	header('Location: ../?error=emtpy%20pamareter');
	return;
}

$get_news = $db->prepare('SELECT * FROM news WHERE id = ?');
$get_news->execute(array(htmlspecialchars($_GET['id'])));

$get_news_data = $get_news->fetch();

if ($get_news_data == null) {
	header('Location: ../?error=invalid%20parameter');
	return;
}

$get_user_name = $db->prepare('SELECT name FROM users WHERE id = ?');
$get_user_name->execute(array($get_news_data['author_id']));

$user_name = $get_user_name->fetch();

$get_date = $db->prepare('SELECT DATE_FORMAT(date, "%d.%m.%Y") FROM news WHERE id = ?');
$get_date->execute(array($get_news_data['id']));
$date = $get_date->fetch();

if ($get_news_data['image_url'] == "null") {
	$news_img_url = "";
} else {
	$news_img_url = $get_news_data['image_url'];
}

?>

<!DOCTYPE html>
<html lang="fr">

<head>
	<?= html_head() ?>
	<link rel="stylesheet" href="../../../assets/css/options.css">
	<title><?= title("Modifier une News") ?></title>
</head>

<body>

	<div id="body">

		<p class="access">
			<a href="../../">Accueil - AdminTool</a>&nbsp;
			<i class="fas fa-caret-right"></i>&nbsp;
			<a href="../">News</a>&nbsp;
			<i class="fas fa-caret-right"></i>&nbsp;
			Modifier une News
		</p>

		<h3>Modifier une News</h3>
		<hr>

		<div id="in-body">

			<p>
				<b>
					C'est sur cette page que vous allez pouvoir modifier la News désirée.
				</b>
			</p>

			<div class="div">

				<h4>Modifier la News</h4>

				<form method="POST" action="edit_news.php">

					<input type="text" name="news-title-edit" id="news-title-edit" placeholder="Titre de la News" value="<?= $get_news_data['title'] ?>">

					<textarea name="news-content-edit" id="news-content-edit" placeholder="Contenu de la News (mise en forme HTML)" style="font-family: Consolas, monospace;"><?= $get_news_data['content'] ?></textarea>

					<input type="text" name="news-img-edit" id="news-img-edit" placeholder="Lien d'une image (ne pas remplir si non désiré)" value="<?= $news_img_url ?>">

					<label for="news-author-edit">Auteur :&nbsp;&nbsp;</label>
					<input style="display: inline; width: 250px; margin-right: 20px;" type="text" id="news-author-edit" value="<?= $user_name['name'] ?>" disabled>

					<label for="news-date-edit">Date :&nbsp;&nbsp;</label>
					<input class="separator-margin" style="display: inline; width: 121px;" type="text" id="news-date-edit" value="<?= $date['DATE_FORMAT(date, "%d.%m.%Y")'] ?>" disabled>

					<input type="hidden" name="id" value="<?= $_GET['id'] ?>">

					<button type="submit" class="main">Modifier</button>

				</form>

			</div>

		</div>

	</div>

	<?php footer() ?>

</body>

</html>