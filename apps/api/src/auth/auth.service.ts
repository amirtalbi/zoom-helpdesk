import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(user: User): Promise<User> {
    return this.usersService.create(user);
  }

  async confirmAccount(token: string): Promise<User> {
    return this.usersService.confirmAccount(token);
  }

  async forgotPassword(email: string): Promise<void> {
    return this.usersService.forgotPassword(email);
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    return this.usersService.resetPassword(token, newPassword);
  }
}
