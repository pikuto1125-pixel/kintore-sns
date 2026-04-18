const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "メールアドレスまたはパスワードが正しくありません",
  "Email not confirmed": "メールアドレスの認証が完了していません。確認メールをご確認ください",
  "User already registered": "このメールアドレスはすでに登録されています",
  "Password should be at least 6 characters": "パスワードは6文字以上で入力してください",
  "Unable to validate email address: invalid format": "メールアドレスの形式が正しくありません",
  "Email rate limit exceeded": "メール送信の制限に達しました。しばらく待ってから再試行してください",
  "signup requires a valid password": "有効なパスワードを入力してください",
  "Token has expired or is invalid": "リンクの有効期限が切れています。再度お試しください",
  "New password should be different from the old password": "新しいパスワードは現在のパスワードと異なるものを設定してください",
};

export function toJapaneseError(message: string): string {
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (message.includes(key)) return value;
  }
  return "エラーが発生しました。もう一度お試しください";
}
