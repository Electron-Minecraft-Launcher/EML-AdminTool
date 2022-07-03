<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */


//! +------------------------------+
//! | CONSTs										   |
//! +------------------------------+

define('CONFIG_FILE', 'blocked/config.json');

define('ERR_MSG_LAST_V', 'Unable to get the last version of the EML AdminTool');
define('ERR_MSG_V_LIST', 'Unable to get the list of the versions of the EML AdminTool');
define('SERVER_URL', 'https://admintool.electron-minecraft-launcher.ml/');

define("ACCEPTED", "accepted");
define("ADMIN", "server_admin");
define("FILES_UPDATER", "p_files_updater");
define("BOOTSTRAP", "p_bootstrap");
define("MAINTENANCE", "p_maintenance");
define("SEND_NEWS", "p_send_news");
define("EDIT_DEL_NEWS", "p_edit_del_news");
define("BACKGROUND", "p_background");


//! +------------------------------+
//! | DATABASE									   |
//! +------------------------------+

$db;
$db_err = 0;

try {
	$db = new PDO(
		'mysql:host=' . get_config()->db->host . ';dbname=' . get_config()->db->name,
		get_config()->db->username,
		get_config()->db->password
	);
} catch (Exception $e) {
	$db_err = 1;
}


//! +------------------------------+
//! | CONFIGURATION MANAGEMENT		 |
//! +------------------------------+

/**
 * Check if the config is ok. Else, redirect to the config page and exit.
 */

function check_config(): void
{
	global $db_err;

	if (
		get_config()->db->host == "" ||
		get_config()->db->name == "" ||
		get_config()->db->username == "" ||
		get_config()->infos->serverId == "" ||
		get_config()->infos->serverName == "" ||
		get_config()->infos->serverName == "EML" ||
		get_config()->infos->serverPassword == "" ||
		get_config()->infos->endConfig == false ||
		$db_err == 1
	) {
		setcookie("USERNAME", "");
		setcookie("PASSWORD", "");

		header('Location: /configure/');
		exit;
	}
}

/**
 * Get the content of the file _config.json_, where there are the database info and the server info.
 * @param bool $json_encode If true, the content of the file will be at the JSON format.
 */
function get_config($json_encode = false): object
{
	if (!$json_encode) {
		return json_decode(file_get_contents(CONFIG_FILE, true));
	} else {
		return file_get_contents(CONFIG_FILE, true);
	}
}

/**
 * Edit the content of the file _config.json_.
 * @param $config the $config var with the edited value
 */
function edit_config($config): void
{
	file_put_contents(
		CONFIG_FILE,
		json_encode($config),
		FILE_USE_INCLUDE_PATH
	);
}

/**
 * Create the content of the file _config.json_.
 */
function clear_config(): void
{
	$config = fopen(CONFIG_FILE, 'a+', true);
	fclose($config);

	file_put_contents(CONFIG_FILE, "", FILE_USE_INCLUDE_PATH);
	file_put_contents(
		CONFIG_FILE,
		json_encode(
			array(
				"db" => array(
					"host" => "",
					"name" => "",
					"username" => "",
					"password" => ""
				),
				"infos" => array(
					"lang" => "",
					"serverId" => "",
					"serverName" => "",
					"serverPassword" => "",
					"endConfig" => false
				)
			)
		),
		FILE_USE_INCLUDE_PATH
	);
}

/**
 * Get the content of the file _en.json_ or _fr.json_, where there are the database infos and the server infos.
 * @param bool $json_encode If true, the content of the file will be at the JSON format.
 */
function get_lang($json_encode = false): object
{
	if (get_config()->infos->lang == "fr") {
		$lang = "fr";
	} else {
		$lang = "en";
	}

	if (!$json_encode) {
		return json_decode(file_get_contents("lang/" . $lang . ".json", true));
	} else {
		return file_get_contents("lang/" . $lang . ".json", true);
	}
}

/**
 * Get the current language
 */
function get_current_lang(): string
{
	if (get_config()->infos->lang == "fr") {
		return "fr";
	} else {
		return "en";
	}
}

/**
 * Generate a random string.
 * @param int $length The length of the random string.
 */
function random_str($length): string
{
	$key_space = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$str = '';
	$max = mb_strlen($key_space, '8bit') - 1;
	for ($i = 0; $i < $length; ++$i) {
		$str .= $key_space[random_int(0, $max)];
	}
	return $str;
}

/**
 * Get the current version of the EML AdminTool
 */
