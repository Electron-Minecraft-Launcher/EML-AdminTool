<?php

include '../../assets/includes/main.php';
check_config();
check_auth();

if (!check_perm(BOOTSTRAP)) {
	header('Location: /');
	return;
}

if (isset($_FILES['upload-exe']) && isset($_FILES['upload-app']) && isset($_FILES['upload-deb']) && isset($_POST['new-v'])) {

	$get_v = $db->query('SELECT * FROM env');
	$v = $get_v->fetch();

	if ($_FILES['upload-exe']['size'] > 500000000 || $_FILES['upload-app']['size'] > 500000000 || $_FILES['upload-deb']['size'] > 500000000) {
		header('Location: ./?error=too%20large%20file');
	} else if ($v['launcher_v'] == $_POST['new-v']) {
		header('Location: ./?error=same%20version');
	} else {
		move_uploaded_file($_FILES['upload-exe']['tmp_name'], '../../api/bootstrap/updater.exe');
		move_uploaded_file($_FILES['upload-app']['tmp_name'], '../../api/bootstrap/updater.app');
		move_uploaded_file($_FILES['upload-deb']['tmp_name'], '../../api/bootstrap/updater.deb');

		$set_v = $db->prepare('UPDATE env SET launcher_v = ? WHERE id = 1');
		$set_v->execute(array($_POST['new-v']));

		header('Location: ./?success=background%20uploaded');
	}
} else {
	header('Location: ./?error=empty%20fields');
}
