<?php

if (!check_perm(FILES_UPDATER)) {
	header('Location: /dashboard');
	return;
}

if (!isset($files_folder)) {
	header('Location: ./');
	die;
}

if (isset($_POST['new-name-element']) && isset($_POST['old-name-element']) && strlen($_POST['new-name-element']) >= 1) {

	if (
		!in_array($_POST['new-folder'], ["*", "\\", "/", "?", ":", "<", ">", "|", "\""])
	) {
		header('Location: ./?error=invalid%20elementname');
	} else if (file_exists($files_folder . $_POST['new-name-element'])) {
		header('Location: ./?error=element%20already%20existing');
	} else {
		rename($files_folder . $_POST['old-name-element'], $files_folder . $_POST['new-name-element']);
		header('Location: ./?path=' . str_replace("/", "%2F", $_POST['files-folder']));
	}
}
