<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

if ($_SERVER['REQUEST_URI'] != "/configure/?step=1") {
	header('Location: ./');
	return;
}

if (isset($_POST['lang']) && $_POST['lang'] != null) {
	$current_config = get_config();
	$current_config->infos->lang = htmlspecialchars($_POST['lang']);
	edit_config($current_config);
	header('Location: ./?step=2');
	return;
}

?>

<script>
	const main = document.getElementById("main");

	start()
	async function start() {

		main.style.opacity = "0"

		await sleep(1000)

		<?php

		if (get_config()->infos->lang == "") {
		?>

			main.innerHTML = "<h1>Welcome! • Bienvenue !</h1>"
			main.style.opacity = "1"

			await sleep(1500)

			main.style.opacity = "0"

			await sleep(1000)

		<?php
		}
		?>

		main.innerHTML = `
		<h2>Please choose a language.<br>Veuillez choisir une langue.</h2>
  
 		<form method="POST">
	 
		 <div class="center">
		 
				<button class="lang-selector main center" type="submit" name="lang" value="en">
					<img class="lang-selector" alt="English" src="/assets/img/en.png" width="150px" height="90px">
					<p class="lang-selector">English</p>
				</button> 

				<button class="lang-selector main center" type="submit" name="lang" value="fr">
					<img class="lang-selector" alt="French" src="/assets/img/fr.png" width="150px" height="90px">
					<p class="lang-selector">Français</p>
				</button>

			</div>

 		</form>`

		main.style.opacity = "1"


	}

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
</script>