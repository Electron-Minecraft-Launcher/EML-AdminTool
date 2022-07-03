<?php

if (!check_perm(FILES_UPDATER)) {
	header('Location: /dashboard');
	return;
}

if (!isset($files_folder)) {
	header('Location: ./');
	die;
}

if (isset($_POST['to-delete'])) {

	try {
		$to_delete = json_decode($_POST['to-delete']);

		foreach ($to_delete as $value) {

			try {
				rmrf($files_folder . $value);
				header('Location: ./?path=' . str_replace("/", "%2F", $_POST['files-folder']));
			} catch (\Throwable $th) {
				header('Location: ./error=true&path=' . str_replace("/", "%2F", $_POST['files-folder']));
				die;
			}
		}
	} catch (\Throwable $th) {
		header('Location: ./?error=true&path=' . str_replace("/", "%2F", $_POST['files-folder']));
		die;
	}
	return;
}

function rmrf($dir)
{

	if (is_dir($dir)) {

		$files = array_diff(scandir($dir), ['.', '..']);

		foreach ($files as $file) {
			rmrf($dir . "/" . $file);
		}

		rmdir($dir);
	} else {

		unlink($dir);
	}
}