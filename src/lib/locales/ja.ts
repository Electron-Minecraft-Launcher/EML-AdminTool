/**
 * Translated by uta1508
 */

import { NotificationCode } from '$lib/utils/notifications'

export default {
  l: 'ja',
  language: '日本語',
  common: {
    home: 'ホーム',
    back: `戻る`,
    next: `次へ`,
    finish: '完了',
    save: `保存`,
    cancel: `キャンセル`,
    delete: `削除`,
    username: `ユーザー名`,
    password: `パスワード`
  },
  notifications: {
    [NotificationCode.INVALID_INPUT]: `無効な入力です。`,
    [NotificationCode.MISSING_INPUT]: `入力がありません。`,
    [NotificationCode.UNAUTHORIZED]: `認証されていません。`,
    [NotificationCode.FORBIDDEN]: `アクセスが禁止されています。`,
    [NotificationCode.INVALID_REQUEST]: `無効なリクエストです。`,
    [NotificationCode.NOT_FOUND]: `見つかりませんでした。`,

    [NotificationCode.SETUP_INVALID_LANGUAGE]: `言語は2文字で入力してください。`,
    [NotificationCode.SETUP_DATABASE_PASSWORD_TOO_SHORT]: `データベースのパスワードは12文字以上で入力してください。`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_SHORT]: `管理者ユーザー名は2文字以上で入力してください。`,
    [NotificationCode.SETUP_ADMIN_USERNAME_TOO_LONG]: `管理者ユーザー名は64文字以下で入力してください。`,
    [NotificationCode.SETUP_ADMIN_PASSWORD_TOO_SHORT]: `管理者パスワードは12文字以上で入力してください。`,

    [NotificationCode.EMLAT_NAME_TOO_SHORT]: `EML AdminTool名は2文字以上で入力してください。`,
    [NotificationCode.EMLAT_NAME_TOO_LONG]: `EML AdminTool名は64文字以下で入力してください。`,
    [NotificationCode.EMLAT_INVALID_LANGUAGE]: `言語は2文字で入力してください。`,
    [NotificationCode.EMLAT_UPDATED]: `EML AdminToolが正常に更新されました。`,
    [NotificationCode.EMLAT_UP_TO_DATE]: `EML AdminToolは最新です。`,
    [NotificationCode.EMLAT_UPDATE_FAILED]: `EML AdminToolの更新に失敗しました。詳細はログを確認してください。`,
    [NotificationCode.EMLAT_RESET_FAILED]: `EML AdminToolのリセットに失敗しました。詳細はログを確認してください。`,

    [NotificationCode.EDIT_USER_USERNAME_TOO_SHORT]: `ユーザー名は2文字以上で入力してください。`,
    [NotificationCode.EDIT_USER_USERNAME_TOO_LONG]: `ユーザー名は64文字以下で入力してください。`,

    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_SHORT]: `ユーザー名は2文字以上で入力してください。`,
    [NotificationCode.EDIT_ACCOUNT_USERNAME_TOO_LONG]: `ユーザー名は64文字以下で入力してください。`,
    [NotificationCode.EDIT_ACCOUNT_PASSWORD_TOO_SHORT]: `パスワードは8文字以上で入力してください。`,

    [NotificationCode.AUTH_SESSION_EXPIRED]: `セッションの有効期限が切れました。再度ログインしてください。`,
    [NotificationCode.AUTH_INVALID_SESSION]: `無効なセッションです。再度ログインしてください。`,

    [NotificationCode.LOGIN_BAD_CREDENTIALS]: `認証情報が正しくありません。`,
    [NotificationCode.LOGIN_USERNAME_TOO_SHORT]: `ユーザー名は2文字以上で入力してください。`,
    [NotificationCode.LOGIN_USERNAME_TOO_LONG]: `ユーザー名は64文字以下で入力してください。`,

    [NotificationCode.REGISTER_USERNAME_TOO_SHORT]: `ユーザー名は2文字以上で入力してください。`,
    [NotificationCode.REGISTER_USERNAME_TOO_LONG]: `ユーザー名は64文字以下で入力してください。`,
    [NotificationCode.REGISTER_PASSWORD_TOO_SHORT]: `パスワードは8文字以上で入力してください。`,
    [NotificationCode.REGISTER_PIN_INVALID]: `PINは3文字で入力してください。`,
    [NotificationCode.REGISTER_USERNAME_EXISTS]: `このユーザー名は既に使用されています。`,

    [NotificationCode.FILESUPDATER_VERSIONS_MISMATCH]: `バージョンが一致しません。`,
    [NotificationCode.FILESUPDATER_MINECRAFT_VERSION_NOT_FOUND]: `Minecraftのバージョンが見つかりません。`,
    [NotificationCode.FILESUPDATER_LOADER_VERSION_NOT_FOUND]: `ローダーのバージョンが見つかりません。`,
    [NotificationCode.FILESUPDATER_GAME_VERSION_NOT_FOUND]: `ゲームのバージョンが見つかりません。`,

    [NotificationCode.BOOTSTRAPS_MALFORMED_VERSION]: `YAMLファイルで指定されたバージョンの形式が正しくありません。`,
    [NotificationCode.BOOTSTRAPS_INVALID_FILES]: `アップロードされた1つ以上のブートストラップファイルが無効です。`,

    [NotificationCode.MAINTENANCE_INVALID_DATES]: `メンテナンス期間が無効です。開始日は終了日より前である必要があります。`,

    [NotificationCode.NEWS_TITLE_TOO_SHORT]: `ニュースのタイトルは1文字以上で入力してください。`,
    [NotificationCode.NEWS_TITLE_TOO_LONG]: `ニュースのタイトルは255文字以下で入力してください。`,

    [NotificationCode.NEWS_CATEGORY_NAME_TOO_SHORT]: `カテゴリ名は1文字以上で入力してください。`,
    [NotificationCode.NEWS_CATEGORY_NAME_TOO_LONG]: `カテゴリ名は64文字以下で入力してください。`,
    [NotificationCode.NEWS_CATEGORY_ALREADY_EXISTS]: `このニュースカテゴリは既に存在します。`,

    [NotificationCode.NEWS_TAG_NAME_TOO_SHORT]: `タグ名は1文字以上で入力してください。`,
    [NotificationCode.NEWS_TAG_NAME_TOO_LONG]: `タグ名は64文字以下で入力してください。`,
    [NotificationCode.NEWS_TAG_ALREADY_EXISTS]: `このニュースタグは既に存在します。`,

    [NotificationCode.BACKGROUND_NAME_TOO_SHORT]: `背景名は1文字以上で入力してください。`,
    [NotificationCode.BACKGROUND_NAME_TOO_LONG]: `背景名は255文字以下で入力してください。`,
    [NotificationCode.BACKGROUND_INVALID_STATUS]: `背景のステータスが無効です。`,
    [NotificationCode.BACKGROUND_ALREADY_EXISTS]: `この名前の背景は既に存在します。`,

    [NotificationCode.DATABASE_ERROR]: `データベースエラー。`,
    [NotificationCode.UPDATER_ERROR]: `アップデーターエラー。`,
    [NotificationCode.FILE_SYSTEM_ERROR]: `ファイルシステムエラー。`,
    [NotificationCode.INTERNAL_SERVER_ERROR]: `予期しないエラー。`,
    [NotificationCode.EXTERNAL_API_ERROR]: `外部APIエラー。`
  },
  setup: {
    setup: `セットアップ`,
    step1: {
      title: `まず、EML&nbsp;AdminToolの言語を選択してください：`,
      subtitle: `この言語はすべてのユーザーに適用されます。`,
      other: `他の言語を話します。`,
      modal: {
        language: {
          title: `他の言語を話しますか？`,
          content: `EML AdminToolは現在5つの言語でのみ利用可能です。<br>
しかし、このプロジェクトがさまざまな国のより多くの人々に届いていることを嬉しく思います！<br>
<br>
EML AdminToolの翻訳にご協力いただける場合は、GitHubでJSONファイルと翻訳の提出方法のガイドを見つけることができます。承認された場合、将来のバージョンのEML AdminToolにデフォルトオプションとして含まれます！`,
          more: `詳細`
        }
      }
    },
    step2: {
      title: `次に、データベースのパスワードを選択してください：`,
      subtitle: `覚える必要はありません。`,
      placeholder: `データベースのパスワード`,
      generate: `生成`,
      veryWeak: `非常に弱い`,
      weak: `弱い`,
      medium: `普通`,
      strong: `強い`,
      veryStrong: `非常に強い`
    },
    step3: {
      title: `最後に、サーバー名とパスワードを選択してください：`,
      subtitle: `このサーバー名とパスワードが管理者ログインになります。`,
      confirmPassword: `パスワードの確認`
    },
    finally: `EML&nbsp;AdminToolを使用できます！`
  },
  auth: {
    login: `ログイン`,
    register: `登録`,
    confirmPassword: `パスワードの確認`,
    createAccount: `アカウントを作成する`,
    logInHere: `ここからログイン`,
    pin: `PIN`
  },
  leftPanel: {
    settings: `設定`,
    features: `機能`,
    logout: `ログアウト`
  },
  dashboard: {
    welcome: `ようこそ、{{username}}さん！`,
    emlatSettings: {
      title: `EML AdminToolの設定`,
      info: {
        title: `情報`,
        atName: `AdminTool名`,
        language: `言語`,
        pin: `PIN`,
        nbUsers: `ユーザー数`,
        modal: {
          title: `EML AdminTool情報の編集`,
          atName: `AdminTool名`,
          nameWarn: `EML AdminTool名を変更すると、ユーザー名も変更されます！`,
          language: `言語`,
          pin: `PIN`,
          regeneratePin: `PINを再生成`
        }
      },
      usersManagement: {
        title: `ユーザー管理`,
        users: `ユーザー`,
        pendingUsers: `保留中のユーザー`,
        wrongPinUsers: `PIN間違い`,
        deletedUsers: `削除されたユーザー`,
        infoOf: `{{username}}の情報`,
        permissions: `権限`,
        refuseUser: `ユーザーを拒否`,
        refuseUserWarning: `このユーザーを拒否してもよろしいですか？ユーザーはEML AdminToolにアクセスできなくなります。`,
        deleteUserWarning: `このユーザーを削除してもよろしいですか？
        ユーザーはEML AdminToolにアクセスできなくなります。ただし、ユーザーのアクションとデータは削除されません。`,
        deleteUserForeverWarning: `このユーザーを完全に削除してもよろしいですか？
        公開されたニュースを含む、すべてのユーザーのアクションとデータが削除されます。この操作は元に戻せません。`,
        modal: {
          title: `ユーザーを編集`,
          acceptUser: `ユーザーを承認`,
          permissions: `権限`
        }
      },
      update: {
        title: `アップデート`,
        currentVersion: `現在のバージョン`,
        latestVersion: `最新バージョン`,
        releasedOn: `リリース日：{{date}}`,
        openGithub: `GitHubを開く`,
        runUpdate: `アップデートを実行`
      },
      vpsAndDockerInfo: {
        title: `VPSとDockerの情報`,
        dockerInfo: `Docker情報`,
        storage: `ストレージ`
      },
      dangerZone: {
        title: `危険地帯`,
        reset: `EML AdminToolをリセット`,
        resetEMLATWarning: `EML AdminToolをリセットしてもよろしいですか？すべてのデータが失われ、EML AdminToolは初期状態にリセットされます。この操作は元に戻せません。
また、リセット中は誰もEML AdminToolにアクセスできないようにしてください。セットアップ中のEML AdminToolは保護されていません！`,
        areYouSure: `よろしいですか？`
      }
    },
    account: {
      title: `アカウント設定`,
      info: {
        title: `アカウント情報`,
        accountType: `アカウントの種類`,
        modal: {
          title: `アカウント情報を編集`,
          usernameWarn: `ユーザー名を変更すると、EML AdminToolの名前も変更されます！`,
          leaveBlankPassword: `パスワードを変更しない場合は空欄にしてください。`,
          newPassword: `新しいパスワード`,
          confirmPassword: `パスワードの確認`
        }
      },
      permissions: {
        title: `権限`
      },
      dangerZone: {
        title: `危険地帯`,
        deleteAccount: `アカウントを削除`,
        deleteAccountWarning: `アカウントを削除してもよろしいですか？EML AdminToolにアクセスできなくなります。ただし、アクションとデータは削除されません。`
      }
    },
    filesUpdater: {
      fileName: `ファイル名`,
      size: `サイズ`,
      b: `B`
    }
  }
}
