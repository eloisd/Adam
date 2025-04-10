import {
  BadRequestException, Body,
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
import { FileEntity } from '../../entities/file.entity';
import { UploadDto } from './dto/updload.dto';

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
    @Query("topic_id") topic_id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() uploadDto: UploadDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException("Aucun fichier reçu");
    }

    let fileEntities: FileEntity[] = [];
    if (Array.isArray(uploadDto.filesModel)) {
      fileEntities = uploadDto.filesModel.map((value) => JSON.parse(value));
    } else {
      fileEntities = [JSON.parse(uploadDto.filesModel)];
    }

    return this.filesService.uploadFiles(topic_id, files, fileEntities);
  }

  @Get('download')
  async downloadFile(@Query('id') id: string, @Res() res: Response) {
    const { filename, filePath } = await this.filesService.downloadFile(id);

    res.download(filePath, filename);
  }

  @Get()
  async getFilesByTopicId(@Query('topic_id') topic_id: string) {
    return this.filesService.getFilesByTopicId(topic_id);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    return this.filesService.deleteFile(id);
  }
}
