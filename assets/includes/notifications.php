<?php
$type = '';
$message = '';

if (isset($_GET['error']) || isset($_GET['success'])) {

	if (isset($_GET['error'])) {
		$type = 'Error';

		switch ($_GET['error']) {
			case 'login':
				$message = 'Invalid username or password';
				break;

			case 'empty fields':
				$message = 'Empty required field(s)';
				break;

			case 'username used':
				$message = 'This username is already used';
				break;

			case 'passwords mismatch':
				$message = 'Passwords mismatch';
				break;

			case 'too large file':
				$message = 'Too large file';
				break;

			case 'same version':
				$message = 'Please indicate a newer version';
				break;

			case 'user not found':
				$message = 'User not found';
				break;

			case 'invalid foldername':
				$message = 'Invalid folder name';
				break;

			case 'folder already existing':
				$message = 'This folder already exists';
				break;

			case 'invalid username':
				$message = 'Invalid username';
				break;

			case 'invalid password':
				$message = 'Invalid password';
				break;

			case 'password too long':
				$message = 'Password too long';
				break;

			case 'password long':
				$message = 'Password not long enough';
				break;

			default:
				$message = 'Unknown error; please try again';
				break;
		}
	}

	if (isset($_GET['success'])) {

		$type = 'Success';

		switch ($_GET['success']) {
			case 'login':
				$message = 'Welcome!';
				break;

			case 'info changed':
				$message = 'Information changed';
				break;

			case 'background uploaded':
				$message = 'Background uploaded';
				break;

			case 'bootstrap uploaded':
				$message = 'Bootstrap uploaded';
				break;

			case 'user accepted':
				$message = 'User accepted';
				break;

			case 'user deleted':
				$message = 'User deleted';
				break;

			case 'perms edited':
				$message = 'Permissions edited';
				break;

			case 'pin regenerated':
				$message = '3-digit password regenerated';
				break;

			case 'maintenance':
				$message = 'Maintenance status changed';
				break;

			case 'news sended':
				$message = 'News sended';
				break;

			case 'news deleted':
				$message = 'News deleted';
				break;

			case 'news edited':
				$message = 'News edited';
				break;

			case 'account created':
				$message = 'Account created';
				break;

			default:
				$message = 'Action worked';
				break;
		}
	}

?>

	<div id="notification" class="notification<?= isset($_GET['error']) ? ' error' : ' success' ?>">
		<i class="fas fa-times"></i><b><?= $type . ':</b> ' . $message ?>
	</div>

	<script>
		var fullUrl = window.location.href;
		stopIndex = fullUrl.indexOf("?");
		subUrl = fullUrl.substr(0, stopIndex);

		window.history.pushState({}, document.title, subUrl + "");

		let notification = document.getElementById('notification');

		notification.addEventListener('click', async () => {
			notification.style.animationName = 'fade-out';
			await sleepNotification(280);
			notification.remove();
		})

		function sleepNotification(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
	</script>

<?php

}

?>