function get_current_version(): string
{
	return "0.7.8-beta";
}

/**
 * Get the last version of the EML AdminTool from the electron-minecraft-launcher.ml website.
 */
function get_last_version(): array
{


	try {
		$ch = curl_init(SERVER_URL . 'versions/');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		$data = json_decode(curl_exec($ch));

		if (curl_getinfo($ch, CURLINFO_HTTP_CODE) == 200) {
			curl_close($ch);
			return [$data[0]->version, true];
		} else {
			curl_close($ch);
			return [ERR_MSG_LAST_V, false];
		}
	} catch (Exception $e) {
		return [ERR_MSG_LAST_V, false];
	}
}

/**
 * Get the list of the versions of the EML AdminTool from the electron-minecraft-launcher.ml website in an array.
 */
function get_versions(): array
{

	try {
		$ch = curl_init(SERVER_URL . 'versions/');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		$data = json_decode(curl_exec($ch));

		if (curl_getinfo($ch, CURLINFO_HTTP_CODE) == 200) {
			curl_close($ch);
			return [$data, true];
		} else {
			curl_close($ch);
			return [ERR_MSG_V_LIST, false];
		}
	} catch (Exception $e) {
		return [ERR_MSG_V_LIST, false];
	}
}


//! +------------------------------+
//! | USER MANAGEMENT							 |
//! +------------------------------+


/**
 * Check if the user is logged. Else, redirect to the login page and exit.
 */
function check_auth(): void
{

	global $db;

	if (!isset($_COOKIE['USERNAME']) || !isset($_COOKIE['PASSWORD'])) {
		setcookie("USERNAME", "");
		setcookie("PASSWORD", "");
		header('Location: /');
		exit;
	}

	if (isset($_COOKIE['USERNAME']) && isset($_COOKIE['PASSWORD'])) {

		$get_auth = $db->prepare('SELECT * FROM users WHERE name = ?');
		$get_auth->execute(array(htmlspecialchars($_COOKIE['USERNAME'])));

		$auth = $get_auth->fetch();

		if (
			$auth['name'] != $_COOKIE['USERNAME'] ||
			$auth['password'] != $_COOKIE['PASSWORD']
		) {
			header('Location: /logout/');
			exit;
		}
	}
}

/**
 * Check if the user has the perm to access to this page. This function have to be called **after** that the DB has been called.
 * @param mixed $perm You can use:
 * `ACCEPTED`, `ADMIN`, `FILES_UPDATER`, `BOOTSTRAP`, `MAINTENANCE`, `SEND_NEWS`, `EDIT_DEL_NEWS`, `BACKGROUND`
 */
function check_perm($perm): bool
{

	global $db;

	$get_user_perm = $db->prepare('SELECT * FROM users WHERE name = ? AND accepted = 1');
	$get_user_perm->execute(array(htmlspecialchars($_COOKIE['USERNAME'])));


	if ($user_perm = $get_user_perm->fetch()) {
		if ($user_perm[htmlspecialchars($perm)] == 1) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}


//! +------------------------------+
//! | HTML    									   |
//! +------------------------------+

/**
 * <meta> and <link>
 */
function html_head(): string
{
	return '
	<meta charset="UTF-8">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
	<link rel="stylesheet" href="/assets/css/main.css">
	<link rel="shortcut icon" href="/assets/img/fav.png">
	';
}

/**
 * Get the content of the file _config.json_, where there are the database infos and the server infos.
 * @param string $title The title of the page.
 */
function title($title): string
{
	return $title . " • " . get_config()->infos->serverName . " AdminTool";
}

/**
 * Generate the header of the page.
 * @param array $path The path of the page (../, ../../, etc.) WITH `get_lang()` and WITHOUT the current page.
 * @param string $title The title of the page WITH `get_lang()`.
 */
function html_header($path, $title): string
{
	$dot_dot_slash = '';
	$path_content = '';

	$reverse_path = array_reverse($path);

	foreach ($reverse_path as $value) {
		$dot_dot_slash .= '../';
		$path_content = '
		<a href="' . $dot_dot_slash . '">' . $value . '</a>&nbsp;
		<i class="fas fa-caret-right"></i>&nbsp;
		' . $path_content;
	}

	return '
		<p class="access">
			' . $path_content . '
			' . $title . '
		</p>

		<h3>' . $title . '</h3>
		<hr>
	';
}

/**
 * <footer> DO NOT USE ECHO
 */
function footer(): void
{
	include('footer.php');
}
