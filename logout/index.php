<?php
setcookie("USERNAME", "", time() + 0, "/", "", false, true);
setcookie("PASSWORD", "", time() + 0, "/", "", false, true);
header('Location: ../');