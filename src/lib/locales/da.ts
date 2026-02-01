/**
 * Translated by Quacksometi
 */

import { NotificationCode } from '$lib/utils/notifications'

export default {
  l: 'da',
  language: 'Dansk',
  common: {
    home: 'Hjem',
    back: `Tilbage`,
    next: `Næste`,
    finish: 'Afslut',
    save: `Gem`,
    cancel: `Annuller`,
    delete: `Slet`,
    username: `Brugernavn`,
    password: `Adgangskode`
  },
  notifications: {
    [NotificationCode.INVALID_INPUT]: `Ugyldigt input.`,
    [NotificationCode.MISSING_INPUT]: `Manglende input.`,
    [NotificationCode.UNAUTHORIZED]: `Uautoriseret.`,
    [NotificationCode.FORBIDDEN]: `Forbudt.`,
    [NotificationCode.INVALID_REQUEST]: `Ugyldig anmodning.`,
    [NotificationCode.NOT_FOUND]: `Ikke fundet.`,

    [NotificationCode.SETUP_INVALID_LANGUAGE]: `Sproget skal være præcis 2 tegn langt.`,
    [NotificationCode.SETUP_DATABASE_PASSWORD_TOO_SHORT]: `Databaseadgangskoden skal være mindst 12 tegn lang.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_SHORT]: `Adminbrugernavnet skal være mindst 2 tegn langt.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_LONG]: `Adminbrugernavnet må højst være 64 tegn langt.`,
    [NotificationCode.SETUP_ADMIN_PASSWORD_TOO_SHORT]: `Adminadgangskoden skal være mindst 12 tegn lang.`,

    [NotificationCode.EMLAT_NAME_TOO_SHORT]: `Navnet på EML AdminTool skal være mindst 2 tegn langt.`,
    [NotificationCode.EMLAT_NAME_TOO_LONG]: `Navnet på EML AdminTool må højst være 64 tegn langt.`,
    [NotificationCode.EMLAT_INVALID_LANGUAGE]: `Sproget skal være præcis 2 tegn langt.`,
    [NotificationCode.EMLAT_UPDATED]: `EML AdminTool er blevet opdateret.`,
    [NotificationCode.EMLAT_UP_TO_DATE]: `EML AdminTool er opdateret.`,
    [NotificationCode.EMLAT_UPDATE_FAILED]: `Kunne ikke opdatere EML AdminTool. Se venligst logfilerne for flere detaljer.`,
    [NotificationCode.EMLAT_RESET_FAILED]: `Kunne ikke nulstille EML AdminTool. Se venligst logfilerne for flere detaljer.`,

    [NotificationCode.EDIT_USER_USERNAME_TOO_SHORT]: `Brugernavnet skal være mindst 2 tegn langt.`,
    [NotificationCode.EDIT_USER_USERNAME_TOO_LONG]: `Brugernavnet må højst være 64 tegn langt.`,

    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_SHORT]: `Brugernavnet skal være mindst 2 tegn langt.`,
    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_LONG]: `Brugernavnet må højst være 64 tegn langt.`,
    [NotificationCode.EDIT_ACCOUNT_PASSWORD_TOO_SHORT]: `Adgangskoden skal være mindst 8 tegn lang.`,

    [NotificationCode.AUTH_SESSION_EXPIRED]: `Session udløbet, log ind igen.`,
    [NotificationCode.AUTH_INVALID_SESSION]: `Ugyldig session, log ind igen.`,

    [NotificationCode.LOGIN_BAD_CREDENTIALS]: `Forkerte legitimationsoplysninger.`,
    [NotificationCode.LOGIN_USERNAME_TOO_SHORT]: `Brugernavnet skal være mindst 2 tegn langt.`,
    [NotificationCode.LOGIN_USERNAME_TOO_LONG]: `Brugernavnet må højst være 64 tegn langt.`,

    [NotificationCode.REGISTER_USERNAME_TOO_SHORT]: `Brugernavnet skal være mindst 2 tegn langt.`,
    [NotificationCode.REGISTER_USERNAME_TOO_LONG]: `Brugernavnet må højst være 64 tegn langt.`,
    [NotificationCode.REGISTER_PASSWORD_TOO_SHORT]: `Adgangskoden skal være mindst 8 tegn lang.`,
    [NotificationCode.REGISTER_PIN_INVALID]: `PIN skal være præcis 3 tegn lang.`,
    [NotificationCode.REGISTER_USERNAME_EXISTS]: `Brugernavnet findes allerede.`,

    [NotificationCode.FILESUPDATER_VERSIONS_MISMATCH]: `Versionsuoverensstemmelse.`,
    [NotificationCode.FILESUPDATER_MINECRAFT_VERSION_NOT_FOUND]: `Minecraft-version ikke fundet.`,
    [NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND]: `Loader-version ikke fundet.`,
    [NotificationCode.FILESUPDATER_GAME_VERSION_NOT_FOUND]: `Spilversion ikke fundet.`,

    [NotificationCode.BOOTSTRAPS_MALFORMED_VERSION]: `Versionen angivet i YAML-filen er forkert udformet.`,
    [NotificationCode.BOOTSTRAPS_INVALID_FILES]: `En eller flere uploadede bootstrap-filer er ugyldige.`,

    [NotificationCode.MAINTENANCE_INVALID_DATES]: `Vedligeholdelsesdatoer er ugyldige. Startdatoen skal være før slutdatoen.`,

    [NotificationCode.NEWS_TITLE_TOO_SHORT]: `Nyhedstitlen skal være mindst 1 tegn lang.`,
    [NotificationCode.NEWS_TITLE_TOO_LONG]: `Nyhedstitlen må højst være 255 tegn lang.`,

    [NotificationCode.NEWS_CATEGORY_NAME_TOO_SHORT]: `Kategorinavnet skal være mindst 1 tegn langt.`,
    [NotificationCode.NEWS_CATEGORY_NAME_TOO_LONG]: `Kategorinavnet må højst være 64 tegn langt.`,
    [NotificationCode.NEWS_CATEGORY_ALREADY_EXISTS]: `Nyhedskategori findes allerede.`,

    [NotificationCode.NEWS_TAG_NAME_TOO_SHORT]: `Tag-navnet skal være mindst 1 tegn langt.`,
    [NotificationCode.NEWS_TAG_NAME_TOO_LONG]: `Tag-navnet må højst være 64 tegn langt.`,
    [NotificationCode.NEWS_TAG_ALREADY_EXISTS]: `Nyhedstag findes allerede.`,

    [NotificationCode.BACKGROUND_NAME_TOO_SHORT]: `Baggrundsnavnet skal være mindst 1 tegn langt.`,
    [NotificationCode.BACKGROUND_NAME_TOO_LONG]: `Baggrundsnavnet må højst være 255 tegn langt.`,
    [NotificationCode.BACKGROUND_INVALID_STATUS]: `Baggrundsstatus er ugyldig.`,
    [NotificationCode.BACKGROUND_ALREADY_EXISTS]: `En baggrund med dette navn findes allerede.`,

    [NotificationCode.DATABASE_ERROR]: `Databasefejl.`,
    [NotificationCode.UPDATER_ERROR]: `Updater-fejl.`,
    [NotificationCode.FILE_SYSTEM_ERROR]: `Filsystemfejl.`,
    [NotificationCode.INTERNAL_SERVER_ERROR]: `Uventet fejl.`,
    [NotificationCode.EXTERNAL_API_ERROR]: `Ekstern API-fejl.`
  },
  setup: {
    setup: `Konfiguration`,
    step1: {
      title: `Først, vælg sproget for din EML&nbsp;AdminTool:`,
      subtitle: `Dette sprog vil blive anvendt for alle brugere.`,
      other: `Jeg taler et andet sprog.`,
      modal: {
        language: {
          title: `Taler du et andet sprog?`,
          content: `EML AdminTool er i øjeblikket kun tilgængelig på fem sprog.<br>
Vi er dog glade for at se, at dette projekt når ud til flere og flere mennesker i forskellige lande!<br>
<br>
Hvis du vil hjælpe med at oversætte EML AdminTool, kan du finde JSON-filerne på vores GitHub og en guide til, hvordan du indsender din oversættelse. Hvis den accepteres, vil den blive inkluderet som en standardmulighed i en fremtidig version af EML AdminTool!`,
          more: `Mere`
        }
      }
    },
    step2: {
      title: `Vælg nu en adgangskode til din database:`,
      subtitle: `Du behøver ikke at huske den.`,
      placeholder: `Databaseadgangskode`,
      generate: `Generer`,
      veryWeak: `Meget svag`,
      weak: `Svag`,
      medium: `Mellem`,
      strong: `Stærk`,
      veryStrong: `Meget stærk`
    },
    step3: {
      title: `Vælg derefter dit servernavn og en adgangskode:`,
      subtitle: `Dette servernavn og adgangskode vil være dit admin-login.`,
      confirmPassword: `Bekræft adgangskode`
    },
    finally: `Du kan nu bruge EML&nbsp;AdminTool!`
  },
  auth: {
    login: `Log ind`,
    register: `Registrer`,
    confirmPassword: `Bekræft adgangskode`,
    createAccount: `Opret en konto her.`,
    logInHere: `Log ind her.`,
    pin: `PIN`
  },
  leftPanel: {
    settings: `Indstillinger`,
    features: `Funktioner`,
    logout: `Log ud`
  },
  dashboard: {
    welcome: `Velkommen, {{username}}!`,
    emlatSettings: {
      title: `EML AdminTool indstillinger`,
      info: {
        title: `Information`,
        atName: `AdminTool navn`,
        language: `Sprog`,
        pin: `PIN`,
        nbUsers: `Antal brugere`,
        modal: {
          title: `Rediger EML AdminTool information`,
          atName: `AdminTool navn`,
          nameWarn: `Ændring af EML AdminTool navn ændrer også dit brugernavn!`,
          language: `Sprog`,
          pin: `PIN`,
          regeneratePin: `Generer PIN igen`
        }
      },
      usersManagement: {
        title: `Brugerstyring`,
        users: `Brugere`,
        pendingUsers: `Ventende brugere`,
        wrongPinUsers: `Forkert PIN`,
        deletedUsers: `Slettede brugere`,
        infoOf: `Information om {{username}}`,
        permissions: `Tilladelser`,
        refuseUser: `Afvis bruger`,
        refuseUserWarning: `Er du sikker på, at du vil afvise denne bruger? Brugeren vil ikke længere have adgang til EML AdminTool.`,
        deleteUserWarning: `Er du sikker på, at du vil slette denne bruger?
        Brugeren vil ikke længere have adgang til EML AdminTool. Brugerens handlinger og data vil dog ikke blive slettet.`,
        deleteUserForeverWarning: `Er du sikker på, at du vil slette denne bruger permanent?
        Alle brugerens handlinger og data, herunder offentliggjorte nyheder, vil blive slettet. Denne handling er irreversibel.`,
        modal: {
          title: `Rediger bruger`,
          acceptUser: `Accepter bruger`,
          permissions: `Tilladelser`
        }
      },
      update: {
        title: `Opdatering`,
        currentVersion: `Aktuel version`,
        latestVersion: `Seneste version`,
        releasedOn: `Udgivet den {{date}}`,
        openGithub: `Åbn GitHub`,
        runUpdate: `Kør opdatering`
      },
      vpsAndDockerInfo: {
        title: `VPS & Docker information`,
        dockerInfo: `Docker information`,
        storage: `Lagring`
      },
      dangerZone: {
        title: `Farezone`,
        reset: `Nulstil EML AdminTool`,
        resetEMLATWarning: `Er du sikker på, at du vil nulstille EML AdminTool? Alle data går tabt, og EML AdminTool nulstilles til sin starttilstand. Denne handling er irreversibel.
Sørg desuden for, at ingen kan få adgang til EML AdminTool under nulstillingen: EML AdminTool er ikke beskyttet under opsætningen!`,
        areYouSure: `Er du sikker?`
      }
    },
    account: {
      title: `Kontoindstillinger`,
      info: {
        title: `Kontoinformation`,
        accountType: `Kontotype`,
        modal: {
          title: `Rediger kontoinformation`,
          usernameWarn: `Ændring af dit brugernavn ændrer også navnet på EML AdminTool!`,
          leaveBlankPassword: `Lad være tomt, hvis du ikke vil ændre din adgangskode.`,
          newPassword: `Ny adgangskode`,
          confirmPassword: `Bekræft adgangskode`
        }
      },
      permissions: {
        title: `Tilladelser`
      },
      dangerZone: {
        title: `Farezone`,
        deleteAccount: `Slet konto`,
        deleteAccountWarning: `Er du sikker på, at du vil slette din konto? Du vil ikke længere have adgang til EML AdminTool. Dine handlinger og data vil dog ikke blive slettet.`
      }
    },
    filesUpdater: {
      fileName: `Filnavn`,
      size: `Størrelse`,
      b: `B`
    }
  }
}
