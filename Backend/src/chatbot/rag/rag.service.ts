import { Injectable, OnModuleInit } from "@nestjs/common";
import { FilesService } from "src/api/file/files.service";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ConfigService } from "@nestjs/config";
import { FileEntity } from "../../entities/file.entity";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { BaseDocumentLoader } from "@langchain/core/dist/document_loaders/base";
import { SplitterChunksService } from "./splitter-chunks/splitter-chunks.service";
import { lastValueFrom, Observable } from 'rxjs';
import { Document } from "langchain/document";
import { PDFGoogleGenAIExtractorLoader } from './text-extractor/PDFGoogleGenAIExtractorLoader';
import { GoogleGenaiService } from '../llm/google-genai/google-genai.service';

@Injectable()
export class RagService implements OnModuleInit {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: Chroma;

  constructor(
    private filesService: FilesService,
    private configService: ConfigService,
    private splitterService: SplitterChunksService,
    private googleGenaiService: GoogleGenaiService
  ) {}

  async onModuleInit() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: this.configService.get<string>("OPENAI_API_KEY"),
      modelName:
        this.configService.get<string>("EMBEDDING_MODEL") ||
        "text-embedding-3-small",
    });

    this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
      collectionName: "document_chunks",
      url:
        this.configService.get<string>("CHROMA_URL") || "http://localhost:8000",
    });
  }

  async processFileForRAG(fileId: string) {
    const file = await this.filesService.getFileById(fileId, { topic: true });
    if (!file) {
      throw new Error(`File with ID ${fileId} not found`);
    }


    const docs = await this.loadDocumentByType(file);

    // const promises = docs.map(async (doc) =>
    //   lastValueFrom<Document>(await this.splitterService.processTopicDocumentStreaming(doc.pageContent, file.topic_id, doc.metadata))
    // );

    const promises = docs.map(async (doc) =>
      this.splitterService.processTopicDocument(doc.pageContent, file.topic_id, doc.metadata)
    );

    try {
      await Promise.all(promises);
      await this.filesService.updateFile(file.id, { is_ragged: true });
    } catch (e) {

    }
  }

  private async loadDocumentByType(fileMetada: FileEntity) {
    let loader: BaseDocumentLoader;

    switch (fileMetada.mimetype) {
      case "application/pdf":
        loader = new PDFLoader(fileMetada.path);
        // const model = this.googleGenaiService.getChatModel('models/gemini-2.0-flash')
        // loader = new PDFGoogleGenAIExtractorLoader(fileMetada, model);
        break;
      // case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      //   loader = new DocxLoader(fileMetada.path);
      //   break;
      case "text/plain":
        loader = new TextLoader(fileMetada.path);
        break;
      // case "text/csv":
      //   loader = new CSVLoader(fileMetada.path);
      //   break;
      case "application/json":
        loader = new JSONLoader(fileMetada.path);
        break;
      default:
        throw new Error(`Type de fichier non supporté: ${fileMetada.mimetype}`);
    }

    return await loader.load();
  }
}
