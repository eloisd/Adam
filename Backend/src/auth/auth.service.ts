import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from "../api/user/user.service";
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../api/user/dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  private refreshTokenBlacklist = new Set<string>();

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findWithFilters({ email });
    if (user[0] && (await bcrypt.compare(password, user[0].password))) {
      const { password, ...result } = user[0];
      return result;
    }
    throw new UnauthorizedException('Identifiants invalides');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async register(userInfo: CreateUserDto) {
    const existingUser = await this.userService.findWithFilters({ email: userInfo.email });
    if (existingUser.length > 0) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    return this.userService.create(userInfo);
  }

  async refreshToken(user: UserEntity) {
    try {
      return this.login({ email: user.email, id: user.id });
    } catch (e) {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  setCookie(res: any, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });
  }

  clearCookie(res: any) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
  }

  generateAccessToken(payload: {email: string, sub: number}) {
    return this.jwtService.sign(payload, { expiresIn: '15m', secret: jwtConstants.JWT_SECRET });
  }

  generateRefreshToken(payload: {email: string, sub: number}) {
    return this.jwtService.sign(payload, { expiresIn: '7d', secret: jwtConstants.JWT_REFRESH_SECRET });
  }

  invalidateRefreshToken(token: string) {
    this.refreshTokenBlacklist.add(token);
  }
}
