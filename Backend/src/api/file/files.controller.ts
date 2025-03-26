import {
  BadRequestException,
  Controller, Delete, Get,
  Param,
  Post, Query, Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from "./files.service";
import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Express, Response } from 'express';
import { diskStorage } from "multer";
import * as path from "path";
import * as crypto from "crypto";

@UseGuards(AuthGuard("jwt-access"))
@Controller("files")
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor("files", 10, {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(16).toString("hex");
          const ext = path.extname(file.originalname);
          cb(null, `${randomName}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(
    @Query("topic_id") topic_id: number,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("Aucun fichier reçu");
    }

    return this.filesService.uploadFiles(topic_id, files);
  }

  @Get('download')
  async downloadFile(@Query('id') id: number, @Res() res: Response) {
    const { filename, filePath } = await this.filesService.downloadFile(id);

    res.download(filePath, filename);
  }

  @Get()
  async getFilesByTopicId(@Query('topic_id') topic_id: number) {
    return this.filesService.getFilesByTopicId(topic_id);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: number) {
    return this.filesService.deleteFile(id);
  }
}
