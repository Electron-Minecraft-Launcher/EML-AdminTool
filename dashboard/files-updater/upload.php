<?php

if (!check_perm(FILES_UPDATER)) {
	header('Location: /dashboard');
	return;
}

if (!isset($files_folder)) {
	header('Location: ./');
	die;
}

if (isset($_FILES['upload-files'])) {

	foreach ($_FILES['upload-files']['name'] as $key => $file) {

		if ($_FILES['upload-files']['size'][$key] > 10000000) {
			header('Location: ./?error=too%20large%20file');
			return;
		} else {
			move_uploaded_file($_FILES['upload-files']['tmp_name'][$key], $files_folder . $_FILES['upload-files']['name'][$key]);
			header('Location: ./?path=' . str_replace("/", "%2F", $_POST['files-folder']));
		}
	}
}
