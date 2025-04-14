import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from "langchain/document";

@Injectable()
export class ChromaDbService implements OnModuleInit {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: Chroma;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const chromaUrl = this.configService.get<string>('CHROMA_URL') || 'http://localhost:8000';

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: this.configService.get<string>("OPENAI_API_KEY"),
      model:
        this.configService.get<string>("EMBEDDING_MODEL") ||
        "text-embedding-3-small",
    });

    this.vectorStore = await Chroma.fromExistingCollection(
      this.embeddings,
      {
        collectionName: 'document_chunks',
        url: chromaUrl,
      },
    );
  }

  /**
   * Rechercher les documents similaires à une requête.
   */
  async querySimilarDocuments(query: string, k = 5) {
    return this.vectorStore.similaritySearch(query, k);
  }

  /**
   * Ajouter de nouveaux documents vectorisés à la base.
   */
  addDocuments(docs: Document[]) {
    return this.vectorStore.addDocuments(docs);
  }

  getRetriever(k = 5) {
    return this.vectorStore.asRetriever(k);
  }
}
