<?php
include '../assets/includes/main.php';

check_config();

$pin_error = 0;

// Check all is here
if (
	!isset($_POST['username']) || $_POST['username'] == "" ||
	!isset($_POST['password']) || $_POST['password'] == "" ||
	!isset($_POST['password-cfr']) || $_POST['password-cfr'] == "" ||
	!isset($_POST['pin-1']) || $_POST['pin-1'] == "" ||
	!isset($_POST['pin-2']) || $_POST['pin-2'] == "" ||
	!isset($_POST['pin-3']) || $_POST['pin-3'] == ""
) {
	header('Location: ./?error=empty%20fields');
	return;
}

// Check username not already used
$get_usernames = $db->query('SELECT * FROM users');
while ($get_usernames_data = $get_usernames->fetch()) {
	if ($get_usernames_data['name'] == htmlspecialchars($_POST['username'])) {
		header('Location: ./?error=username%20used');
		return;
	}
}

// Check special chars + length in username
$blacklist_username_chars = '"\'<>`/\\&$; ';
$pattern_username = preg_quote($blacklist_username_chars, "/");
if (preg_match('/[' . $pattern_username . ']/', $_POST['username']) || strlen($_POST['username']) <= 1 || strlen($_POST['username']) >= 24) {
	header('Location: ./?error=invalid%20username');
	return;
}

// Check password and confirmation
if (htmlspecialchars($_POST['password']) != htmlspecialchars($_POST['password-cfr'])) {
	header('Location: ./?error=password%20mismatch');
}

// Check special chars in password
$blacklist_password_chars = '"\'<>`\\&$;';
$pattern_password = preg_quote($blacklist_password_chars, "/");
if (preg_match('/[' . $pattern_password . ']/', $_POST['password'])) {
	header('Location: ./?error=invalid%20password');
	return;
}

// Check password length
if (strlen($_POST['password']) <= 7 || strlen($_POST['password']) >= 65) {
	header('Location: ./?error=password%20long');
	return;
}

// Check PIN
$get_pin = $db->query('SELECT pin FROM env');
$pin = $get_pin->fetch();
if ($pin['pin'] != $_POST['pin-1'] . $_POST['pin-2'] . $_POST['pin-3']) {
	$pin_error = 3;
}


$create_account = $db->prepare('INSERT INTO users (name, password, accepted, server_admin, p_files_updater, p_bootstrap, p_maintenance, p_send_news, p_edit_del_news, p_background) VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0)');
$create_account->execute(array(
	htmlspecialchars($_POST['username']),
	password_hash($_POST['password'], PASSWORD_DEFAULT),
	$pin_error
));

$get_account = $db->prepare('SELECT * FROM users WHERE name = ?');
$get_account->execute(array(htmlspecialchars($_POST['username'])));

$account = $get_account->fetch();

$random_token = uniqid() . random_str(96 - 13);
$set_token = $db->prepare('INSERT INTO tokens (user_id, token, expiration_date, ip) VALUES (?, ?, ?, ?)');
$set_token->execute(array(
	$account['id'],
	$random_token,
	time() + 60 * 60 * 24 * 90,
	$_SERVER['REMOTE_ADDR']
));

setcookie('TOKEN', $random_token, time() + 60 * 60 * 24 * 90, '/', "", false, true);


header('Location: /dashboard?success=account%20created');
