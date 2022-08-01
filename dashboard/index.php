<?php

/** 
 * @copyright Copyright (c) 2022, GoldFrite and ZeGamer.c
 * @license GNU GPLv3
 */

include '../assets/includes/main.php';
check_config();
check_auth();

?>

<!DOCTYPE html>
<html lang="<?= get_current_lang() ?>">

<head>
  <?= html_head() ?>
  <link rel="stylesheet" href="../assets/css/dashboard.css">
  <title><?= title(get_lang()->main->home) ?></title>
</head>

<body>

  <h1 class="center">
    <span id="h1" style="cursor: pointer;">
      <?= get_config()['info']['server_name'] ?> AdminTool&nbsp;&nbsp;<i id="caret" class="fas fa-caret-right" style="transform: rotate(0deg); transition: transform 0.3s"></i>
    </span>
  </h1>

  <div class="user-info center" id="user-info" style="height: 0px; opacity: 0">

    <div style="display: inline-block">
      <p style="margin-bottom: 0"><?= get_lang()->dashboard->loggedAs ?></p>
      <h4 style="margin-top: 3px"><?= get_username() ?></h4>
    </div>

    <div style="display: inline-block; margin-left: 20px;">
      <a href="/dashboard/account/" class="no-underline"><button class="small"><?= get_lang()->dashboard->manageAccount ?></button></a>
    </div>

    <div style="display: inline-block; margin-left: 20px;">
      <a href="/logout/" class="no-underline"><button class="logout"><?= get_lang()->dashboard->logout ?></button></a>
    </div>

    <?php
    if (check_perm(ADMIN)) {
    ?>

      <div style="display: inline-block; margin-left: 20px; height: 45px; width: 1px; background: white"></div>

      <div style="display: inline-block; margin-left: 20px;">
        <a href="/dashboard/emlat" class="no-underline"><button class="small"><?= get_lang()->dashboard->emlatManagement ?></button></a>
      </div>

    <?php
    }
    ?>

    <div style="display: inline-block; margin-left: 20px; height: 45px; width: 1px; background: white"></div>

    <div style="display: inline-block; margin-left: 20px;">
      <a href="/dashboard/internal-version" class="no-underline"><button class="small"><?= get_lang()->dashboard->launcherInternalVersion ?></button></a>
    </div>

    <?php
    if (check_perm(ADMIN)) {
    ?>

      <div style="display: inline-block; margin-left: 20px; height: 45px; width: 1px; background: white"></div>

      <div style="display: inline-block; margin-left: 20px;">
        <a href="/phpinfo/" target="_blank" class="no-underline"><button class="small"><?= get_lang()->dashboard->phpinfo ?></button></a>
      </div>

    <?php

    }

    ?>

  </div>

  <h5 class="center"><?= get_lang()->dashboard->launcherManagement ?></h5>

  <div class="center" style="height: 280px">

    <?php

    define('ERR_PERM_MSG', get_lang()->dashboard->error);

    if (!check_perm(ACCEPTED)) {
      echo ERR_PERM_MSG;
    } else if (
      !check_perm(FILES_UPDATER) &&
      !check_perm(BOOTSTRAP) &&
      !check_perm(MAINTENANCE) &&
      !check_perm(SEND_NEWS) &&
      !check_perm(EDIT_DEL_NEWS) &&
      !check_perm(BACKGROUND) &&
      check_perm(ACCEPTED)
    ) {
      echo ERR_PERM_MSG;
    } else {
      if (check_perm(FILES_UPDATER)) {
    ?>

        <button class="emlat-option">
          <a style="text-decoration: none" href="./files-updater">
            <img class="emlat-option" alt="Files Updater" src="../assets/img/emlat-files-updater.png">
            <p class="emlat-option">Files Updater</p>
          </a>
        </button>

      <?php
      }

      if (check_perm(BOOTSTRAP)) {
      ?>
        <button class="emlat-option">
          <a style="text-decoration: none" href="./bootstrap">
            <img class="emlat-option" alt="Bootstrap" src="../assets/img/emlat-bootstrap.png">
            <p class="emlat-option">Bootstrap</p>
          </a>
        </button>

      <?php
      }

      if (check_perm(MAINTENANCE)) {
      ?>

        <button class="emlat-option">
          <a style="text-decoration: none" href="./maintenance">
            <img class="emlat-option" alt="Maintenance" src="../assets/img/emlat-maintenance.png">
            <p class="emlat-option">Maintenance</p>
          </a>
        </button>

      <?php
      }

      if (check_perm(SEND_NEWS) || check_perm(EDIT_DEL_NEWS)) {
      ?>

        <button class="emlat-option">
          <a style="text-decoration: none" href="./news">
            <img class="emlat-option" alt="News" src="../assets/img/emlat-news.png">
            <p class="emlat-option">News</p>
          </a>
        </button>

      <?php
      }

      if (check_perm(BACKGROUND)) {
      ?>

        <button class="emlat-option">
          <a style="text-decoration: none" href="./background">
            <img class="emlat-option" alt="Background" src="../assets/img/emlat-background.png">
            <p class="emlat-option">Background</p>
          </a>
        </button>

    <?php
      }
    }
    ?>

  </div>


  <?php footer() ?>

  <script src="../assets/js/dashboard.js"></script>

</body>

</html>