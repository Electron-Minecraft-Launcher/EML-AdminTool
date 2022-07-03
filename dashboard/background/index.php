<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include('../../assets/includes/main.php');
check_config();
check_auth();

if (!check_perm(BACKGROUND)) {
	header('Location: /dashboard');
	return;
}

?>

<!DOCTYPE html>
<html lang="fr">

<head>
	<?= html_head() ?>
	<link rel="stylesheet" href="../../assets/css/options.css">
	<title><?= title("Background") ?></title>
</head>

<body>

	<div id="body">

		<p class="access">
			<a href="../">Accueil - AdminTool</a>&nbsp;
			<i class="fas fa-caret-right"></i>&nbsp;
			Background
		</p>

		<h3>Background</h3>
		<hr>

		<div id="in-body">

			<p>
				<b>
					Cette option vous permet de personnaliser le background (fond d'écran) de votre Launcher rapidement et simplement, pour l'adapter aux événements par exemple !
				</b>
			</p>

			<div class="div">

				<h4>Gestion du background</h4>

				<?php

				if (!file_exists('../../api/background/background.jpg')) {
					echo '<p style="margin-bottom: 20px; color: var(--error-red)"><i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;Aucune image trouvée ! Votre Launcher risque de produire une erreur.</p>';
				} else {
					echo '<a href="/api/background/background.jpg" target="_blank" class="no-a"><button class="separator-margin">Voir l\'image actuelle</button></a>';
				}

				?>

				<form method="POST" enctype="multipart/form-data" action="background.php">
					<p><label for="upload-bg">Importer une image JPG : <input class="separator-margin" id="upload-bg" type="file" name="upload-bg" accept=".jpg"></label></p>
					<button class="main" type="submit">Importer</button>
				</form>

				</form>

			</div>


		</div>

	</div>

	</div>

	<?php footer() ?>

</body>

</html>