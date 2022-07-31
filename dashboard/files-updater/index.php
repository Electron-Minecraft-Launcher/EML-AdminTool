<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include '../../assets/includes/main.php';
check_config();
check_auth();

if (!check_perm(FILES_UPDATER)) {
	header('Location: /dashboard');
	return;
}

include './config.php';

if (isset($_GET['path'])) {
	$files_folder = $files_folder . $_GET['path'];
}

include './new_folder.php';
include './upload.php';
include './delete.php';
include './rename.php';

?>

<!DOCTYPE html>
<html lang="fr">

<head>
	<?= html_head() ?>
	<link rel="stylesheet" href="../../assets/css/options.css">
	<link rel="stylesheet" href="../../assets/css/files-updater.css">
	<title><?= title("Files Updater") ?></title>
</head>

<script>
	let filesFolder = "<?php if (isset($_GET['path'])) {
												echo $_GET['path'];
											} ?>"
</script>

<body>

	<div id="body">

		<p class="access">
			<a href="../">Accueil - AdminTool</a>&nbsp;
			<i class="fas fa-caret-right"></i>&nbsp;
			Files Updater
		</p>

		<h3>Files Updater</h3>
		<hr>

		<div id="in-body">

			<p>
				<b>
					C'est sur cette page que vous allez pouvoir ajouter les fichiers que devra vérifier et télécharger le Launcher pour chaque client.
				</b>
			</p>

			<div class="div">
				<h4>Comment faire ?</h4>

				<p>Vous pouvez trouver un tutoriel <a href="/help/files-updater">ici</a>.</p>
			</div>

			<div class="div">

				<h4>Gestion des fichiers</h4>

				<button class="small" style="margin: 0 10px auto auto" id="add"><i class="fas fa-plus"></i>&nbsp;&nbsp;<i class="fas fa-caret-down"></i></button>

				<form method="POST" style="display: inline;">
					<button class="small" id="delete" style="width: 36px; margin: 0 7px auto auto" disabled><i class="fas fa-trash"></i></button>
					<input type="text" name="to-delete" id="to-delete" style="display: none">
					<input type="text" name="files-folder" id="files-folder-delete" style="display: none">
				</form>

				<button class="small" id="rename" style="width: 36px; margin-top: 0 " disabled onclick="renameElement()"><i class="fas fa-i-cursor"></i></button>

				<div class="add-files" id="add-files">
					<p class="add-options" id="add-folder"><i class="fas fa-folder"></i>&nbsp;&nbsp;Nouveau dossier</p>
					<p class="add-options" id="upload"><i class="fas fa-upload"></i>&nbsp;&nbsp;Importer des fichiers/dossiers</p>
				</div>

				<p id="path" class="path"><a href="./?path="><i class="fas fa-home"></i></a>
					<?php

					if (isset($_GET['path']) && $_GET['path'] != null) {

						$path = explode("/", $_GET['path']);

						foreach ($path as $key => $dir) {

							$url_path = null;
							$i = 0;

							while ($i < $key + 1) {
								$url_path .= str_replace(" ", "%20", $path[$i]) . "%2F";
								$i++;
							}

							echo '
						<i class="fas fa-caret-right path-caret"></i><a href="./?path=' . $url_path . '" class="path">' . $dir . '</a>';
						}
					} else {
						echo ' <i class="fas fa-caret-right path-caret"></i>';
					}

					?>
				</p>

				<table>

					<tr>
						<th style="width: 24px">
						</th>
						<th style="width: 512px">
							Nom
						</th>
						<th style="width: 200px">
							Date de modification
						</th>
						<th style="width: 100px">
							Taille
						</th>
					</tr>


					<?php

					if (is_dir($files_folder)) {

						$scan = array_diff(scandir($files_folder), array('.', '..'));

						foreach ($scan as $file) {

							if (is_dir($files_folder . $file)) {

								if (isset($_GET['path'])) {
									$url = $_GET['path'] . $file . "/";
								} else {
									$url = $file . "/";
								}


					?>
								<tr id="<?= $file ?>" onclick="selectElement('<?= $file ?>', event)" ondblclick="openFolder('<?= $url ?>')">
									<td style="border-bottom-left-radius: 5px; border-top-left-radius: 5px; text-align: center">
										<i class="fas fa-folder"></i>
									</td>
									<td>
										<?= $file ?>
									</td>
									<td>
										<?= date("d.m.Y H:i", filemtime($files_folder . $file)) ?>
									</td>
									<td style="border-bottom-right-radius: 5px; border-top-right-radius: 5px;">

									</td>
								</tr>


							<?php

							}
						}

						foreach ($scan as $file) {

							if (!is_dir($files_folder . $file)) {

								if (isset($_GET['path'])) {
									$url = $_GET['path'] . $file;
								} else {
									$url = $file;
								}


							?>
								<tr id="<?= $file ?>" onclick="selectElement('<?= $file ?>', event)" ondblclick="openElement('<?= $url ?>')">
									<td style="border-bottom-left-radius: 5px; border-top-left-radius: 5px; text-align: center">
										<?php

										if (pathinfo($url, PATHINFO_EXTENSION) == "jar") {
											echo '<i class="fab fa-java"></i>';
										} else if (
											in_array(pathinfo($url, PATHINFO_EXTENSION), ["jpg", "jpeg", "png", "gif", "bmp", "webp"])
										) {
											echo '<i class="fas fa-image"></i>';
										} else if (
											in_array(pathinfo($url, PATHINFO_EXTENSION), ["mp4", "avi", "wmv", "mov", "ogv", "ogg", "flv", "webm"])
										) {
											echo '<i class="fas fa-film"></i>';
										} else if (
											in_array(pathinfo($url, PATHINFO_EXTENSION), ["mp3", "wav", "flac", "aac", "m4a", "wma"])
										) {
											echo '<i class="fas fa-music"></i>';
										} else {
											echo '<i class="fas fa-file-alt"></i>';
										}

										?>
									</td>
									<td>
										<?= $file ?>
									</td>
									<td>
										<?= date("d.m.Y H:i", filemtime($files_folder . $file)) ?>
									</td>
									<td style="border-bottom-right-radius: 5px; border-top-right-radius: 5px;">
										<?php

										if (filesize($files_folder . $file) < 1000) {
											echo filesize($files_folder . $file) . " o";
										} else if (filesize($files_folder . $file) < 1000000) {
											echo round(filesize($files_folder . $file) / 1000, 2) . " Ko";
										} else if (filesize($files_folder . $file) < 1000000000) {
											echo round(filesize($files_folder . $file) / 1000000, 2) . " Mo";
										} else {
											echo round(filesize($files_folder . $file) / 000000000, 2) . " Go";
										}

										?>
									</td>
								</tr>


						<?php

							}
						}

						?>

				</table>
			<?php
					} else {
						echo '
						</table>
						<p class="center" style="margin-top: 15px">Directory not found.</p>
						';
					}
			?>

			<p style="margin-top: 50px;">Pour plus d'options, vous pouvez accéder à vos fichiers dans <code>/api/files-updater/files/</code>.</p>

			</div>

		</div>

	</div>

	<div class="modal-background" id="modal-background">

		<div class="modal">
			<button class="small" style="float: right; width: 36px; margin-top: 0" id="close-modal"><i class="fas fa-times"></i></button>
			<p class="modal-title" id="modal-title"></p>
			<div class="modal-content" id="modal-content">
			</div>
		</div>

	</div>

	<?php footer() ?>

</body>

<script src="../../assets/js/files-updater.js"></script>

</html>