export interface User {
  id: number;
  dni?: string;
  cuit_cuil?: string;
  email: string;
  password_hash: string;
  role: 'superadmin' | 'admin' | 'owner' | 'tenant' | 'provider';
  status: 'pending' | 'active' | 'inactive' | 'blocked';
  first_name: string;
  last_name: string;
  phone?: string;
  phone_secondary?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  notification_preferences?: NotificationPreferences;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  email_verified: boolean;
  email_verified_at?: Date;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  digest_frequency: 'realtime' | 'daily' | 'weekly';
}

export interface CreateUserDto {
  dni?: string;
  cuit_cuil?: string;
  email: string;
  password: string;
  role: User['role'];
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  phone_secondary?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  notification_preferences?: NotificationPreferences;
}
