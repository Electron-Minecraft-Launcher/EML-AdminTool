<?php

/** 
 * @copyright Copyright (c) 2021, GoldFrite
 * @license GNU GPLv3
 */

include('../../assets/includes/main.php');

?>

<!DOCTYPE html>
<html lang="<?= get_current_lang() ?>">

<head>
	<meta charset="UTF-8">
	<title><?= title(get_lang()->help->help . ": " . get_lang()->help->news->news) ?></title>
	<link rel="stylesheet" href="../../assets/css/main.css">
	<link rel="stylesheet" href="../../assets/css/help.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>

<body>

	<div id="body">

		<?= html_header([get_lang()->help->home->helpCenter], get_lang()->help->home->news) ?>

		<div id="in-body">

			<?= get_lang()->help->news->content ?>

		</div>

	</div>

	<?php footer() ?>

</body>

</html>