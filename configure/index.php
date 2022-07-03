<?php

/** 
 * @copyright Copyright (c) 2021, GoldFrite
 * @license GNU GPLv3
 */

include('../assets/includes/main.php');

if (
	get_config()->db->host != "" &&
	get_config()->db->name != "" &&
	get_config()->db->username != "" &&
	get_config()->infos->serverId != "" &&
	get_config()->infos->serverName != "" &&
	get_config()->infos->serverName != "EML" &&
	get_config()->infos->serverPassword != "" &&
	get_config()->infos->endConfig == true &&
	$db_err == 0
) {
	header('Location: ../');
	return;
}

if (!isset($_GET['step']) || is_nan($_GET['step']) || $_GET['step'] > 4) {
	clear_config();
	try {
		$db->query('DELETE FROM env WHERE id = 1');
	} catch (\Throwable $th) {
	}
	header('Location: ./?step=1');
	return;
}

if ($_GET['step'] == 1) {
	$progress_value = "16.66";
}

if ($_GET['step'] == 2) {
	if (is_ok_step1()) {
		$progress_value = "50";
	} else {
		header('Location: ./?step=1');
	}
}

if ($_GET['step'] == 3) {
	if (is_ok_step2()) {
		$progress_value = "83.34";
	} else {
		header('Location: ./?step=2');
	}
}

if ($_GET['step'] == 4) {
	if (is_ok_step3()) {
		$progress_value = "100";
	} else {
		header('Location: ./?step=3');
	}
}

?>

<!DOCTYPE html>
<html lang="<?= get_current_lang() ?>">

<head>
	<meta charset="UTF-8">
	<title>Configuration • EML AdminTool</title>
	<link rel="stylesheet" href="../assets/css/configure.css">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.24.0/axios.min.js"></script>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>

<body>

	<div class="progress-container">
		<div class="progress">
			<div class="in-progress" id="in-progress" style="width: <?= $progress_value ?>%"></div>
		</div>

		<table>
			<tr>
				<td>
					<a href="./?step=1">
						Step 1<br>
						<b>Language selection</b>
					</a>
				</td>
				<td>
					<?php
					if (is_ok_step1()) {
					?>
						<a href="./?step=2">
							Step 2<br>
							<b>Database configuration</b>
						</a>
					<?php
					} else {
					?>
						Step 2<br>
						<b>Database configuration</b>
					<?php
					}
					?>
				</td>
				<td>
					<?php
					if (is_ok_step2()) {
					?>
						<a href="./?step=3">
							Step 3<br>
							<b>Server configuration</b>
						</a>
					<?php
					} else {
					?>
						Step 3<br>
						<b>Server configuration</b>
					<?php
					}
					?>
				</td>
			</tr>
		</table>

	</div>

	<div id="main">
	</div>

	<?php

	footer();

	?>

</body>

<?php

if ($_GET['step'] == 1) {
	include('configure_1.php');
}

if ($_GET['step'] == 2) {
	include('configure_2.php');
}

if ($_GET['step'] == 3) {
	include('configure_3.php');
}

if ($_GET['step'] == 4) {
	include('configure_4.php');
}

?>

</html>

<?php

function is_ok_step1()
{
	if (get_config()->infos->lang != "") {
		return true;
	} else {
		return false;
	}
}

function is_ok_step2()
{
	global $db_err;
	if (is_ok_step1() && get_config()->db->host != "" && get_config()->db->name != "" && get_config()->db->username != "" && $db_err == 0) {
		return true;
	} else {
		return false;
	}
}

function is_ok_step3()
{
	if (is_ok_step2() && get_config()->infos->serverId != "" && get_config()->infos->serverName != "" && get_config()->infos->serverName != "EML") {
		return true;
	} else {
		return false;
	}
}
