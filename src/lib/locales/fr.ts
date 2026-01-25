/**
 * Translated by GoldFrite
 */

import { NotificationCode } from '$lib/utils/notifications'

export default {
  l: 'fr',
  language: 'Français',
  common: {
    home: 'Accueil',
    back: `Retour`,
    next: `Suivant`,
    finish: 'Terminer',
    save: `Sauvegarder`,
    cancel: `Annuler`,
    delete: `Supprimer`,
    username: `Nom d'utilisateur`,
    password: `Mot de passe`
  },
  notifications: {
    [NotificationCode.INVALID_INPUT]: `Entrée invalide.`,
    [NotificationCode.MISSING_INPUT]: `Entrée manquante.`,
    [NotificationCode.UNAUTHORIZED]: `Non autorisé.`,
    [NotificationCode.FORBIDDEN]: `Interdit.`,
    [NotificationCode.INVALID_REQUEST]: `Requête invalide.`,
    [NotificationCode.NOT_FOUND]: `Introuvable.`,

    [NotificationCode.SETUP_INVALID_LANGUAGE]: `La langue doit faire exactement 2 caractères.`,
    [NotificationCode.SETUP_DATABASE_PASSWORD_TOO_SHORT]: `Le mot de passe de la base de données doit faire au moins 12 caractères.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_SHORT]: `Le nom d'utilisateur admin doit faire au moins 2 caractères.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_LONG]: `Le nom d'utilisateur admin doit faire au plus 64 caractères.`,
    [NotificationCode.SETUP_ADMIN_PASSWORD_TOO_SHORT]: `Le mot de passe admin doit faire au moins 12 caractères.`,

    [NotificationCode.EMLAT_NAME_TOO_SHORT]: `Le nom de l'EML AdminTool doit faire au moins 2 caractères.`,
    [NotificationCode.EMLAT_NAME_TOO_LONG]: `Le nom de l'EML AdminTool doit faire au plus 64 caractères.`,
    [NotificationCode.EMLAT_INVALID_LANGUAGE]: `La langue doit faire exactement 2 caractères.`,
    [NotificationCode.EMLAT_UPDATED]: `L'EML AdminTool a été mis à jour avec succès.`,
    [NotificationCode.EMLAT_UP_TO_DATE]: `L'EML AdminTool est à jour.`,
    [NotificationCode.EMLAT_UPDATE_FAILED]: `Échec de la mise à jour de l'EML AdminTool. Veuillez consulter les logs pour plus de détails.`,
    [NotificationCode.EMLAT_RESET_FAILED]: `Échec de la réinitialisation de l'EML AdminTool. Veuillez consulter les logs pour plus de détails.`,

    [NotificationCode.EDIT_USER_USERNAME_TOO_SHORT]: `Le nom d'utilisateur doit faire au moins 2 caractères.`,
    [NotificationCode.EDIT_USER_USERNAME_TOO_LONG]: `Le nom d'utilisateur doit faire au plus 64 caractères.`,

    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_SHORT]: `Le nom d'utilisateur doit faire au moins 2 caractères.`,
    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_LONG]: `Le nom d'utilisateur doit faire au plus 64 caractères.`,
    [NotificationCode.EDIT_ACCOUNT_PASSWORD_TOO_SHORT]: `Le mot de passe doit faire au moins 8 caractères.`,

    [NotificationCode.AUTH_SESSION_EXPIRED]: `Session expirée, veuillez vous reconnecter.`,
    [NotificationCode.AUTH_INVALID_SESSION]: `Session invalide, veuillez vous reconnecter.`,

    [NotificationCode.LOGIN_BAD_CREDENTIALS]: `Identifiants incorrects.`,
    [NotificationCode.LOGIN_USERNAME_TOO_SHORT]: `Le nom d'utilisateur doit faire au moins 2 caractères.`,
    [NotificationCode.LOGIN_USERNAME_TOO_LONG]: `Le nom d'utilisateur doit faire au plus 64 caractères.`,

    [NotificationCode.REGISTER_USERNAME_TOO_SHORT]: `Le nom d'utilisateur doit faire au moins 2 caractères.`,
    [NotificationCode.REGISTER_USERNAME_TOO_LONG]: `Le nom d'utilisateur doit faire au plus 64 caractères.`,
    [NotificationCode.REGISTER_PASSWORD_TOO_SHORT]: `Le mot de passe doit faire au moins 8 caractères.`,
    [NotificationCode.REGISTER_PIN_INVALID]: `Le code de sécurité doit faire exactement 3 caractères.`,
    [NotificationCode.REGISTER_USERNAME_EXISTS]: `Ce nom d'utilisateur existe déjà.`,

    [NotificationCode.FILESUPDATER_VERSIONS_MISMATCH]: `Versions discordantes.`,
    [NotificationCode.FILESUPDATER_MINECRAFT_VERSION_NOT_FOUND]: `Version Minecraft introuvable.`,
    [NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND]: `Version du loader introuvable.`,
    [NotificationCode.FILESUPDATER_GAME_VERSION_NOT_FOUND]: `Version de jeu introuvable.`,

    [NotificationCode.BOOTSTRAPS_MALFORMED_VERSION]: `La version spécifiée dans le fichier YAML est malformée.`,
    [NotificationCode.BOOTSTRAPS_INVALID_FILES]: `Un ou plusieurs fichiers de bootstrap sont invalides.`,

    [NotificationCode.MAINTENANCE_INVALID_DATES]: `Dates de maintenance invalides. La date de début doit être avant la date de fin.`,

    [NotificationCode.NEWS_TITLE_TOO_SHORT]: `Le titre doit faire au moins 1 caractère.`,
    [NotificationCode.NEWS_TITLE_TOO_LONG]: `Le titre doit faire au plus 255 caractères.`,

    [NotificationCode.NEWS_CATEGORY_NAME_TOO_SHORT]: `Le nom de la catégorie doit faire au moins 1 caractère.`,
    [NotificationCode.NEWS_CATEGORY_NAME_TOO_LONG]: `Le nom de la catégorie doit faire au plus 64 caractères.`,
    [NotificationCode.NEWS_CATEGORY_ALREADY_EXISTS]: `Cette catégorie existe déjà.`,

    [NotificationCode.NEWS_TAG_NAME_TOO_SHORT]: `Le nom du tag doit faire au moins 1 caractère.`,
    [NotificationCode.NEWS_TAG_NAME_TOO_LONG]: `Le nom du tag doit faire au plus 64 caractères.`,
    [NotificationCode.NEWS_TAG_ALREADY_EXISTS]: `Ce tag existe déjà.`,

    [NotificationCode.BACKGROUND_NAME_TOO_SHORT]: `Le nom du fond d'écran doit faire au moins 1 caractère.`,
    [NotificationCode.BACKGROUND_NAME_TOO_LONG]: `Le nom du fond d'écran doit faire au plus 255 caractères.`,
    [NotificationCode.BACKGROUND_INVALID_STATUS]: `Statut invalide.`,
    [NotificationCode.BACKGROUND_ALREADY_EXISTS]: `Un fond d'écran avec ce nom existe déjà.`,

    [NotificationCode.DATABASE_ERROR]: `Erreur de base de données.`,
    [NotificationCode.UPDATER_ERROR]: `Erreur de l'updater.`,
    [NotificationCode.FILE_SYSTEM_ERROR]: `Erreur système de fichiers.`,
    [NotificationCode.INTERNAL_SERVER_ERROR]: `Erreur inattendue.`,
    [NotificationCode.EXTERNAL_API_ERROR]: `Erreur API externe.`
  },
  setup: {
    setup: `Configuration`,
    step1: {
      title: `D'abord, choisissez la langue de votre EML&nbsp;AdminTool&nbsp;:`,
      subtitle: `Cette langue sera appliquée pour tous les utilisateurs.`,
      other: `Je parle une autre langue.`,
      modal: {
        title: `Vous parlez une autre langue ?`,
        content: `L'EML AdminTool est n'actuellement disponible qu'en cinq langues.<br>
Cependant, nous sommes ravis de voir que ce projet atteint de plus en plus de personnes dans différents pays !<br>
<br>
Ainsi, si vous souhaitez nous aider à traduire l'EML AdminTool, vous pourrez trouver les fichiers JSON sur notre GitHub et un guide vous expliquant comment soumettre votre traduction. Si elle est acceptée, elle sera incluse par défaut dans une future version de l'EML AdminTool !`,
        more: `Plus`
      }
    },
    step2: {
      title: `Maintenant, choisissez un mot de passe pour la base de données :`,
      subtitle: `Vous n'aurez pas besoin de le retenir.`,
      placeholder: `Mot de passe de la base de données`,
      generate: `Générer`,
      veryWeak: `Très faible`,
      weak: `Faible`,
      medium: `Moyen`,
      strong: `Fort`,
      veryStrong: `Très fort`
    },
    step3: {
      title: `Ensuite, choisissez le nom de votre serveur et un mot de passe :`,
      subtitle: `Ce nom de serveur et ce mot de passe seront vos identifiants administrateur.`,
      confirmPassword: `Confirmer le mot de passe`
    },
    finally: `Vous pouvez maintenant utiliser l'EML&nbsp;AdminTool !`
  },
  auth: {
    login: `Connexion`,
    register: `S'inscrire`,
    confirmPassword: `Confirmer le mot de passe`,
    createAccount: `Créer un compte ici.`,
    logInHere: `Se connecter ici.`,
    pin: `Code de sécurité`
  },
  leftPanel: {
    settings: `Paramètres`,
    features: `Fonctionnalités`,
    logout: `Déconnexion`
  },
  dashboard: {
    welcome: `Bienvenue, {{username}} !`,
    emlatSettings: {
      title: `Paramètres de l'EML AdminTool`,
      info: {
        title: `Informations`,
        atName: `Nom de l'AdminTool`,
        language: `Langue`,
        pin: `Code de sécurité`,
        nbUsers: `Nombre d'utilisateurs`,
        modal: {
          title: `Modifier les informations de l'EML AdminTool`,
          atName: `Nom de l'AdminTool`,
          nameWarn: `Changer le nom de l'EML AdminTool change également votre nom d'utilisateur !`,
          language: `Langue`,
          pin: `Code de sécurité`,
          regeneratePin: `Régénérer le code de sécurité`
        }
      },
      usersManagement: {
        title: `Gestion des utilisateurs`,
        users: `Utilisateurs`,
        pendingUsers: `Utilisateurs en attente`,
        wrongPinUsers: `Code de sécurité erroné`,
        deletedUsers: `Utilisateurs supprimés`,
        infoOf: `Informations de {{username}}`,
        permissions: `Permissions`,
        refuseUser: `Refuser l'utilisateur`,
        refuseUserWarning: `Êtes-vous sûr de vouloir refuser cet utilisateur ? Il ne pourra plus accéder à l'EML AdminTool.`,
        deleteUserWarning: `Êtes-vous sûr de vouloir supprimer cet utilisateur ?
        L'utilisateur ne pourra plus accéder à l'EML AdminTool. Cependant, ses actions et données ne seront pas supprimées.`,
        deleteUserForeverWarning: `Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?
        Toutes ses actions et données seront supprimées, y compris les news publiées. Cette action est irréversible.`,
        modal: {
          title: `Modifier l'utilisateur`,
          acceptUser: `Accepter l'utilisateur`,
          permissions: `Permissions`
        }
      },
      update: {
        title: `Mise à jour`,
        currentVersion: `Version actuelle`,
        latestVersion: `Dernière version`,
        releasedOn: `Publiée le {{date}}`,
        openGithub: `Voir sur GitHub`,
        runUpdate: `Mettre à jour`
      },
      vpsAndDockerInfo: {
        title: `Informations VPS & Docker`,
        dockerInfo: `Informations Docker`,
        storage: `Stockage`
      },
      dangerZone: {
        title: `Zone de danger`,
        reset: `Réinitialiser l'EML AdminTool`,
        resetEMLATWarning: `Êtes-vous sûr de vouloir réinitialiser l'EML AdminTool ? Toutes les données seront perdues et l'outil reviendra à son état initial. Cette action est irréversible.
De plus, assurez-vous que personne ne puisse accéder à l'EML AdminTool pendant la réinitialisation : l'outil n'est pas protégé durant la configuration !`,
        areYouSure: `Êtes-vous sûr ?`
      }
    },
    account: {
      title: `Paramètres du compte`,
      info: {
        title: `Informations du compte`,
        accountType: `Type de compte`,
        modal: {
          title: `Modifier les informations du compte`,
          usernameWarn: `Changer votre nom d'utilisateur changera également le nom de l'EML AdminTool !`,
          leaveBlankPassword: `Laissez vide si vous ne souhaitez pas changer votre mot de passe.`,
          newPassword: `Nouveau mot de passe`,
          confirmPassword: `Confirmer le mot de passe`
        }
      },
      permissions: {
        title: `Permissions`
      },
      dangerZone: {
        title: `Zone de danger`,
        deleteAccount: `Supprimer le compte`,
        deleteAccountWarning: `Êtes-vous sûr de vouloir supprimer votre compte ? Vous ne pourrez plus accéder à l'EML AdminTool. Cependant, vos actions et données ne seront pas supprimées.`
      }
    },
    filesUpdater: {
      fileName: `Nom du fichier`,
      size: `Taille`,
      b: `o`
    }
  }
}
