<?php

include './assets/includes/main.php';

if ($_COOKIE['token']) {

	$get_token = $db->prepare('SELECT * FROM tokens WHERE token = ?');
	$get_token->execute(array($_COOKIE['TOKEN']));
	$token = $get_token->fetch();
	if (!$token == null) {
		$update_token = $db->prepare('UPDATE tokens SET expiration_date = ? WHERE token = ?');
		$update_token->execute(array(
			time() - 1,
			$_COOKIE['token']
		));
	}
}
setcookie("TOKEN", "", time(), '/');
header('Location: ../');
