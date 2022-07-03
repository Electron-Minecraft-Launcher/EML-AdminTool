<?php

if (!check_perm(FILES_UPDATER)) {
	header('Location: /dashboard');
	return;
}

if (!isset($files_folder)) {
	header('Location: ./');
	die;
}

if (isset($_POST['new-folder']) && strlen($_POST['new-folder']) >= 1) {

	if (
		in_array($_POST['new-folder'], ["*", "\\", "/", "?", ":", "<", ">", "|", "\""])
	) {
		header('Location: ./?error=invalid%20foldername');
	} else if (file_exists($files_folder . $_POST['new-folder'])) {
		header('Location: ./?error=folder%20already%20existing');
	} else {
		mkdir($files_folder . $_POST['new-folder'], 0777, false);
		header('Location: ./?path=' . str_replace("/", "%2F", $_POST['files-folder']));
	}
}