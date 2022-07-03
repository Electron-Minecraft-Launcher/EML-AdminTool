/**
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

function deleteAccount() {
	if (confirm("Do you really want to delete you account? ?\nThis action is irreversible.")) {
		window.location.href = "./delete_account.php";
	}
}