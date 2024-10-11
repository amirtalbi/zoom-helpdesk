import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      email: 'test@example.com',
      password: bcrypt.hashSync('password', 10),
    },
  ];

  async findOneByEmail(email: string): Promise<any> {
    return this.users.find(user => user.email === email);
  }
}