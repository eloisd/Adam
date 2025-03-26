import { Controller, Get, Query, Res } from "@nestjs/common";
import { createCanvas, registerFont } from 'canvas';
import { Response } from "express";

@Controller("avatar")
export class AvatarController {
  @Get("generate")
  generateInitials(
    @Query("firstname") firstName: string,
    @Query("lastname") lastName: string,
    @Res() res: Response,
  ) {
    const size = 100;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = `#2980B9`;
    ctx.fillRect(0, 0, size, size);

    registerFont('./fonts/Outfit-Thin.ttf', { family: 'CustomFont' });

    const initials =
      `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
    ctx.font = `100 ${size / 2.25}px`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, size / 2, size / 2);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "max-age=86400, public");
    canvas.createPNGStream().pipe(res);
  }
}
