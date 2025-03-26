import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from '../../entities/file.entity';
import { Repository } from 'typeorm';
import * as path from 'node:path';
import * as fs from 'fs-extra';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {  }

  async uploadFiles(topic_id: number, files: Express.Multer.File[]) {
    const fileEntityList = files.map((file) => {
      const parse = path.parse(file.originalname)
      const newFile = new FileEntity();
      newFile.topic_id = topic_id;
      newFile.name = parse.name;
      newFile.path = file.path;
      newFile.size = file.size;
      newFile.mimetype = file.mimetype;
      newFile.ext = parse.ext;
      return newFile;
    });

    const savedFiles = await this.fileRepository.save(fileEntityList)

    savedFiles.forEach((file) => {
      file.url = `http://localhost:3000/api/files/download?id=${file.id}`;
    })

    return this.fileRepository.save(savedFiles);
  }

  async downloadFile(id: number) {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }

    return { filename: file.name, filePath: file.path };
  }

  getFilesByTopicId(topic_id: number) {
    return this.fileRepository.find({ where: { topic_id } });
  }

  async deleteFile(id: number) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }

    await fs.remove(file.path);

    return this.fileRepository.delete(id);
  }
}
