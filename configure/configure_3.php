<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

if ($_SERVER['REQUEST_URI'] != "/configure/?step=3") {
	header('Location: ./');
	return;
}

$password_check_err = 0;

if (
	isset($_POST['name']) && $_POST['name'] != null &&
	isset($_POST['password']) && $_POST['password'] != null &&
	isset($_POST['cfr-password']) && $_POST['cfr-password'] != null
) {
	$current_config = get_config();

	if ($_POST['password'] == $_POST['cfr-password']) {

		$server_id = strtolower(str_replace(' ', '-', htmlspecialchars($_POST['name'])));
		$current_config['info']['server_id'] = $server_id;

		$current_config['info']['server_name'] = htmlspecialchars($_POST['name']);
		$current_config['info']['server_password'] = htmlspecialchars($_POST['password']);
		edit_config($current_config);

		include '../assets/includes/db.php';

		$set_server_admin = $db->prepare('INSERT INTO users (name, password, accepted, server_admin, p_files_updater, p_bootstrap, p_maintenance, p_send_news, p_edit_del_news, p_background) VALUES (?, ?, 1, 1, 1, 1, 1, 1, 1, 1)');
		$set_server_admin->execute(array(
			htmlspecialchars($_POST['name']),
			password_hash($_POST['password'], PASSWORD_DEFAULT)
		));

		$pin = random_int(0, 9) . random_int(0, 9) . random_int(0, 9);

		if (strlen($pin) < 3) {
			$pin = '0' . $pin;
		}

		$set_env = $db->prepare('INSERT INTO env VALUES (1, ?, "0.0.0", 0, NULL, NULL)');
		$set_env->execute(array($pin));

		header('Location: ./?step=4');
		return;
	} else {
		$password_check_err = 1;
	}
}

?>

<script>
	const main = document.getElementById("main");

	start();
	async function start() {

		main.style.opacity = "0"

		await sleep(1000)

		<?php

		if (get_config()['info']['server_name'] == "" && $password_check_err == 0) {
		?>

			main.innerHTML = `<h1><?= get_lang()->configure->conf3->t1 ?></h1>`
			main.style.opacity = "1"

			await sleep(1500)

			main.style.opacity = "0"

			await sleep(1000)

		<?php
		} else if ($password_check_err == 1) {
		?>
			main.innerHTML = `<h1><?= get_lang()->configure->conf3->e ?></h1>`
			main.style.opacity = "1"

			await sleep(1500)

			main.style.opacity = "0"

			await sleep(1000)
		<?php
		}
		?>

		main.innerHTML = `
		<h2><?php
				if ($password_check_err == 0) {
					echo get_lang()->configure->conf3->st1;
				} else {
					echo get_lang()->main->tryAgain;
				}
				?></h2>

		<form method="POST">

			<div class="center">

				<input class="center" name="name" required placeholder="<?= get_lang()->configure->conf3->ph1 ?>" autofocus value="<?= get_config()['info']['server_name'] ?>">
				<input class="center" type="password" name="password" placeholder="<?= get_lang()->configure->conf3->ph2 ?>" value="<?= get_config()['info']['server_password'] ?>">
				<input class="center separator-margin" type="password" name="cfr-password" placeholder="<?= get_lang()->configure->conf3->ph3 ?>" value="<?= get_config()['info']['server_password'] ?>">

				<button type="submit" class="main center"><?= get_lang()->main->validate ?></button>

			</div>

		</form>
	`

		main.style.opacity = "1"

	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
</script>