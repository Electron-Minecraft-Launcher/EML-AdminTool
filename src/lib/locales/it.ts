/**
 * Translated by TheMFCRaft1
 */

import { NotificationCode } from '$lib/utils/notifications'

export default {
  l: 'it',
  language: 'Italiano',
  common: {
    home: 'Home',
    back: `Indietro`,
    next: `Avanti`,
    finish: 'Fine',
    save: `Salva`,
    cancel: `Annulla`,
    delete: `Elimina`,
    username: `Nome utente`,
    password: `Password`
  },
  notifications: {
    [NotificationCode.INVALID_INPUT]: `Input non valido.`,
    [NotificationCode.MISSING_INPUT]: `Input mancante.`,
    [NotificationCode.UNAUTHORIZED]: `Non autorizzato.`,
    [NotificationCode.FORBIDDEN]: `Proibito.`,
    [NotificationCode.INVALID_REQUEST]: `Richiesta non valida.`,
    [NotificationCode.NOT_FOUND]: `Non trovato.`,

    [NotificationCode.SETUP_INVALID_LANGUAGE]: `La lingua deve essere composta esattamente da 2 caratteri.`,
    [NotificationCode.SETUP_DATABASE_PASSWORD_TOO_SHORT]: `La password del database deve contenere almeno 12 caratteri.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_SHORT]: `Il nome utente amministratore deve contenere almeno 2 caratteri.`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_LONG]: `Il nome utente amministratore deve contenere al massimo 64 caratteri.`,
    [NotificationCode.SETUP_ADMIN_PASSWORD_TOO_SHORT]: `La password amministratore deve contenere almeno 12 caratteri.`,

    [NotificationCode.EMLAT_NAME_TOO_SHORT]: `Il nome di EML AdminTool deve contenere almeno 2 caratteri.`,
    [NotificationCode.EMLAT_NAME_TOO_LONG]: `Il nome di EML AdminTool deve contenere al massimo 64 caratteri.`,
    [NotificationCode.EMLAT_INVALID_LANGUAGE]: `La lingua deve essere composta esattamente da 2 caratteri.`,
    [NotificationCode.EMLAT_UPDATED]: `EML AdminTool è stato aggiornato con successo.`,
    [NotificationCode.EMLAT_UP_TO_DATE]: `EML AdminTool è aggiornato.`,
    [NotificationCode.EMLAT_UPDATE_FAILED]: `Impossibile aggiornare EML AdminTool. Controlla i log per maggiori dettagli.`,
    [NotificationCode.EMLAT_RESET_FAILED]: `Impossibile reimpostare EML AdminTool. Controlla i log per maggiori dettagli.`,

    [NotificationCode.EDIT_USER_USERNAME_TOO_SHORT]: `Il nome utente deve contenere almeno 2 caratteri.`,
    [NotificationCode.EDIT_USER_USERNAME_TOO_LONG]: `Il nome utente deve contenere al massimo 64 caratteri.`,

    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_SHORT]: `Il nome utente deve contenere almeno 2 caratteri.`,
    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_LONG]: `Il nome utente deve contenere al massimo 64 caratteri.`,
    [NotificationCode.EDIT_ACCOUNT_PASSWORD_TOO_SHORT]: `La password deve contenere almeno 8 caratteri.`,

    [NotificationCode.AUTH_SESSION_EXPIRED]: `Sessione scaduta, effettua nuovamente il login.`,
    [NotificationCode.AUTH_INVALID_SESSION]: `Sessione non valida, effettua nuovamente il login.`,

    [NotificationCode.LOGIN_BAD_CREDENTIALS]: `Credenziali errate.`,
    [NotificationCode.LOGIN_USERNAME_TOO_SHORT]: `Il nome utente deve contenere almeno 2 caratteri.`,
    [NotificationCode.LOGIN_USERNAME_TOO_LONG]: `Il nome utente deve contenere al massimo 64 caratteri.`,

    [NotificationCode.REGISTER_USERNAME_TOO_SHORT]: `Il nome utente deve contenere almeno 2 caratteri.`,
    [NotificationCode.REGISTER_USERNAME_TOO_LONG]: `Il nome utente deve contenere al massimo 64 caratteri.`,
    [NotificationCode.REGISTER_PASSWORD_TOO_SHORT]: `La password deve contenere almeno 8 caratteri.`,
    [NotificationCode.REGISTER_PIN_INVALID]: `Il PIN deve essere composto esattamente da 3 caratteri.`,
    [NotificationCode.REGISTER_USERNAME_EXISTS]: `Nome utente già esistente.`,

    [NotificationCode.FILESUPDATER_VERSIONS_MISMATCH]: `Versioni non corrispondenti.`,
    [NotificationCode.FILESUPDATER_MINECRAFT_VERSION_NOT_FOUND]: `Versione di Minecraft non trovata.`,
    [NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND]: `Versione del loader non trovata.`,
    [NotificationCode.FILESUPDATER_GAME_VERSION_NOT_FOUND]: `Versione di gioco non trovata.`,

    [NotificationCode.BOOTSTRAPS_MALFORMED_VERSION]: `La versione specificata nel file YAML è malformata.`,
    [NotificationCode.BOOTSTRAPS_INVALID_FILES]: `Uno o più file bootstrap caricati non sono validi.`,

    [NotificationCode.MAINTENANCE_INVALID_DATES]: `Le date di manutenzione non sono valide. La data di inizio deve essere precedente alla data di fine.`,

    [NotificationCode.NEWS_TITLE_TOO_SHORT]: `Il titolo della notizia deve contenere almeno 1 carattere.`,
    [NotificationCode.NEWS_TITLE_TOO_LONG]: `Il titolo della notizia deve contenere al massimo 255 caratteri.`,

    [NotificationCode.NEWS_CATEGORY_NAME_TOO_SHORT]: `Il nome della categoria deve contenere almeno 1 carattere.`,
    [NotificationCode.NEWS_CATEGORY_NAME_TOO_LONG]: `Il nome della categoria deve contenere al massimo 64 caratteri.`,
    [NotificationCode.NEWS_CATEGORY_ALREADY_EXISTS]: `La categoria di notizie esiste già.`,

    [NotificationCode.NEWS_TAG_NAME_TOO_SHORT]: `Il nome del tag deve contenere almeno 1 carattere.`,
    [NotificationCode.NEWS_TAG_NAME_TOO_LONG]: `Il nome del tag deve contenere al massimo 64 caratteri.`,
    [NotificationCode.NEWS_TAG_ALREADY_EXISTS]: `Il tag di notizie esiste già.`,

    [NotificationCode.BACKGROUND_NAME_TOO_SHORT]: `Il nome dello sfondo deve contenere almeno 1 carattere.`,
    [NotificationCode.BACKGROUND_NAME_TOO_LONG]: `Il nome dello sfondo deve contenere al massimo 255 caratteri.`,
    [NotificationCode.BACKGROUND_INVALID_STATUS]: `Lo stato dello sfondo non è valido.`,
    [NotificationCode.BACKGROUND_ALREADY_EXISTS]: `Uno sfondo con questo nome esiste già.`,

    [NotificationCode.DATABASE_ERROR]: `Errore del database.`,
    [NotificationCode.UPDATER_ERROR]: `Errore dell'updater.`,
    [NotificationCode.FILE_SYSTEM_ERROR]: `Errore del file system.`,
    [NotificationCode.INTERNAL_SERVER_ERROR]: `Errore imprevisto.`,
    [NotificationCode.EXTERNAL_API_ERROR]: `Errore API esterna.`
  },
  setup: {
    setup: `Configurazione`,
    step1: {
      title: `Per prima cosa, scegli la lingua per il tuo EML&nbsp;AdminTool:`,
      subtitle: `Questa lingua verrà utilizzata per tutti gli utenti.`,
      other: `Parlo un'altra lingua.`,
      modal: {
        language: {
          title: `Parli un'altra lingua?`,
          content: `EML AdminTool è attualmente disponibile solo in cinque lingue.<br>
Tuttavia, siamo entusiasti di vedere che questo progetto sta raggiungendo sempre più persone in tutto il mondo!<br>
<br>
Se desideri aiutarci a tradurre EML AdminTool, puoi trovare i file JSON sul nostro GitHub e una guida su come inviare la tua traduzione. Se sarà accettata, verrà inclusa come opzione predefinita in una futura versione di EML AdminTool!`,
          more: `Di più`
        }
      }
    },
    step2: {
      title: `Ora, scegli una password per il tuo database:`,
      subtitle: `Non dovrai ricordarla.`,
      placeholder: `Password del database`,
      generate: `Genera`,
      veryWeak: `Molto debole`,
      weak: `Debole`,
      medium: `Media`,
      strong: `Forte`,
      veryStrong: `Molto forte`
    },
    step3: {
      title: `Quindi, scegli il nome del server e una password:`,
      subtitle: `Questo nome del server e password saranno il tuo login amministratore.`,
      confirmPassword: `Conferma password`
    },
    finally: `Ora puoi utilizzare EML&nbsp;AdminTool!`
  },
  auth: {
    login: `Accedi`,
    register: `Registrati`,
    confirmPassword: `Conferma password`,
    createAccount: `Crea un account qui.`,
    logInHere: `Accedi qui.`,
    pin: `PIN`
  },
  leftPanel: {
    settings: `Impostazioni`,
    features: `Funzionalità`,
    logout: `Disconnetti`
  },
  dashboard: {
    welcome: `Benvenuto, {{username}}!`,
    emlatSettings: {
      title: `Impostazioni EML AdminTool`,
      info: {
        title: `Informazioni`,
        atName: `Nome AdminTool`,
        language: `Lingua`,
        pin: `PIN`,
        nbUsers: `Numero di utenti`,
        modal: {
          title: `Modifica informazioni EML AdminTool`,
          atName: `Nome AdminTool`,
          nameWarn: `Cambiare il nome di EML AdminTool cambia anche il tuo nome utente!`,
          language: `Lingua`,
          pin: `PIN`,
          regeneratePin: `Rigenera PIN`
        }
      },
      usersManagement: {
        title: `Gestione utenti`,
        users: `Utenti`,
        pendingUsers: `Utenti in attesa`,
        wrongPinUsers: `PIN errato`,
        deletedUsers: `Utenti eliminati`,
        infoOf: `Informazioni su {{username}}`,
        permissions: `Permessi`,
        refuseUser: `Rifiuta utente`,
        refuseUserWarning: `Sei sicuro di voler rifiutare questo utente? L'utente non potrà più accedere a EML AdminTool.`,
        deleteUserWarning: `Sei sicuro di voler eliminare questo utente?
        L'utente non potrà più accedere a EML AdminTool. Tuttavia, le sue azioni e i suoi dati non verranno eliminati.`,
        deleteUserForeverWarning: `Sei sicuro di voler eliminare definitivamente questo utente?
        Tutte le azioni e i dati dell'utente, comprese le notizie pubblicate, verranno eliminati. Questa azione è irreversibile.`,
        modal: {
          title: `Modifica utente`,
          acceptUser: `Accetta utente`,
          permissions: `Permessi`
        }
      },
      update: {
        title: `Aggiornamento`,
        currentVersion: `Versione attuale`,
        latestVersion: `Ultima versione`,
        releasedOn: `Rilasciato il {{date}}`,
        openGithub: `Apri GitHub`,
        runUpdate: `Aggiorna`
      },
      vpsAndDockerInfo: {
        title: `Informazioni VPS & Docker`,
        dockerInfo: `Informazioni Docker`,
        storage: `Archiviazione`
      },
      dangerZone: {
        title: `Zona pericolosa`,
        reset: `Reimposta EML AdminTool`,
        resetEMLATWarning: `Sei sicuro di voler reimpostare EML AdminTool? Tutti i dati andranno persi ed EML AdminTool verrà riportato allo stato iniziale. Questa azione è irreversibile.
Inoltre, assicurati che nessuno possa accedere a EML AdminTool durante la reimpostazione: EML AdminTool non è protetto durante la configurazione!`,
        areYouSure: `Sei sicuro?`
      }
    },
    account: {
      title: `Impostazioni account`,
      info: {
        title: `Informazioni account`,
        accountType: `Tipo di account`,
        modal: {
          title: `Modifica informazioni account`,
          usernameWarn: `Cambiare il tuo nome utente cambierà anche il nome di EML AdminTool!`,
          leaveBlankPassword: `Lascia vuoto se non vuoi cambiare la password.`,
          newPassword: `Nuova password`,
          confirmPassword: `Conferma password`
        }
      },
      permissions: {
        title: `Permessi`
      },
      dangerZone: {
        title: `Zona pericolosa`,
        deleteAccount: `Elimina account`,
        deleteAccountWarning: `Sei sicuro di voler eliminare il tuo account? Non potrai più accedere a EML AdminTool. Tuttavia, le tue azioni e i tuoi dati non verranno eliminati.`
      }
    },
    filesUpdater: {
      fileName: `Nome file`,
      size: `Dimensione`,
      b: `B`
    }
  }
}
