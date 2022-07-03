<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include('../assets/includes/main.php');

?>

<!DOCTYPE html>
<html lang="<?= get_current_lang() ?>">

<head>
	<meta charset="UTF-8">
	<title><?= title(get_lang()->help->home->helpCenter) ?></title>
	<link rel="stylesheet" href="../../assets/css/main.css">
	<link rel="stylesheet" href="../../assets/css/help.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>

<body>

	<div id="body">

		<?= html_header([], get_lang()->help->home->helpCenter) ?>

		<div id="in-body">

			<p>
				<b>
					<?= get_lang()->help->home->helpCenterDesc ?>
				</b>
			</p>

			<div class="div">

				<h4><?= get_lang()->help->home->configuration ?></h4>

				<p>
					<a href="./database/"><?= get_lang()->help->home->database ?>&nbsp;&nbsp;<i class="fas fa-caret-right"></i></a>
				</p>
				<p style="margin-bottom: 0;">
					<a href="./pin/"><?= get_lang()->help->home->pin ?>&nbsp;&nbsp;<i class="fas fa-caret-right"></i></a>
				</p>

			</div>


			<div class="div">

				<h4><?= get_lang()->help->home->launcherManagement ?></h4>

				<p>
					<a href="./files-updater/"><?= get_lang()->help->home->filesUpdater ?>&nbsp;&nbsp;<i class="fas fa-caret-right"></i></a>
				</p>
				<p style="margin-bottom: 0;">
					<a href="./bootstrap/"><?= get_lang()->help->home->bootstrap ?>&nbsp;&nbsp;<i class="fas fa-caret-right"></i></a>
				</p>
				<p>
					<a href="./maintenance/"><?= get_lang()->help->home->maintenance ?>&nbsp;&nbsp;<i class="fas fa-caret-right"></i></a>
				</p>
				<p style="margin-bottom: 0;">
					<a href="./news/"><?= get_lang()->help->home->news ?>&nbsp;&nbsp;<i class="fas fa-caret-right"></i></a>
				</p>

			</div>

		</div>

	</div>

	<?php footer() ?>

</body>

</html>