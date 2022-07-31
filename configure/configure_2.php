<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

if ($_SERVER['REQUEST_URI'] != "/configure/?step=2") {
	header('Location: ./');
	return;
}

$db_test_err = 0;

if (
	isset($_POST['host']) && $_POST['host'] != null &&
	isset($_POST['name']) && $_POST['name'] != null &&
	isset($_POST['username']) && $_POST['username'] != null
) {

	try {

		$db_test = new PDO(
			'mysql:host=' . htmlspecialchars($_POST['host']) . ';dbname=' . htmlspecialchars($_POST['name']),
			htmlspecialchars($_POST['username']),
			htmlspecialchars($_POST['password'])
		);

		$current_config = get_config();
		$current_config['db']['host'] = htmlspecialchars($_POST['host']);
		$current_config['db']['name'] = htmlspecialchars($_POST['name']);
		$current_config['db']['username'] = htmlspecialchars($_POST['username']);
		if (isset($_POST['password'])) {
			$current_config['db']['password'] = htmlspecialchars($_POST['password']);
		}

		edit_config($current_config);

		//! DB INIT

		$db_test->query('CREATE TABLE env
		(
			id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
			pin VARCHAR(3) NOT NULL,
			launcher_v VARCHAR(255),
			maintenance INT,
			maintenance_message TEXT,
			maintenance_end_date DATE
		)');

		$db_test->query('DELETE FROM env');

		$db_test->query('CREATE TABLE users
		(
			id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
			name VARCHAR(255),
			password VARCHAR(255),
			accepted INT,
			server_admin INT,
			p_files_updater INT,
			p_bootstrap INT,
			p_maintenance INT,
			p_send_news INT,
			p_edit_del_news INT,
			p_background INT
		)');

		$db_test->query('DELETE FROM users WHERE id >= 1');

		$db_test->query('CREATE TABLE news
		(
			id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
			news_id VARCHAR(255),
			author_id INT,
			date DATE,
			title VARCHAR(255),
			content TEXT,
			image_url TEXT
		)');

		$db_test->query('DELETE FROM news');

		//! ---

		header('Location: ./?step=3');
		return;
	} catch (Exception $e) {
		$db_test_err = 1;
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

		if (get_config()['db']['host'] == "" && $db_test_err == 0) {
		?>

			main.innerHTML = `<h1><?= get_lang()->configure->conf2->t1 ?></h1>`
			main.style.opacity = "1"

			await sleep(1500)

			main.style.opacity = "0"

			await sleep(1000);

		<?php
		} else if ($db_test_err == 1) {
		?>

			main.innerHTML = `<h1><?= get_lang()->configure->conf2->e ?></h1>`
			main.style.opacity = "1"

			await sleep(1500)

			main.style.opacity = "0"

			await sleep(1000)

		<?php
		}
		?>

		main.innerHTML = `
		<h2><?php
				if ($db_test_err == 0) {
					echo get_lang()->configure->conf2->st1;
				} else {
					echo get_lang()->main->tryAgain;
				}
				?></h2>

		<form method="POST">

			<div class="center">

				<input class="center" name="host" required placeholder="<?= get_lang()->configure->conf2->ph1 ?>" autofocus value="<?= get_config()['db']['host'] ?>">
				<input class="center" name="name" required placeholder="<?= get_lang()->configure->conf2->ph2 ?>" value="<?= get_config()['db']['name'] ?>">
				<input class="center" name="username" required placeholder="<?= get_lang()->configure->conf2->ph3 ?>" value="<?= get_config()['db']['username'] ?>">
				<input class="center separator-margin" type="password" name="password" placeholder="<?= get_lang()->configure->conf2->ph4 ?>" value="<?= get_config()['db']['password'] ?>">

				<button type="submit" class="main center"><?= get_lang()->main->validate ?></button>

				<p><?= get_lang()->configure->conf2->help ?> <a href="/help/database/" target="_blank"><?= get_lang()->main->clickHere ?></a></p>

			</div>

		</form>
	`

		main.style.opacity = "1"

	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
</script>