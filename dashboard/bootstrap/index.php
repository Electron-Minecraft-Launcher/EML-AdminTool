<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include('../../assets/includes/main.php');
check_config();
check_auth();

if (!check_perm(BOOTSTRAP)) {
	header('Location: /dashboard');
	return;
}

$get_v = $db->query('SELECT * FROM env');
$v = $get_v->fetch();

?>

<!DOCTYPE html>
<html lang="fr">

<head>
	<?= html_head() ?>
	<link rel="stylesheet" href="../../assets/css/options.css">
	<title><?= title("Bootstrap") ?></title>
</head>

<body>

	<div id="body">

		<p class="access">
			<a href="../">Accueil - AdminTool</a>&nbsp;
			<i class="fas fa-caret-right"></i>&nbsp;
			Bootstrap
		</p>

		<h3>Bootstrap</h3>
		<hr>

		<div id="in-body">

			<p>
				<b>
					Cette option vous permet de mettre à jour le Launcher lui-même, lors, par exemple, de correctifs ou d'ajouts de fonctionnalités.
				</b>
			</p>

			<div class="div">
				<h4>Comment faire ?</h4>

				<p>Vous pouvez trouver un tutoriel <a href="/help/bootstrap">ici</a>.</p>
			</div>

			<div class="div">

				<h4>Gestion du bootstrap</h4>

				<?php

				if (!file_exists('../../api/bootstrap/updater.exe') || !file_exists('../../api/bootstrap/updater.app') || !file_exists('../../api/bootstrap/updater.deb')) {
					echo '<p style="margin-bottom: 20px; color: var(--error-red)"><i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;Il manque un ou plusieurs installateurs !</p>';
				} else {
					echo '
					<div class="inline-block">
						<a href="/api/bootstrap/updater.exe" target="_blank" class="no-a"><button class="separator-margin"><i class="fab fa-microsoft"></i>&nbsp;&nbsp;Télécharger l\'installateur Windows</button></a>
					</div>
					<div class="inline-block" style="margin-left: 20px;">
						<a href="/api/bootstrap/updater.app" target="_blank" class="no-a"><button class="separator-margin"><i class="fab fa-apple"></i>&nbsp;&nbsp;Télécharger l\'installateur macOS</button></a>
					</div>
					<div class="inline-block" style="margin-left: 20px;">
						<a href="/api/bootstrap/updater.deb" target="_blank" class="no-a"><button class="separator-margin"><i class="fab fa-linux"></i>&nbsp;&nbsp;Télécharger l\'installateur Linux (deb)</button></a>
					</div><br>
					<label for="current-v">Version actuelle :&nbsp;&nbsp;</label>
							<input class="separator-margin" style="display: inline; width: 445px;" type="text" id="current-v" value="' . $v['launcher_v'] . '" disabled>
					';
				}

				?>

				<form method="POST" enctype="multipart/form-data" action="bootstrap.php">

					<table>
						<tr>
							<td style="padding-right: 14px"><label for="upload-exe"><i style="padding-bottom: 18px" class="fab fa-microsoft"></i></label></td>
							<td><input id="upload-exe" type="file" name="upload-exe" accept=".exe"></td>
						</tr>
						<tr>
							<td style="padding-right: 14px"><label for="upload-app"><i style="padding-bottom: 18px" class="fab fa-apple"></i></label></td>
							<td><input id="upload-app" type="file" name="upload-app" accept=".app"></td>
						</tr>
						<tr>
							<td style="padding-right: 14px"><label for="upload-deb"><i style="padding-bottom: 18px" class="fab fa-linux"></i></label></td>
							<td><input id="upload-deb" type="file" name="upload-deb" accept=".deb"></td>
						</tr>
						<tr>
							<td colspan="2">
							<label for="new-v">Nouvelle actuelle :&nbsp;&nbsp;</label>
							<input class="separator-margin" style="display: inline; width: 432px;" type="text" id="new-v" name="new-v" placeholder="Ex : 1.0.4">
							</td>
						</tr>
						<tr>
							<td style="padding-right: 14px"></td>
							<td> <button class="separator-margin main" type="submit">Importer</button>
							</td>
						</tr>
					</table>


					<p><i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;Seuls les fichiers EXE (.exe), application (.app) et Debian (.deb) sont acceptés !</p>
				</form>

				</form>

			</div>


		</div>

	</div>

	</div>

	<?php footer() ?>

</body>

</html>