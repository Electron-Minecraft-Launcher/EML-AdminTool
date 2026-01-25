/**
 * Translated by TheMFCRaft1
 */

import { NotificationCode } from '$lib/utils/notifications'

export default {
  l: 'de',
  language: 'Deutsch',
  common: {
    home: 'Startseite',
    back: `Zurück`,
    next: `Weiter`,
    finish: 'Fertig',
    save: `Speichern`,
    cancel: `Abbrechen`,
    delete: `Löschen`,
    username: `Benutzername`,
    password: `Passwort`
  },
  notifications: {
    [NotificationCode.INVALID_INPUT]: `Ungültige Eingabe.`,
    [NotificationCode.MISSING_INPUT]: `Fehlende Eingabe.`,
    [NotificationCode.UNAUTHORIZED]: `Nicht autorisiert.`,
    [NotificationCode.FORBIDDEN]: `Verboten.`,
    [NotificationCode.INVALID_REQUEST]: `Ungültige Anfrage.`,
    [NotificationCode.NOT_FOUND]: `Nicht gefunden.`,

    [NotificationCode.SETUP_INVALID_LANGUAGE]: `Die Sprache muss genau 2 Zeichen lang sein.`,
    [NotificationCode.SETUP_DATABASE_PASSWORD_TOO_SHORT]: `Das Datenbankpasswort muss mindestens 12 Zeichen lang sein.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_SHORT]: `Der Admin-Benutzername muss mindestens 2 Zeichen lang sein.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_LONG]: `Der Admin-Benutzername darf höchstens 64 Zeichen lang sein.`,
    [NotificationCode.SETUP_ADMIN_PASSWORD_TOO_SHORT]: `Das Admin-Passwort muss mindestens 12 Zeichen lang sein.`,

    [NotificationCode.EMLAT_NAME_TOO_SHORT]: `Der Name des EML AdminTools muss mindestens 2 Zeichen lang sein.`,
    [NotificationCode.EMLAT_NAME_TOO_LONG]: `Der Name des EML AdminTools darf höchstens 64 Zeichen lang sein.`,
    [NotificationCode.EMLAT_INVALID_LANGUAGE]: `Die Sprache muss genau 2 Zeichen lang sein.`,
    [NotificationCode.EMLAT_UPDATED]: `Das EML AdminTool wurde erfolgreich aktualisiert.`,
    [NotificationCode.EMLAT_UP_TO_DATE]: `Das EML AdminTool ist auf dem neuesten Stand.`,
    [NotificationCode.EMLAT_UPDATE_FAILED]: `Fehler beim Aktualisieren des EML AdminTools. Bitte überprüfe die Logs für weitere Details.`,
    [NotificationCode.EMLAT_RESET_FAILED]: `Fehler beim Zurücksetzen des EML AdminTools. Bitte überprüfe die Logs für weitere Details.`,

    [NotificationCode.EDIT_USER_USERNAME_TOO_SHORT]: `Der Benutzername muss mindestens 2 Zeichen lang sein.`,
    [NotificationCode.EDIT_USER_USERNAME_TOO_LONG]: `Der Benutzername darf höchstens 64 Zeichen lang sein.`,

    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_SHORT]: `Der Benutzername muss mindestens 2 Zeichen lang sein.`,
    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_LONG]: `Der Benutzername darf höchstens 64 Zeichen lang sein.`,
    [NotificationCode.EDIT_ACCOUNT_PASSWORD_TOO_SHORT]: `Das Passwort muss mindestens 8 Zeichen lang sein.`,

    [NotificationCode.AUTH_SESSION_EXPIRED]: `Sitzung abgelaufen, bitte erneut anmelden.`,
    [NotificationCode.AUTH_INVALID_SESSION]: `Ungültige Sitzung, bitte erneut anmelden.`,

    [NotificationCode.LOGIN_BAD_CREDENTIALS]: `Falsche Anmeldedaten.`,
    [NotificationCode.LOGIN_USERNAME_TOO_SHORT]: `Der Benutzername muss mindestens 2 Zeichen lang sein.`,
    [NotificationCode.LOGIN_USERNAME_TOO_LONG]: `Der Benutzername darf höchstens 64 Zeichen lang sein.`,

    [NotificationCode.REGISTER_USERNAME_TOO_SHORT]: `Der Benutzername muss mindestens 2 Zeichen lang sein.`,
    [NotificationCode.REGISTER_USERNAME_TOO_LONG]: `Der Benutzername darf höchstens 64 Zeichen lang sein.`,
    [NotificationCode.REGISTER_PASSWORD_TOO_SHORT]: `Das Passwort muss mindestens 8 Zeichen lang sein.`,
    [NotificationCode.REGISTER_PIN_INVALID]: `Der PIN muss genau 3 Zeichen lang sein.`,
    [NotificationCode.REGISTER_USERNAME_EXISTS]: `Benutzername existiert bereits.`,

    [NotificationCode.FILESUPDATER_VERSIONS_MISMATCH]: `Versionskonflikt.`,
    [NotificationCode.FILESUPDATER_MINECRAFT_VERSION_NOT_FOUND]: `Minecraft-Version nicht gefunden.`,
    [NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND]: `Loader-Version nicht gefunden.`,
    [NotificationCode.FILESUPDATER_GAME_VERSION_NOT_FOUND]: `Spielversion nicht gefunden.`,

    [NotificationCode.BOOTSTRAPS_MALFORMED_VERSION]: `Die in der YAML-Datei angegebene Version ist fehlerhaft.`,
    [NotificationCode.BOOTSTRAPS_INVALID_FILES]: `Eine oder mehrere hochgeladene Bootstrap-Dateien sind ungültig.`,

    [NotificationCode.MAINTENANCE_INVALID_DATES]: `Wartungsdaten sind ungültig. Das Startdatum muss vor dem Enddatum liegen.`,

    [NotificationCode.NEWS_TITLE_TOO_SHORT]: `Der Nachrichtentitel muss mindestens 1 Zeichen lang sein.`,
    [NotificationCode.NEWS_TITLE_TOO_LONG]: `Der Nachrichtentitel darf höchstens 255 Zeichen lang sein.`,

    [NotificationCode.NEWS_CATEGORY_NAME_TOO_SHORT]: `Der Kategoriename muss mindestens 1 Zeichen lang sein.`,
    [NotificationCode.NEWS_CATEGORY_NAME_TOO_LONG]: `Der Kategoriename darf höchstens 64 Zeichen lang sein.`,
    [NotificationCode.NEWS_CATEGORY_ALREADY_EXISTS]: `Nachrichtenkategorie existiert bereits.`,

    [NotificationCode.NEWS_TAG_NAME_TOO_SHORT]: `Der Tag-Name muss mindestens 1 Zeichen lang sein.`,
    [NotificationCode.NEWS_TAG_NAME_TOO_LONG]: `Der Tag-Name darf höchstens 64 Zeichen lang sein.`,
    [NotificationCode.NEWS_TAG_ALREADY_EXISTS]: `Nachrichten-Tag existiert bereits.`,

    [NotificationCode.BACKGROUND_NAME_TOO_SHORT]: `Der Hintergrundname muss mindestens 1 Zeichen lang sein.`,
    [NotificationCode.BACKGROUND_NAME_TOO_LONG]: `Der Hintergrundname darf höchstens 255 Zeichen lang sein.`,
    [NotificationCode.BACKGROUND_INVALID_STATUS]: `Hintergrundstatus ist ungültig.`,
    [NotificationCode.BACKGROUND_ALREADY_EXISTS]: `Ein Hintergrund mit diesem Namen existiert bereits.`,

    [NotificationCode.DATABASE_ERROR]: `Datenbankfehler.`,
    [NotificationCode.UPDATER_ERROR]: `Updater-Fehler.`,
    [NotificationCode.FILE_SYSTEM_ERROR]: `Dateisystemfehler.`,
    [NotificationCode.INTERNAL_SERVER_ERROR]: `Unerwarteter Fehler.`,
    [NotificationCode.EXTERNAL_API_ERROR]: `Externer API-Fehler.`
  },
  setup: {
    setup: `Konfiguration`,
    step1: {
      title: `Wähle zuerst die Sprache für dein EML&nbsp;AdminTool:`,
      subtitle: `Diese Sprache wird für alle Benutzer verwendet.`,
      other: `Ich spreche eine andere Sprache.`,
      modal: {
        language: {
          title: `Du sprichst eine andere Sprache?`,
          content: `Das EML AdminTool ist derzeit nur in fünf Sprachen verfügbar.<br>
Wir freuen uns jedoch sehr, dass dieses Projekt immer mehr Menschen in verschiedenen Ländern erreicht!<br>
<br>
Wenn du uns bei der Übersetzung des EML AdminTools helfen möchtest, findest du die JSON-Dateien auf GitHub und eine Anleitung, wie du deine Übersetzung einreichen kannst. Wird sie akzeptiert, wird sie in einer zukünftigen Version als Standardoption aufgenommen!`,
          more: `Mehr`
        }
      }
    },
    step2: {
      title: `Wähle nun ein Passwort für deine Datenbank:`,
      subtitle: `Du musst es dir nicht merken.`,
      placeholder: `Datenbankpasswort`,
      generate: `Generieren`,
      veryWeak: `Sehr schwach`,
      weak: `Schwach`,
      medium: `Mittel`,
      strong: `Stark`,
      veryStrong: `Sehr stark`
    },
    step3: {
      title: `Wähle dann deinen Servernamen und ein Passwort:`,
      subtitle: `Dieser Servername und das Passwort werden dein Admin-Login sein.`,
      confirmPassword: `Passwort bestätigen`
    },
    finally: `Du kannst das EML&nbsp;AdminTool jetzt verwenden!`
  },
  auth: {
    login: `Anmelden`,
    register: `Registrieren`,
    confirmPassword: `Passwort bestätigen`,
    createAccount: `Erstelle hier ein Konto.`,
    logInHere: `Hier anmelden.`,
    pin: `PIN`
  },
  leftPanel: {
    settings: `Einstellungen`,
    features: `Funktionen`,
    logout: `Abmelden`
  },
  dashboard: {
    welcome: `Willkommen, {{username}}!`,
    emlatSettings: {
      title: `EML AdminTool Einstellungen`,
      info: {
        title: `Informationen`,
        atName: `AdminTool Name`,
        language: `Sprache`,
        pin: `PIN`,
        nbUsers: `Anzahl der Benutzer`,
        modal: {
          title: `EML AdminTool-Informationen bearbeiten`,
          atName: `AdminTool Name`,
          nameWarn: `Das Ändern des Namens ändert auch deinen Benutzernamen!`,
          language: `Sprache`,
          pin: `PIN`,
          regeneratePin: `PIN neu generieren`
        }
      },
      usersManagement: {
        title: `Benutzerverwaltung`,
        users: `Benutzer`,
        pendingUsers: `Wartende Benutzer`,
        wrongPinUsers: `Falscher PIN`,
        deletedUsers: `Gelöschte Benutzer`,
        infoOf: `Informationen über {{username}}`,
        permissions: `Berechtigungen`,
        refuseUser: `Benutzer ablehnen`,
        refuseUserWarning: `Bist du sicher, dass du diesen Benutzer ablehnen möchtest? Der Benutzer wird keinen Zugriff mehr auf das EML AdminTool haben.`,
        deleteUserWarning: `Bist du sicher, dass du diesen Benutzer löschen möchtest?
        Der Benutzer wird keinen Zugriff mehr auf das EML AdminTool haben. Seine Aktionen und Daten werden jedoch nicht gelöscht.`,
        deleteUserForeverWarning: `Bist du sicher, dass du diesen Benutzer endgültig löschen möchtest?
        Alle Aktionen und Daten des Benutzers, einschließlich veröffentlichter Nachrichten, werden gelöscht. Diese Aktion ist unwiderruflich.`,
        modal: {
          title: `Benutzer bearbeiten`,
          acceptUser: `Benutzer akzeptieren`,
          permissions: `Berechtigungen`
        }
      },
      update: {
        title: `Update`,
        currentVersion: `Aktuelle Version`,
        latestVersion: `Neueste Version`,
        releasedOn: `Veröffentlicht am {{date}}`,
        openGithub: `Auf GitHub ansehen`,
        runUpdate: `Aktualisieren`
      },
      vpsAndDockerInfo: {
        title: `VPS & Docker Informationen`,
        dockerInfo: `Docker Informationen`,
        storage: `Speicher`
      },
      dangerZone: {
        title: `Gefahrenzone`,
        reset: `EML AdminTool zurücksetzen`,
        resetEMLATWarning: `Bist du sicher, dass du das EML AdminTool zurücksetzen möchtest? Alle Daten gehen verloren und das EML AdminTool wird auf den Ausgangszustand zurückgesetzt. Diese Aktion ist unwiderruflich.
Stelle außerdem sicher, dass während des Zurücksetzens niemand auf das EML AdminTool zugreifen kann: Das EML AdminTool ist während der Einrichtung nicht geschützt!`,
        areYouSure: `Bist du sicher?`
      }
    },
    account: {
      title: `Kontoeinstellungen`,
      info: {
        title: `Kontoinformationen`,
        accountType: `Kontotyp`,
        modal: {
          title: `Kontoinformationen bearbeiten`,
          usernameWarn: `Das Ändern deines Benutzernamens ändert auch den Namen des EML AdminTools!`,
          leaveBlankPassword: `Leer lassen, wenn du dein Passwort nicht ändern möchtest.`,
          newPassword: `Neues Passwort`,
          confirmPassword: `Passwort bestätigen`
        }
      },
      permissions: {
        title: `Berechtigungen`
      },
      dangerZone: {
        title: `Gefahrenzone`,
        deleteAccount: `Konto löschen`,
        deleteAccountWarning: `Bist du sicher, dass du dein Konto löschen möchtest? Du wirst keinen Zugriff mehr auf das EML AdminTool haben. Deine Aktionen und Daten werden jedoch nicht gelöscht.`
      }
    },
    filesUpdater: {
      fileName: `Dateiname`,
      size: `Größe`,
      b: `B`
    }
  }
}
