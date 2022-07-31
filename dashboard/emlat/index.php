<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

include '../../assets/includes/main.php';
check_config();
check_auth();

if (!check_perm(ADMIN)) {
	header('Location: /dashboard');
	return;
}

$get_admin = $db->query('SELECT * FROM users WHERE server_admin = 1');
$admin = $get_admin->fetch();

$get_accepted_users = $db->query('SELECT * FROM users WHERE server_admin = 0 AND accepted = 1 ORDER BY name');
$get_waiting_users = $db->query('SELECT * FROM users WHERE accepted = 0 ORDER BY name');
$get_spam_users = $db->query('SELECT * FROM users WHERE accepted = 3 ORDER BY name');



?>

<!DOCTYPE html>
<html lang="<?= get_current_lang() ?>">

<head>
	<?= html_head() ?>
	<link rel="stylesheet" href="../../assets/css/options.css">
	<title><?= title(get_lang()->emlat->emlat) ?></title>
</head>

<body>

	<div id="body">

	<?= html_header([get_lang()->dashboard->homeEMLAT], get_lang()->emlat->emlat) ?>


		<div id="in-body">

			<div class="div">

				<h4><?= get_lang()->emlat->infoAbout ?> <i><?= get_config()['info']['server_name'] ?> AdminTool</i></h4>

				<table class="no-style">
					<tr>
						<td>
							<label for="server-name"><?= get_lang()->emlat->serverName ?></label>
						</td>
						<td>
							<input type="text" name="server-name" id="server-name" value="<?= get_config()['info']['server_name'] ?>" disabled>
						</td>
						<td></td>
					</tr>
					<tr>
						<td colspan="2">
							<p style="margin-bottom: 20px"><?= get_lang()->emlat->editServerName ?></p>
						</td>
						<td></td>
					<tr>
						<td>
							<label for="pin"><?= get_lang()->emlat->pin ?></label>
						</td>
						<td>
							<input type="text" name="pin" id="pin" value="<?php

																														$get_pin = $db->query("SELECT pin FROM env WHERE id = 1");
																														$pin = $get_pin->fetch();
																														echo $pin['pin'];

																														?>" class="no-margin" disabled>
						</td>
						<td>
							<a href="regenerate_pin.php" class="no-underline"><button class="main" style="width: auto"><?= get_lang()->emlat->regenerate ?></button></a>
						</td>
					</tr>
				</table>

			</div>

			<div class="div">

				<h4><?= get_lang()->emlat->usersAndPerms ?></h4>

				<table class="user-list">

					<tr>
						<th rowspan="2"><?= get_lang()->emlat->username ?></th>
						<th rowspan="2"><?= get_lang()->emlat->admin ?></th>
						<th colspan="6"><?= get_lang()->emlat->perms ?></th>
						<th rowspan="2"><?= get_lang()->emlat->actions ?></th>
					</tr>

					<tr class="perms">
						<th><?= get_lang()->emlat->filesUpdater ?></th>
						<th><?= get_lang()->emlat->bootstrap ?></th>
						<th><?= get_lang()->emlat->maintenance ?></th>
						<th><?= get_lang()->emlat->sendNews ?></th>
						<th><?= get_lang()->emlat->editDelNews ?></th>
						<th><?= get_lang()->emlat->background ?></th>
					</tr>

					<tr>
						<td><?= $admin['name'] ?></td>
						<td><input type="checkbox" name="admin" id="admin" disabled checked></td>
						<td><input type="checkbox" name="p_files_updater" id="p_files_updater" disabled checked></td>
						<td><input type="checkbox" name="p_bootstrap" id="p_bootstrap" disabled checked></td>
						<td><input type="checkbox" name="p_maintenance" id="p_maintenance" disabled checked></td>
						<td><input type="checkbox" name="p_send_news" id="p_send_news" disabled checked></td>
						<td><input type="checkbox" name="p_edit_del_news" id="p_edit_del_news" disabled checked></td>
						<td><input type="checkbox" name="p_background" id="p_background" disabled checked></td>
						<td>None</td>
					</tr>

					<?php

					while ($accepted_user = $get_accepted_users->fetch()) {
					?>

						<form method="POST" action="./edit_perms.php">
							<tr>
								<td><?= $accepted_user['name'] ?> <input type="hidden" name="user" value="<?= $accepted_user['id'] ?>"></td>
								<td>
									<input type="checkbox" name="admin" id="admin" disabled>
								</td>
								<td>
									<input type="checkbox" name="p_files_updater" id="p_files_updater" <?= check_current_perm($accepted_user[FILES_UPDATER]) ?>>
								</td>
								<td>
									<input type="checkbox" name="p_bootstrap" id="p_bootstrap" <?= check_current_perm($accepted_user[BOOTSTRAP]) ?>>
								</td>
								<td>
									<input type="checkbox" name="p_maintenance" id="p_maintenance" <?= check_current_perm($accepted_user[MAINTENANCE]) ?>>
								</td>
								<td>
									<input type="checkbox" name="p_send_news" id="p_send_news" <?= check_current_perm($accepted_user[SEND_NEWS]) ?>>
								</td>
								<td>
									<input type="checkbox" name="p_edit_del_news" id="p_edit_del_news" <?= check_current_perm($accepted_user[EDIT_DEL_NEWS]) ?>>
								</td>
								<td>
									<input type="checkbox" name="p_background" id="p_background" <?= check_current_perm($accepted_user[BACKGROUND]) ?>>
								</td>
								<td>
									<button style="margin-bottom: 5px; cursor: help !important;" title="<?= get_lang()->emlat->saveInfo ?>" type="submit"><?= get_lang()->emlat->save ?></button>
									<a href="javascript:deleteUser('./delete_user.php?user=<?= $accepted_user['id'] ?>')"><button style="cursor: help !important;" title="<?= get_lang()->emlat->deleteInfo ?>" type="button"><?= get_lang()->emlat->delete ?></button></a>
								</td>
							</tr>
						</form>

					<?php
					}
					?>

				</table>

			</div>


			<div class="div">

				<h4><?= get_lang()->emlat->waitingUsers ?></h4>

				<table class="user-list">

					<tr>
						<th rowspan="2"><?= get_lang()->emlat->username ?></th>
						<th colspan="6"><?= get_lang()->emlat->perms ?></th>
						<th rowspan="2"><?= get_lang()->emlat->actions ?></th>
					</tr>

					<tr class="perms">
					<th><?= get_lang()->emlat->filesUpdater ?></th>
						<th><?= get_lang()->emlat->bootstrap ?></th>
						<th><?= get_lang()->emlat->maintenance ?></th>
						<th><?= get_lang()->emlat->sendNews ?></th>
						<th><?= get_lang()->emlat->editDelNews ?></th>
						<th><?= get_lang()->emlat->background ?></th>
					</tr>

					<?php

					while ($waiting_user = $get_waiting_users->fetch()) {
					?>

						<form method="POST" action="./accept_user.php">
							<tr>
								<td><?= $waiting_user['name'] ?> <input type="hidden" name="user" value="<?= $waiting_user['id'] ?>"></td>
								<td>
									<input type="checkbox" name="p_files_updater" id="p_files_updater">
								</td>
								<td>
									<input type="checkbox" name="p_bootstrap" id="p_bootstrap">
								</td>
								<td>
									<input type="checkbox" name="p_maintenance" id="p_maintenance">
								</td>
								<td>
									<input type="checkbox" name="p_send_news" id="p_send_news">
								</td>
								<td>
									<input type="checkbox" name="p_edit_del_news" id="p_edit_del_news">
								</td>
								<td>
									<input type="checkbox" name="p_background" id="p_background">
								</td>
								<td>
									<button style="cursor: help !important;" title="<?= get_lang()->emlat->acceptInfo ?>" type="submit"><?= get_lang()->emlat->accept ?></button>
									<a href="javascript:deleteUser('./delete_user.php?user=<?= $waiting_user['id'] ?>')"><button style="cursor: help !important;" title="<?= get_lang()->emlat->deleteInfo ?>" type="button"><?= get_lang()->emlat->delete ?></button></a>
								</td>
							</tr>
						</form>

					<?php
					}
					?>

				</table>

			</div>


			<div class="div">

				<h4 style="margin-bottom: 0"><?= get_lang()->emlat->spams ?></h4>
				<p style="margin-top: 0; margin-bottom: 28px"><?= get_lang()->emlat->spamInfo ?></p>

				<table class="user-list">

					<tr>
						<th><?= get_lang()->emlat->username ?></th>
						<th><?= get_lang()->emlat->actions ?></th>
					</tr>

					<?php

					while ($spam_user = $get_spam_users->fetch()) {
					?>

						<form method="GET" action="./delete_spam_user.php">
							<tr>
								<td><?= $spam_user['name'] ?> <input type="hidden" name="user" value="<?= $spam_user['id'] ?>"></td>
								<td>
									<button style="cursor: help !important;" title="<?= get_lang()->emlat->deleteInfo2 ?>" type="submit"><?= get_lang()->emlat->delete ?></button>
								</td>
							</tr>
						</form>

					<?php
					}
					?>

				</table>

			</div>


			<div class="div">

				<h4>EML AdminTool</h4>

				<table class="no-style">

					<tr>
						<td>
							<p><?= get_lang()->emlat->currentVersion ?></p>
						</td>
						<td>
							<p><code><?= get_current_version() ?></code></p>
						</td>
					</tr>
					<tr>
						<td>
							<p><?= get_lang()->emlat->lastVersion ?></p>
						</td>
						<td>
							</p><code><?= get_last_version()[0] ?></code></p>
						</td>
					</tr>
				</table>


				<?php
				$updates_count = 0;

				if (get_current_version() != get_last_version()[0] && get_last_version()[1]) {

					$stop = false;

					foreach (get_versions()[0] as $key => $value) {

						if ($value->version != get_current_version() && !$stop) {
							$updates_count++;
						} else {
							$stop = true;
						}
					}

				?>

					<p>
						<span onclick=""><i id="caret" class="fas fa-caret-right" style="transform: rotate(0deg); transition: transform 0.3s"></i></span>&nbsp;&nbsp;<?= $updates_count ?> <?= get_lang()->emlat->xUpdatesAvailable ?>
					</p>

					<div id="updates-list">

						<table class="small-list">

							<tr>
								<th>Version</th>
								<th>Type</th>
								<th>Description</th>
								<th>Date</th>
							</tr>

							<?php

							$stop = false;

							$reset_api = "false";
							$reset_config_db = "false";


							foreach (get_versions()[0] as $key => $value) {

								if ($value->version != get_current_version() && !$stop) {

									foreach ($value->needsToReinstall as $value2) {

										if ($value2 == "api") {
											$reset_api = "true";
										} else if ($value2 == "configAndDB") {
											$reset_config_db = "true";
										}
									}

							?>

									<tr>
										<td><?= $value->version ?></td>
										<td><?= $value->type ?></td>
										<td><?= $value->category ?></td>
										<td><?= $value->date ?></td>
									</tr>

							<?php
								} else {
									$stop = true;
								}
							}

							?>

						</table>

					</div>

				<?php
				}
				if ($updates_count != 0) {
				?>
					<button class="main" onclick="updateEMLAT(<?= $reset_api ?>, <?= $reset_config_db ?>)"><?= get_lang()->emlat->installX ?> <?= $updates_count ?> <?= get_lang()->emlat->xUpdates ?></button>
				<?php
				}
				?>

				<button class="logout" onclick="resetEMLAT()"><?= get_lang()->emlat->reset ?></button>

			</div>


		</div>

	</div>

	</div>

	<?php footer() ?>

	<?php

	function check_current_perm($int)
	{
		if ($int == 1) {
			return " checked";
		} else {
			return "";
		}
	}

	?>

</body>

<style>
	input[type=checkbox] {
		display: inline;
		width: auto;
		margin-bottom: 0;
	}

	input[type=checkbox]:hover:active {
		border: 1px solid var(--orange);
		outline: 4px solid var(--transparent-light-orange);
	}

	input[type=checkbox]:focus {
		border: 1px solid var(--orange);
		outline: none;
	}

	#caret {
		cursor: pointer;
	}

	button.logout {
		margin-top: 20px;
		width: 576px;
	}
</style>

<script src="/assets/js/emlat.js"></script>

</html>