export interface ProfileFormValues {
  name: string;
  email: string;
}

export interface SecurityPasswordFormValues {
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}
