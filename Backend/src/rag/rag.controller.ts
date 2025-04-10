import { Controller, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private ragService: RagService) {}

  @Post(':id')
  async processFileForRAG(@Param('id') id: string) {
    try {
      await this.ragService.processFileForRAG(id);
      return { success: true, message: 'File processed for RAG successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
