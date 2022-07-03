<?php

include('../../assets/includes/main.php');
check_config();
check_auth();

if (!check_perm(BACKGROUND)) {
	header('Location: /');
	return;
}

if (isset($_FILES['upload-bg'])) {
	if ($_FILES['upload-bg']['size'] > 10000000) {
		header('Location: ./?error=too%20large%20file');
	} else {
		move_uploaded_file($_FILES['upload-bg']['tmp_name'], '../../api/background/background.jpg');
		header('Location: ./?success=background%20uploaded');
	}
} else {
	header('Location: ./?error=empty%20fields');
}
