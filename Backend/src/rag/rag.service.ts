import { Injectable, OnModuleInit } from '@nestjs/common';
import { FilesService } from "src/api/file/files.service";
import { OpenAIEmbeddings } from '@langchain/openai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { ConfigService } from '@nestjs/config';
import { FileEntity } from '../entities/file.entity';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';

@Injectable()
export class RagService implements OnModuleInit {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: Chroma;

  constructor(
    private filesService: FilesService,
    private configService: ConfigService,
  ) { }

  async onModuleInit() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: this.configService.get<string>("OPENAI_API_KEY"),
      modelName:
        this.configService.get<string>("EMBEDDING_MODEL") ||
        "text-embedding-3-small",
    });

    this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
      collectionName: "document_chunks",
      url: this.configService.get<string>("CHROMA_URL") || "http://localhost:8000",
    });
  }

  async processFileForRAG(fileId: string) {
    const file = await this.filesService.getFileById(fileId);
    if (!file) {
      throw new Error(`File with ID ${fileId} not found`);
    }

    const docs = await this.loadDocumentByType(file);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    const docsWithIndices = splitDocs.map((doc, index) => {
      doc.metadata.chunkIndex = index;
      return doc;
    });

    await this.vectorStore.addDocuments(docsWithIndices);
  }

  private async loadDocumentByType(fileMetada: FileEntity) {
    let loader;

    switch (fileMetada.mimetype) {
      case "application/pdf":
        loader = new PDFLoader(fileMetada.path);
        break;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        loader = new DocxLoader(fileMetada.path);
        break;
      case "text/plain":
        loader = new TextLoader(fileMetada.path);
        break;
      case "text/csv":
        loader = new CSVLoader(fileMetada.path);
        break;
      case "application/json":
        loader = new JSONLoader(fileMetada.path, "/");
        break;
      default:
        throw new Error(`Type de fichier non supporté: ${fileMetada.mimetype}`);
    }

    const docs = await loader.load();

    return docs.map((doc) => {
      doc.metadata = {
        ...doc.metadata,
        ...fileMetada
      };
      return doc;
    });
  }
}
