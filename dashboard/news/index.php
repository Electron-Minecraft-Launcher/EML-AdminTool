<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include '../../assets/includes/main.php';
check_config();
check_auth();

if (!check_perm(SEND_NEWS) && !check_perm(EDIT_DEL_NEWS)) {
	header('Location: /dashboard');
	return;
}

?>

<!DOCTYPE html>
<html lang="fr">

<head>
	<?= html_head() ?>
	<link rel="stylesheet" href="../../assets/css/options.css">
	<title><?= title("News") ?></title>
</head>

<body>

	<div id="body">

		<p class="access">
			<a href="../">Accueil - AdminTool</a>&nbsp;
			<i class="fas fa-caret-right"></i>&nbsp;
			News
		</p>

		<h3>News</h3>
		<hr>

		<div id="in-body">

			<p>
				<b>
					C'est sur cette page que vous allez pouvoir ajouter, modifier et supprimer des News de votre Launcher.
				</b>
			</p>

			<div class="div">
				<h4>Comment faire ?</h4>

				<p>Vous pouvez trouver un tutoriel <a href="/help/news">ici</a>.</p>
			</div>

			<?php if (check_perm(SEND_NEWS)) { ?>

				<div class="div">

					<h4>Ajouter une News</h4>

					<form method="POST" action="add_news.php">

						<input type="text" name="news-title-add" id="news-title-add" placeholder="Titre de la News">

						<textarea name="news-content-add" id="news-content-add" placeholder="Contenu de la News (mise en forme HTML)" style="font-family: Consolas, monospace;"></textarea>

						<input type="text" name="news-img-add" id="news-img-add" placeholder="Lien d'une image (ne pas remplir si non désiré)">

						<label for="news-author-add">Auteur :&nbsp;&nbsp;</label>
						<input style="display: inline; width: 250px; margin-right: 20px;" type="text" name="news-author-add" id="news-author-add" value="<?= $_COOKIE['USERNAME'] ?>" disabled>

						<label for="news-date-add">Date :&nbsp;&nbsp;</label>
						<input class="separator-margin" style="display: inline; width: 121px;" type="text" name="news-date-add" id="news-author-add" value="<?= date('d.m.Y') ?>" disabled>

						<button type="submit" class="main">Envoyer</button>

					</form>

				</div>
			<?php }

			if (check_perm(EDIT_DEL_NEWS)) { ?>

				<div class="div">

					<h4>Modifier et supprimer des News</h4>

					<?php

					$get_news = $db->query('SELECT * FROM news ORDER BY id DESC');

					while ($get_news_data = $get_news->fetch()) {

						$get_user_name = $db->prepare('SELECT name FROM users WHERE id = ?');
						$get_user_name->execute(array($get_news_data['author_id']));

						$get_date = $db->prepare('SELECT DATE_FORMAT(date, "%d.%m.%Y") FROM news WHERE id = ?');
						$get_date->execute(array($get_news_data['id']));
						$date = $get_date->fetch();

						$user_name = $get_user_name->fetch();

						if ($get_news_data['image_url'] == "null") {
							$news_img_url = "";
						} else {
							$news_img_url = $get_news_data['image_url'];
						}


					?>

						<div class="edit-del-news-div">

							<div class="edit-del-news center">

								<p>
									<a href="edit/?id=<?= $get_news_data['id'] ?>" class="no-underline">
										<button class="small" style="margin: 85px auto auto auto;">
											<i class="fas fa-pen"></i>&nbsp;&nbsp;Modifier
										</button>
									</a>
								</p>

								<p>
									<a href="del_news.php?id=<?= $get_news_data['id'] ?>" class="no-underline">
										<button class="small" style="margin: 25px auto auto auto;">
											<i class="fas fa-trash"></i>&nbsp;&nbsp;Supprimer
										</button>
									</a>
								</p>

							</div>

							<input type="text" name="news-title-edit" id="news-title-edit" placeholder="Titre de la News" value="<?= $get_news_data['title'] ?>" disabled>

							<div class="textarea" id="news-content-edit" placeholder="Contenu de la News (mise en forme HTML)" disabled><?= str_replace("\n", "<br>", $get_news_data['content']) ?></div>

							<input type="text" name="news-img-edit" id="news-img-edit" placeholder="Aucune image" value="<?= $news_img_url ?>" disabled>

							<label for="news-author-edit">Auteur :&nbsp;&nbsp;</label>
							<input style="display: inline; width: 250px; margin-right: 20px;" type="text" id="news-author-edit" value="<?= $user_name['name'] ?>" disabled>

							<label for="news-date-edit">Date :&nbsp;&nbsp;</label>
							<input class="separator-margin" style="display: inline; width: 121px;" type="text" id="news-date-edit" value="<?= $date['DATE_FORMAT(date, "%d.%m.%Y")'] ?>" disabled>

						</div>



					<?php
					} ?>
				</div>

			<?php
			}
			?>

		</div>

	</div>

	<?php footer() ?>

</body>

</html>