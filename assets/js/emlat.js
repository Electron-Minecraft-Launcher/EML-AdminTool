/** 
 * @copyright Copyright (c) 2022, GoldFrite
 * @license GNU GPLv3
 */

function deleteUser(url) {
	if (confirm("Do you really want to delete this user?")) {
		window.location.href = url;
	}
}

/**
 * Reset the EML AdminTool.
 */
function resetEMLAT() {
	if (confirm("Do you really want to reset the EML AdminTool?\nThis will delete all the data in the EML AdminTool and require its reconfiguration.")) {
		if (confirm("Are you sure you really want to reset the EML AdminTool?\nYour current data, including user accounts, Updater files, Bootstrap files, and other options, will be deleted. Also, this action does not update the EML AdminTool.")) {
			window.location.href = "./reset_emlat.php";
		}
	}
}

/**
 * Update the EML AdminTool.
 * @param {bool} resetAPI If true, the API will be reseted
 * @param {bool} resetConfigAndDataBase If true, the config and data base will be reseted
 */
function updateEMLAT(resetAPI, resetConfigAndDataBase) {

	if (resetAPI && !resetConfigAndDataBase) {
		if (confirm("IMPORTANT\nThis update will remove data from the Files Updater, Bootstrap and Background options.\nIt is strongly advised to make a backup of the data in question before proceeding (a tutorial is available in the Documentation).\nDo you want to perform the update now?")) {
			if (confirm("Are you really sure you want to update the EML AdminTool now? If you haven't made a backup, you will definitely lose the Files Updater, Bootstrap and Background options files.\n\nThe update should not take more than a few seconds.")) {
				window.location.href = "/upgrade/";
			}
		}
	} else if (!resetAPI && resetConfigAndDataBase) {
		if (confirm("IMPORTANT\This update will delete the data of the Database and the configuration of your EML AdminTool.\nIt is strongly advised to make a backup of the data in question before continuing (a tutorial is available in the Documentation).\nDo you want to perform the update now?")) {
			if (confirm("Are you really sure you want to update the EML AdminTool now? If you haven't made a backup, you will definitely lose the data of the Database and the configuration file.\n\The update should not take more than a few seconds.")) {
				window.location.href = "/upgrade/";
			}
		}
	} else if (resetAPI && resetConfigAndDataBase) {
		if (confirm("IMPORTANT\nThis update will delete the data:\n - the Database\n - the configuration of your EML AdminTool\n - Files Updater, Bootstrap and Background options.\nIt is strongly advised to make a backup of the data in question before continuing (a tutorial is available in the Documentation).\nDo you want to update now?")) {
			if (confirm("Are you really sure you want to update the EML AdminTool now? If you haven't made a backup, you will definitely lose the data previously listed.\n\nThe update should not take more than a few seconds.")) {
				window.location.href = "/upgrade/";
			}
		}
	} else {
		if (confirm("Are you sure you want to update the EML AdminTool now?\n\The update should not take more than a few seconds.")) {
			window.location.href = "/upgrade/";
		}
	}

}


let caret = document.getElementById('caret');
let updatesListHeight = document.getElementById('updates-list').offsetHeight;
let updatesList = document.getElementById('updates-list');
updatesList.style.height = "0px";

caret.addEventListener("click", async () => {

	if (caret.style.transform == "rotate(90deg)") {

		caret.style.transform = "rotate(0deg)"
		updatesList.style.height = "0px"
		updatesList.style.opacity = "0"

	} else {

		caret.style.transform = "rotate(90deg)"
		updatesList.style.height = updatesListHeight + "px"
		updatesList.style.opacity = "1"

	}

})