<?php

/** 
 * @copyright Copyright (c) 2021, GoldFrite
 * @license GNU GPLv3
 */

include 'assets/includes/main.php';
check_config();

if (isset($_COOKIE['TOKEN'])) {
	header('Location: dashboard/');
	return;
}
?>

<!DOCTYPE html>
<html lang="<?= get_current_lang() ?>">

<head>
	<?= html_head() ?>
	<title><?= title(get_lang()->loginAndSignup->login) ?></title>
</head>

<body>

	<h2 class="center"><?= get_lang()->loginAndSignup->logIn ?></h2>

	<form method="POST" action="login.php" style="margin-top: 40px" class="center">

		<input class="center" type="text" name="username" placeholder="<?= get_lang()->main->username ?>" autofocus required>
		<input class="center separator-margin" type="password" name="password" placeholder="<?= get_lang()->main->password ?>" required>

		<button class="main" type="submit" style="margin-left: auto; margin-right: auto"><?= get_lang()->loginAndSignup->login ?></button>

		<p class="margin-top" style="margin-bottom: 80px;"><?= get_lang()->loginAndSignup->noAccount ?></p>

	</form>

	<?php footer() ?>

</body>

</html>