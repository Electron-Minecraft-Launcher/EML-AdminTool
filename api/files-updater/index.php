<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */


header("Content-Type: application/json; charset=UTF-8");

$files_array = [];

function dir_to_array($dir): void
{
	global $files_array;

	$cdir = scandir($dir);

	foreach ($cdir as $value) {

		if (!in_array($value, array(".", ".."))) {
			if (is_dir($dir . "/" . $value)) {
				dir_to_array($dir . "/" . $value);
			} else {
				$hash = hash_file('sha1', $dir . "/" . $value);
				$size = filesize($dir . "/" . $value);
				$path = str_replace("files/", "", $dir . "/" . $value);
				$url = "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] . $dir . "/" . $value;
				if (strpos($path, "libraries") !== false) {
					$type = "LIBRARY";
				} else if (strpos($path, "mods") !== false) {
					$type = "MOD";
				} else if (strpos($path, "versions") !== false) {
					$type = "VERIONSCUSTOM";
				} else {
					$type = "FILE";
				}

				array_push($files_array, array(
					"hash" => $hash,
					"size" => $size,
					"path" => $path,
					"url" => $url,
					"type" => $type
				));
			}
		}
	}
}

dir_to_array("files");


echo json_encode(
	$files_array
);
