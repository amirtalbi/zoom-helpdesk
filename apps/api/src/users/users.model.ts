export class User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  isConfirmed: boolean;
  confirmationToken: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
}