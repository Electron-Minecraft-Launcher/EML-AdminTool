<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

if ($_SERVER['REQUEST_URI'] != "/configure/?step=4") {
	header('Location: ./');
	return;
}

$current_config = get_config();
$current_config->infos->endConfig = true;
edit_config($current_config);

?>

<script>
	const main = document.getElementById("main");

	start()
	async function start() {

		main.style.opacity = "0"

		await sleep(1000)

		main.innerHTML = "<h1><?= get_lang()->configure->conf4->t1 ?></h1>"
		main.style.opacity = "1"

		await sleep(1500)

		main.style.opacity = "0"

		await sleep(1000)


		main.innerHTML = "<h1><?= get_lang()->configure->conf4->t2 ?></h1>"
		main.style.opacity = "1"

		await sleep(1500)

		main.style.opacity = "0"

		await sleep(1000)

		main.innerHTML = "<h1><?= get_lang()->configure->conf4->t3 ?></h1>"
		main.style.opacity = "1"

		await sleep(1500)

		main.style.opacity = "0"

		await sleep(1000)

		main.innerHTML = '<meta http-equiv="refresh" content="0; URL=/" />'

	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
</script>