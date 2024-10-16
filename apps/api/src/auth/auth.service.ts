import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from 'src/users/schemas/users.schema';
import { User } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';
import { CreatePasswordDto } from './dto/create-password.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { email } = registerDto;
    const confirmationToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = new Date(Date.now() + 10 * 60 * 1000);

    const user = new this.userModel({
      email,
      confirmationToken,
      tokenExpiration,
      isConfirmed: false,
    });

    await user.save();
    this.sendConfirmationEmail(user);
    return user;
  }

  async createPassword(createPasswordDto: CreatePasswordDto): Promise<User> {
    const { token, password } = createPasswordDto;
    const user = await this.userModel.findOne({ confirmationToken: token });

    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    if (Date.now() > user.tokenExpiration.getTime()) {
      throw new BadRequestException('Token expired');
    }

    user.password = bcrypt.hashSync(password, 10);
    user.confirmationToken = null;
    user.tokenExpiration = null;
    user.isConfirmed = true;
    await user.save();

    return user;
  }

  private async sendConfirmationEmail(user: UserDocument) {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_NAME,
      to: user.email,
      subject: 'Confirmez la création de votre compte',
      html: `
        <p>Bonjour,</p>
        <p>Veuillez utiliser le lien suivant pour créer votre mot de passe :</p>
        <p><a href="http://localhost:3000/first-login/${user.confirmationToken}"><strong>Confirmer</strong></a></p>
        <p>Ce lien est valable pendant 10 minutes.</p>
        <p>Si ce lien ne fonctionne pas, collez cette url dans votre navigateur :</p>
        <p>http://localhost:3000/first-login/${user.confirmationToken}</p>
        <br>
        <p>Cordialement,<br>WebInnov</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  }

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
