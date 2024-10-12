import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { Multer } from 'multer';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as xml2js from 'xml2js';
import { User, UserDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async create(user: User): Promise<User> {
    user.password = bcrypt.hashSync(user.password, 10);
    user.confirmationToken = crypto.randomBytes(20).toString('hex');
    const createdUser = new this.userModel(user);
    await createdUser.save();
    this.sendConfirmationEmail(createdUser);
    return createdUser;
  }

  async update(id: string, user: User): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneByConfirmationToken(token: string): Promise<User | undefined> {
    return this.userModel.findOne({ confirmationToken: token }).exec();
  }

  async findOneByResetPasswordToken(token: string): Promise<User | undefined> {
    return this.userModel.findOne({ resetPasswordToken: token }).exec();
  }

  async updateRole(id: string, role: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
  }

  async confirmAccount(token: string): Promise<User> {
    const user = await this.findOneByConfirmationToken(token) as UserDocument;
    if (!user) {
      throw new Error('Invalid confirmation token');
    }
    user.isConfirmed = true;
    user.confirmationToken = '';
    return user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.findOneByEmail(email) as UserDocument;
    if (!user) { 
      throw new Error('User not found');
    }
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();
    await this.sendResetPasswordEmail(user);
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await this.findOneByResetPasswordToken(token) as UserDocument;
    if (!user || user.resetPasswordExpires < new Date()) {
      throw new Error('Invalid or expired reset token');
    }
    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = '';
    user.resetPasswordExpires = new Date();
    return user.save();
  }

  private async sendConfirmationEmail(user: User) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Account Confirmation',
      text: `Hello ${user.firstName},\n\nPlease confirm your account by clicking the link: \nhttp://localhost:3000/auth/confirm/${user.confirmationToken}\n\nBest regards,\nYour Company`,
    };

    await transporter.sendMail(mailOptions);
  }

  private async sendResetPasswordEmail(user: User) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: user.email,
      subject: 'Password Reset',
      text: `Hello ${user.firstName},\n\nPlease reset your password by clicking the link: \nhttp://localhost:3000/auth/reset/${user.resetPasswordToken}\n\nBest regards,\nYour Company`,
    };

    await transporter.sendMail(mailOptions);
  }

  async importUsers(file: Multer.File): Promise<any> {
    const ext = path.extname(file.originalname).toLowerCase();
    let users: User[] = [];

    if (ext === '.csv') {
      users = await this.parseCsv(file);
    } else if (ext === '.xml') {
      users = await this.parseXml(file);
    } else if (ext === '.json') {
      users = await this.parseJson(file);
    } else {
      throw new Error('Unsupported file format');
    }

    for (const user of users) {
      this.validateUser(user);
      await this.create(user);
      this.sendConfirmationEmail(user);
    }

    return { message: 'Users imported successfully' };
  }

  private async parseCsv(file: Multer.File): Promise<User[]> {
    const users: User[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => users.push(data))
        .on('end', () => resolve(users))
        .on('error', (error) => reject(error));
    });
  }

  private async parseXml(file: Multer.File): Promise<User[]> {
    const parser = new xml2js.Parser();
    const data = fs.readFileSync(file.path);
    const result = await parser.parseStringPromise(data);
    return result.users.user.map((u) => ({
      userId: 0,
      firstName: u.firstName[0],
      lastName: u.lastName[0],
      email: u.email[0],
      password: u.password[0],
      role: u.role[0],
    }));
  }

  private async parseJson(file: Multer.File): Promise<User[]> {
    const data = fs.readFileSync(file.path, 'utf8');
    return JSON.parse(data);
  }

  private validateUser(user: User) {
    // Implementation for validating user
  }
}
