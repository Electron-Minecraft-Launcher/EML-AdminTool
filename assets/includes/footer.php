<footer class="center">
	<?php
	if (strpos($_SERVER['REQUEST_URI'], "/help") !== false) {
	?>
		<p class="center" style="margin-bottom: 0;"><a href="/"><?= get_lang()->main->home ?></a></p>
	<?php
	} else {
	?>
		<p class="center" style="margin-bottom: 0;"><a href="/help"><?= get_lang()->main->documentation ?></a></p>
	<?php
	}
	?>
	<p class="center" style="margin-top: 0;">2022 • EML AdminTool • v<?= get_current_version() ?></p>
</footer>