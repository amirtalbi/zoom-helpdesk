import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './users.model';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: bcrypt.hashSync('password', 10),
      role: 'admin',
    },
  ];

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  findAll(): User[] {
    return this.users;
  }

  create(user: User): User {
    user.userId = this.users.length + 1;
    user.password = bcrypt.hashSync(user.password, 10);
    this.users.push(user);
    return user;
  }
}
