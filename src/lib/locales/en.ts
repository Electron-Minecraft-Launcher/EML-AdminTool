import { NotificationCode } from '$lib/utils/notifications'

export default {
  l: 'en',
  language: 'English',
  common: {
    home: 'Home',
    back: `Back`,
    next: `Next`,
    finish: 'Finish',
    save: `Save`,
    cancel: `Cancel`,
    delete: `Delete`,
    username: `Username`,
    password: `Password`
  },
  notifications: {
    [NotificationCode.INVALID_INPUT]: `Invalid input.`,
    [NotificationCode.MISSING_INPUT]: `Missing input.`,
    [NotificationCode.UNAUTHORIZED]: `Unauthorized.`,
    [NotificationCode.FORBIDDEN]: `Forbidden.`,
    [NotificationCode.INVALID_REQUEST]: `Invalid request.`,
    [NotificationCode.NOT_FOUND]: `Not found.`,

    [NotificationCode.SETUP_INVALID_LANGUAGE]: `Language must be exactly 2 characters long.`,
    [NotificationCode.SETUP_DATABASE_PASSWORD_TOO_SHORT]: `Database password must be at least 12 characters long.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_SHORT]: `Admin username must be at least 2 characters long.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_LONG]: `Admin username must be at most 64 characters long.`,
    [NotificationCode.SETUP_ADMIN_PASSWORD_TOO_SHORT]: `Admin password must be at least 12 characters long.`,

    [NotificationCode.EMLAT_NAME_TOO_SHORT]: `EML AdminTool name must be at least 2 characters long.`,
    [NotificationCode.EMLAT_NAME_TOO_LONG]: `EML AdminTool name must be at most 64 characters long.`,
    [NotificationCode.EMLAT_INVALID_LANGUAGE]: `Language must be exactly 2 characters long.`,
    [NotificationCode.EMLAT_UPDATED]: `EML AdminTool has been updated successfully.`,
    [NotificationCode.EMLAT_UP_TO_DATE]: `EML AdminTool is up-to-date.`,
    [NotificationCode.EMLAT_UPDATE_FAILED]: `Failed to update EML AdminTool. Please see the logs for more details.`,
    [NotificationCode.EMLAT_RESET_FAILED]: `Failed to reset EML AdminTool. Please see the logs for more details.`,

    [NotificationCode.EDIT_USER_USERNAME_TOO_SHORT]: `Username must be at least 2 characters long.`,
    [NotificationCode.EDIT_USER_USERNAME_TOO_LONG]: `Username must be at most 64 characters long.`,

    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_SHORT]: `Username must be at least 2 characters long.`,
    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_LONG]: `Username must be at most 64 characters long.`,
    [NotificationCode.EDIT_ACCOUNT_PASSWORD_TOO_SHORT]: `Password must be at least 8 characters long.`,

    [NotificationCode.AUTH_SESSION_EXPIRED]: `Session expired, please log in again.`,
    [NotificationCode.AUTH_INVALID_SESSION]: `Invalid session, please log in again.`,

    [NotificationCode.LOGIN_BAD_CREDENTIALS]: `Bad credentials.`,
    [NotificationCode.LOGIN_USERNAME_TOO_SHORT]: `Username must be at least 2 characters long.`,
    [NotificationCode.LOGIN_USERNAME_TOO_LONG]: `Username must be at most 64 characters long.`,

    [NotificationCode.REGISTER_USERNAME_TOO_SHORT]: `Username must be at least 2 characters long.`,
    [NotificationCode.REGISTER_USERNAME_TOO_LONG]: `Username must be at most 64 characters long.`,
    [NotificationCode.REGISTER_PASSWORD_TOO_SHORT]: `Password must be at least 8 characters long.`,
    [NotificationCode.REGISTER_PIN_INVALID]: `PIN must be exactly 3 characters long.`,
    [NotificationCode.REGISTER_USERNAME_EXISTS]: `Username already exists.`,

    [NotificationCode.FILESUPDATER_VERSIONS_MISMATCH]: `Versions mismatch.`,
    [NotificationCode.FILESUPDATER_MINECRAFT_VERSION_NOT_FOUND]: `Minecraft version not found.`,
    [NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND]: `Loader version not found.`,
    [NotificationCode.FILESUPDATER_GAME_VERSION_NOT_FOUND]: `Game version not found.`,

    [NotificationCode.BOOTSTRAPS_MALFORMED_VERSION]: `The version specified in the YAML file is malformed.`,
    [NotificationCode.BOOTSTRAPS_INVALID_FILES]: `One or more uploaded bootstrap files are invalid.`,

    [NotificationCode.MAINTENANCE_INVALID_DATES]: `Maintenance dates are invalid. Start date must be before end date.`,

    [NotificationCode.NEWS_TITLE_TOO_SHORT]: `News title must be at least 1 character long.`,
    [NotificationCode.NEWS_TITLE_TOO_LONG]: `News title must be at most 255 characters long.`,

    [NotificationCode.NEWS_CATEGORY_NAME_TOO_SHORT]: `News category name must be at least 1 character long.`,
    [NotificationCode.NEWS_CATEGORY_NAME_TOO_LONG]: `News category name must be at most 64 characters long.`,
    [NotificationCode.NEWS_CATEGORY_ALREADY_EXISTS]: `News category already exists.`,

    [NotificationCode.NEWS_TAG_NAME_TOO_SHORT]: `News tag name must be at least 1 character long.`,
    [NotificationCode.NEWS_TAG_NAME_TOO_LONG]: `News tag name must be at most 64 characters long.`,
    [NotificationCode.NEWS_TAG_ALREADY_EXISTS]: `News tag already exists.`,

    [NotificationCode.BACKGROUND_NAME_TOO_SHORT]: `Background name must be at least 1 character long.`,
    [NotificationCode.BACKGROUND_NAME_TOO_LONG]: `Background name must be at most 255 characters long.`,
    [NotificationCode.BACKGROUND_INVALID_STATUS]: `Background status is invalid.`,
    [NotificationCode.BACKGROUND_ALREADY_EXISTS]: `Background with this name already exists.`,

    [NotificationCode.DATABASE_ERROR]: `Database error.`,
    [NotificationCode.UPDATER_ERROR]: `Updater error.`,
    [NotificationCode.FILE_SYSTEM_ERROR]: `File system error.`,
    [NotificationCode.INTERNAL_SERVER_ERROR]: `Unexpected error.`,
    [NotificationCode.EXTERNAL_API_ERROR]: `External API error.`,
    [NotificationCode.NETWORK_ERROR]: `Network error. Please check your internet connection and try again.`
  },
  setup: {
    setup: `Setup`,
    step1: {
      title: `Firstly, choose the language of your EML&nbsp;AdminTool:`,
      subtitle: `This language will be applied for all users.`,
      other: `I speak another language.`,
      modal: {
        title: `You speak another language?`,
        content: `EML AdminTool is currently available in only five languages.<br>
However, we are thrilled to see that this project is reaching more and more people in different countries!<br>
<br>
Therefore, if you would like to help us translate EML AdminTool, you can find the JSON files on our GitHub and a guide on how to submit your translation. If it is accepted, it will be included as a default option in a future version of EML AdminTool!`,
        more: `More`
      }
    },
    step2: {
      title: `Now, choose a password for your Database:`,
      subtitle: `You will not need to remember it.`,
      placeholder: `Database password`,
      generate: `Generate`,
      veryWeak: `Very weak`,
      weak: `Weak`,
      medium: `Medium`,
      strong: `Strong`,
      veryStrong: `Very strong`,
      unwantedChars: `Unwanted characters detected. Please avoid using " / \\ + & # % ? = : @ in your password.`
    },
    step3: {
      title: `Then, choose your server name and a password:`,
      subtitle: `This server name and password will be your admin account login.`,
      confirmPassword: `Confirm password`
    },
    finally: 'You can now use EML&nbsp;AdminTool!'
  },
  auth: {
    login: `Log in`,
    register: `Register`,
    confirmPassword: `Confirm password`,
    createAccount: `Create an account here.`,
    logInHere: `Log in here.`,
    pin: `PIN`
  },
  leftPanel: {
    settings: `Settings`,
    features: `Features`,
    logout: `Log out`
  },
  dashboard: {
    welcome: `Welcome, {{username}}!`,
    time: `Server time`,
    serverStatus: `Server status`,
    undefinedServer: `The Minecraft server information is not defined.`,
    launcherStatus: `Launcher status`,
    emlatSettings: {
      title: `EML AdminTool settings`,
      info: {
        title: `Information`,
        atName: `AdminTool name`,
        language: `Language`,
        pin: `PIN`,
        nbUsers: `Number of users`,
        modal: {
          title: `Edit EML AdminTool information`,
          atName: `AdminTool name`,
          nameWarn: `Changing EML AdminTool name also changes your username!`,
          language: `Language`,
          pin: `PIN`,
          regeneratePin: `Regenerate PIN`
        }
      },
      userManagement: {
        title: `User management`,
        users: `Users`,
        pendingUsers: `Pending users`,
        wrongPinUsers: `Wrong-PIN users`,
        deletedUsers: `Deleted users`,
        infoOf: `{{username}}'s information`,
        permissions: `Permissions`,
        refuseUser: `Refuse user`,
        refuseUserWarning: `Are you sure you want to refuse this user? The user will not be able to access EML AdminTool anymore.`,
        deleteUserWarning: `Are you sure you want to delete this user?
        The user will not be able to access EML AdminTool anymore. However, the user's actions and data will not be deleted.`,
        deleteUserForeverWarning: `Are you sure you want to delete this user forever?
        All the user's actions and data will be deleted, including published news. This action is irreversible.`,
        modal: {
          title: `Edit user information`,
          acceptUser: `Accept user`,
          permissions: `Permissions`
        }
      },
      instanceManagement: {
        title: `Instance management`,
        instances: `Instances`,
        modal: {
          title: `Edit instance information`,
          addInstance: `Add instance`,
          instanceName: `Instance name`,
          instanceSlug: `Instance ID`,
          ip: `IP address or domain name`,
          port: `Port`,
          minecraftVersion: `Minecraft version`,
          minecraftVersionInfo: `If your Minecraft server is compatible with multiple Minecraft versions, you should choose the highest Minecraft version it is compatible with.`,
        }
      },
      update: {
        title: `Update`,
        currentVersion: `Current version`,
        latestVersion: `Latest version`,
        releasedOn: `Released on {{date}}`,
        openGithub: `Open GitHub`,
        runUpdate: `Run update`
      },
      vpsAndDockerInfo: {
        title: `VPS & Docker information`,
        dockerInfo: `Docker information`,
        storage: `Storage`
      },
      dangerZone: {
        title: `Danger zone`,
        reset: `Reset EML AdminTool`,
        resetEMLATWarning: `Are you sure you want to reset EML AdminTool? All the data will be lost and EML AdminTool will be reset to its initial state. This action is irreversible.
Moreover, be sure that nobody can access EML AdminTool during the reset: EML AdminTool is not protected during the setup!`,
        areYouSure: `Are you sure?`
      }
    },
    account: {
      title: `Account settings`,
      info: {
        title: `Account information`,
        accountType: `Account type`,
        modal: {
          title: `Edit account information`,
          usernameWarn: `Changing your username will also change the EML AdminTool name!`,
          leaveBlankPassword: `Leave blank if you don't want to change your password.`,
          newPassword: `New password`,
          confirmPassword: `Confirm password`
        }
      },
      permissions: {
        title: `Permissions`
      },
      dangerZone: {
        title: `Danger zone`,
        deleteAccount: `Delete account`,
        deleteAccountWarning: `Are you sure you want to delete your account? You will not be able to access EML AdminTool anymore. However, your actions and data will not be deleted.`
      }
    },
    filesUpdater: {
      fileName: `File name`,
      size: `Size`,
      b: `B`
    }
  }
}
