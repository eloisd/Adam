import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from '../../entities/file.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import * as fs from 'fs-extra';
import * as path from 'node:path';

@Injectable()
export class FilesService implements OnModuleInit {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {  }

  async onModuleInit() {
    await this.ensureDirectories();
  }

  private async ensureDirectories() {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  async uploadFiles(topic_id: string, files: Express.Multer.File[], fileEntities: FileEntity[]) {
    const fileEntityList = fileEntities.map((value, index) => {
      value.path = files[index].path;

      return value;
    });

    return this.fileRepository.save(fileEntityList);
  }

  async downloadFile(id: string) {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }

    return { filename: file.name, filePath: file.path };
  }

  getFilesByTopicId(topic_id: string) {
    return this.fileRepository.find({ where: { topic_id } });
  }

  async getFileById(id: string, relations?: FindOptionsRelations<FileEntity>) {
    const file = await this.fileRepository.findOne({
      select: {  },
      where: { id },
      relations: relations,
    });
    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }
    return file;
  }

  async deleteFile(id: string) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('Fichier non trouvé');
    }

    await fs.remove(file.path);

    return this.fileRepository.delete(id);
  }

  updateFile(id: string, file: Partial<FileEntity>) {
    return this.fileRepository.update(id, file);
  }
}
