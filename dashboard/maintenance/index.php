<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include('../../assets/includes/main.php');
check_config();
check_auth();

if (!check_perm(MAINTENANCE)) {
	header('Location: /dashboard');
	return;
}

$get_maintenance = $db->query('SELECT * FROM env');
$maintenance = $get_maintenance->fetch();

?>

<!DOCTYPE html>
<html lang="fr">

<head>
	<?= html_head() ?>
	<link rel="stylesheet" href="../../assets/css/options.css">
	<title><?= title("Maintenance") ?></title>
</head>

<body>

	<div id="body">

		<p class="access">
			<a href="../">Accueil - AdminTool</a>&nbsp;
			<i class="fas fa-caret-right"></i>&nbsp;
			Maintenance
		</p>

		<h3>Maintenance</h3>
		<hr>

		<div id="in-body">

			<p>
				<b>
					Sur cette page, vous allez pouvoir activer ou désactiver la maintenance du Launcher.
				</b>
			</p>

			<div class="div">
				<h4>Comment faire ?</h4>

				<p>Vous pouvez trouver un tutoriel <a href="/help/maintenance">ici</a>.</p>
			</div>

			<div class="div">

				<h4>Gestion de la maintenance</h4>

				<form method="POST" action="maintenance.php">

					<label style="margin-bottom: 20px; display: block"><label class="switch">
							<input type="checkbox" name="maintenance" <?php
																												if ($maintenance['maintenance'] == 1) {
																													echo " checked";
																												}
																												?>>
							<span class="slider round"></span>
						</label>&nbsp;&nbsp;Activer la maintenance du Launcher
					</label>

					<input type="text" name="maintenance-message" id="maintenance-message" placeholder="Objet de la maintenance (facultatif)" value="<?php
																																																																						if ($maintenance['maintenance_message'] != null) {
																																																																							echo $maintenance['maintenance_message'];
																																																																						}
																																																																						?>">

					<label for="maintenance-end-date">Date de fin (facultatif) :&nbsp;&nbsp;</label>
					<input class="separator-margin" style="display: inline; width: 368px;" type="date" id="maintenance-end-date" name="maintenance-end-date" value="<?php
																																																																													if ($maintenance['maintenance_end_date'] != null) {
																																																																														echo $maintenance['maintenance_end_date'];
																																																																													}
																																																																													?>">

					<button type="submit" class="main">Valider</button>

				</form>

			</div>


		</div>

	</div>

	</div>

	<?php footer() ?>

</body>

</html>