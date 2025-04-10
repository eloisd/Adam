import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { FilesModule } from '../api/file/files.module';

@Module({
  imports: [FilesModule],
  controllers: [RagController],
  providers: [RagService]
})
export class RagModule {}
