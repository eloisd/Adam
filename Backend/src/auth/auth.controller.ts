import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { UserEntity } from '../entities/user.entity';

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(await this.authService.validateUser(body.email, body.password));

    this.authService.setCookie(res, refreshToken)

    return res.json({ accessToken: accessToken });
  }

  @Post("register")
  @HttpCode(HttpStatus.OK)
  async register(@Body() user: UserEntity, @Res() res: Response) {
    await this.authService.register(user);

    return res.json({ message: "Utilisateur créé" });
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.refreshToken(req.user);

    this.authService.setCookie(res, refreshToken);

    return res.json({ accessToken: accessToken });
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies["refresh_token"];

    if (refreshToken) {
      this.authService.invalidateRefreshToken(refreshToken);
    }

    this.authService.clearCookie(res);

    return res.json({ message: "Déconnexion réussie et token invalidé" });
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Post("me")
  @HttpCode(HttpStatus.OK)
  me(@Req() req) {
    return req.user;
  }
}
