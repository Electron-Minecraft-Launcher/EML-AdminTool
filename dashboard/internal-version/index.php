<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include '../../assets/includes/main.php';
check_config();
check_auth();


?>

<!DOCTYPE html>
<html lang="fr">

<head>
	<?= html_head() ?>
	<link rel="stylesheet" href="../../assets/css/options.css">
	<title><?= title("Internal version") ?></title>
</head>

<body>

	<div id="body">

		<p class="access">
			<a href="../">Home - AdminTool</a>&nbsp;
			<i class="fas fa-caret-right"></i>&nbsp;
			Internal version
		</p>

		<h3>Internal version</h3>
		<hr>


		<div class="in-body">
			<p>Oops... this page is not available yet...</p>
		</div>

	</div>

	<?php footer() ?>

</body>

</html>