<?php

/** 
 * @copyright Copyright (c) 2021, GoldFrite
 * @license GNU GPLv3
 */

include('../../assets/includes/main.php');
check_config();
check_auth();

$get_user_infos = $db->prepare('SELECT * FROM users WHERE name = ?');
$get_user_infos->execute(array(htmlspecialchars($_COOKIE['USERNAME'])));

$user_infos = $get_user_infos->fetch();

?>

<!DOCTYPE html>
<html lang="<?= get_current_lang() ?>">

<head>
	<?= html_head() ?>
	<link rel="stylesheet" href="../../assets/css/options.css">
	<title><?= title(get_lang()->account->account) ?></title>
</head>

<body>

	<div id="body">

	<?= html_header([get_lang()->dashboard->homeEMLAT], get_lang()->account->account) ?>

		<div id="in-body">

			<div class="div">

				<h4><?= get_lang()->account->infos ?></h4>

				<form method="POST" action="edit_account.php">

					<table class="no-style">
						<tr>
							<td>
								<label for="username"><?= get_lang()->account->username ?></label>
							</td>
							<td>
								<input type="text" name="username" id="username" value="<?= htmlspecialchars($_COOKIE['USERNAME']) ?>" placeholder="<?= get_lang()->account->usernamePlaceholder ?>">
							</td>
						</tr>
						<tr>
							<td>
								<label for="new-password"><?= get_lang()->account->newPassword ?></label>
							</td>
							<td>
								<input type="password" name="new-password" id="new-password" placeholder="<?= get_lang()->account->newPasswordPlaceholder ?>">
							</td>
						</tr>
						<tr>
							<td>
								<label for="new-password-cfr"><?= get_lang()->account->newPasswordConfirmation ?></label>
							</td>
							<td>
								<input type="password" name="new-password-cfr" id="new-password-cfr" class="separator-margin" placeholder="<?= get_lang()->account->newPasswordPlaceholder ?>">
							</td>
						</tr>
						<tr>
							<td></td>
							<td>
								<button class="main" type="submit"><?= get_lang()->account->save ?></button>
								<a href="javascript:deleteAccount()"><button class="logout" type="button" <?php if (check_perm(ADMIN)) {
																																														echo 'title="Vous ne pouvez pas supprimer le compte Administrateur" disabled';
																																													} ?>><?= get_lang()->account->deleteAccount ?></button></a>
							</td>
						</tr>
					</table>

				</form>

			</div>

			<div class="div">

				<h4><?= get_lang()->account->perms ?></h4>

				<table class="no-style">
					<tr>
						<td>
							<label for="status"><?= get_lang()->account->accountStatus ?></label>
						</td>
						<td>
							<input type="text" name="username" id="username" value="<?php

																																			if ($user_infos['server_admin'] == 1) {
																																				echo get_lang()->perms->adminAccount;
																																			} else {
																																				echo get_lang()->perms->standardAccount;
																																			}
																																			?>" disabled>
						</td>
					</tr>
				</table>

				<label for="files-updater"><?= get_lang()->perms->filesUpdater ?>&nbsp;&nbsp;</label>
				<input type="text" name="files-updater" id="files-updater" class="inline-block" style="width: 50px" value="<?= check_current_perm($user_infos[FILES_UPDATER]) ?>" disabled>&nbsp;&nbsp;&nbsp;

				<label for="bootstrap"><?= get_lang()->perms->bootstrap ?>&nbsp;&nbsp;</label>
				<input type="text" name="bootstrap" id="bootstrap" class="inline-block" style="width: 50px" value="<?= check_current_perm($user_infos[BOOTSTRAP]) ?>" disabled>&nbsp;&nbsp;&nbsp;

				<label for="maintenance"><?= get_lang()->perms->maintenance ?>&nbsp;&nbsp;</label>
				<input type="text" name="maintenance" id="maintenance" class="inline-block" style="width: 50px" value="<?= check_current_perm($user_infos[MAINTENANCE]) ?>" disabled>&nbsp;&nbsp;&nbsp;

				<label for="send-news"><?= get_lang()->perms->sendNews ?>&nbsp;&nbsp;</label>
				<input type="text" name="send-news" id="send-news" class="inline-block" style="width: 50px" value="<?= check_current_perm($user_infos[SEND_NEWS]) ?>" disabled>&nbsp;&nbsp;&nbsp;<br>

				<label for="edit-del-news"><?= get_lang()->perms->editDelNews ?>&nbsp;&nbsp;</label>
				<input type="text" name="edit-del-news" id="edit-del-news" class="inline-block no-margin" style="width: 50px" value="<?= check_current_perm($user_infos[EDIT_DEL_NEWS]) ?>" disabled>&nbsp;&nbsp;&nbsp;

				<label for="background"><?= get_lang()->perms->background ?>&nbsp;&nbsp;</label>
				<input type="text" name="background" id="background" class="inline-block no-margin" style="width: 50px" value="<?= check_current_perm($user_infos[BACKGROUND]) ?>" disabled>

			</div>


		</div>

	</div>

	</div>

	<?php footer() ?>

	<?php

	function check_current_perm($int)
	{
		if ($int == 1) {
			return get_lang()->main->yes;
		} else {
			return get_lang()->main->no;
		}
	}

	?>

</body>

<style>
	button.logout {
		margin-top: 20px;
		width: 100%;
	}
</style>

<script src="/assets/js/account.js"></script>

</html>