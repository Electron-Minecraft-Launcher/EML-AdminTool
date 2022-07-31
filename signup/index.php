<?php

/** 
 * @copyright Copyright (c) 2021, GoldFrite
 * @license GNU GPLv3
 */

include '../assets/includes/main.php';
check_config();

if (isset($_COOKIE['USERNAME']) && isset($_COOKIE['PASSWORD'])) {
	header('Location: ../dashboard/');
	return;
}
?>

<!DOCTYPE html>
<html lang="<?= get_current_lang() ?>">

<head>
	<?= html_head() ?>
	<title><?= title(get_lang()->loginAndSignup->signup) ?></title>
</head>

<body>

	<h2 class="center"><?= get_lang()->loginAndSignup->signUp ?></h2>

	<form method="POST" action="signup.php" style="margin-top: 40px" class="center">

		<input class="center" type="text" name="username" placeholder="<?= get_lang()->main->username ?>" autofocus required>
		<input class="center" type="password" name="password" placeholder="<?= get_lang()->main->password ?>" required>
		<input class="center" type="password" name="password-cfr" placeholder="<?= get_lang()->loginAndSignup->passwordConfirmation ?>" required>

		<p class="no-margin">

			<label for="pin-1"><?= get_lang()->loginAndSignup->pin ?></label>
			&nbsp;
			<input class="center separator-margin inline-block" style="width: 10px;" type="text" name="pin-1" id="pin-1" maxlength="1" required onkeyup="pin(1)">
			<input class="center separator-margin inline-block" style="width: 10px;" type="text" name="pin-2" id="pin-2" maxlength="1" required onkeyup="pin(2)">
			<input class="center separator-margin inline-block" style="width: 10px;" type="text" name="pin-3" id="pin-3" maxlength="1" onkeyup="pin(3)">
			&nbsp;
			<a href="/help/pin/" target="_blank"><i class="fas fa-question-circle"></i></a>

		</p>

		<button class="main" type="submit" style="margin-left: auto; margin-right: auto"><?= get_lang()->loginAndSignup->signup ?></button>

		<p class="margin-top" style="margin-bottom: 80px;"><?= get_lang()->loginAndSignup->haveAccount ?></a></p>

	</form>

	<?php footer() ?>

</body>

<script>
	function pin(input) {
		if (isNaN(document.getElementById("pin-" + input).value) || document.getElementById("pin-" + input).value.length > 1 || document.getElementById("pin-" + input).value == " " || document.getElementById("pin-" + input).value == "") {
			document.getElementById("pin-" + input).value = ""
			document.getElementById("pin-" + input).focus()
		} else {
			if (input <= 2) {
				var i1 = input + 1
				document.getElementById("pin-" + i1).focus()
			}
		}
	}
</script>

</html>