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
				$path = preg_replace("/^files\//", "", $dir . "/" . $value);
				$size = filesize($dir . "/" . $value);
				$sha1 = hash_file('sha1', $dir . "/" . $value);
				$url = "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] . $dir . "/" . $value;
				if (strpos($path, "libraries")) {
					$type = "LIBRARY";
				} else if (strpos($path, "mods")) {
					$type = "MOD";
				} else if (strpos($path, "versions")) {
					$type = "VERIONSCUSTOM";
				} else {
					$type = "FILE";
				}

				array_push($files_array, array(
					"path" => $path,
					"size" => $size,
					"sha1" => $sha1,
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
