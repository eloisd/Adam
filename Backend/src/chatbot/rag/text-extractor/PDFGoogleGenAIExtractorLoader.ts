import { DocumentLoader } from "@langchain/core/dist/document_loaders/base";
import { Document } from "langchain/document";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as fs from "node:fs";
import { PDFDocument } from "pdf-lib";
import * as sharp from "sharp";
import { FileEntity } from "../../../entities/file.entity";
import { TopicEntity } from "../../../entities/topic.entity";
import { SystemMessage } from "@langchain/core/messages";
import { BaseDocumentTransformer } from "@langchain/core/documents";
import { fromPath } from 'pdf2pic';

export class PDFGoogleGenAIExtractorLoader implements DocumentLoader {
  file: FileEntity;
  topic: TopicEntity;
  model: ChatGoogleGenerativeAI;

  constructor(file: FileEntity, model: ChatGoogleGenerativeAI) {
    this.topic = file.topic;
    this.file = file;
    this.model = model;
  }

  async load(): Promise<Document[]> {
    const content = await this.createTxtContent();
    const document = new Document({
      pageContent: content.text,
      metadata: {
        topic_id: this.topic.id,
        file_id: this.file.id,
        document_type: this.file.document_type,
        description: this.file.description,
        created_at: new Date().toISOString(),
      },
    });

    return [document];
  }

  /**
   * Converts PDF pages to base64 encoded images
   */
  private async pdfToBase64Images(pdfPath: string): Promise<string[]> {
    const images: string[] = [];
    const pdfBytes = await fs.promises.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    for (let pageNum = 1; pageNum <= pdfDoc.getPageCount(); pageNum++) {
      // Extract this page as a new PDF
      const singlePagePdf = await PDFDocument.create();
      const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageNum]);
      singlePagePdf.addPage(copiedPage);
      const pageBytes = await singlePagePdf.save();

      // Use sharp to convert PDF to PNG (requires pdf renderer like ghostscript)
      const pngBuffer = await sharp(pageBytes, { density: 300 })
        .png({ quality: 85 })
        .toBuffer();

      // Convert to base64
      const base64Image = pngBuffer.toString("base64");
      images.push(base64Image);
    }

    return images;
  }

  /**
   * Creates text content from PDFs using Gemini
   */
  private async createTxtContent() {
    const base64Images = await this.pdfToBase64Images(this.file.path);

    // Create content for Gemini
    const content: any = [
      {
        type: "text",
        text:
          `Tu es expert en ${this.topic.name}.\n` +
          `Voici un ${this.file.document_type} sur ${this.file.description}.\n` +
          "Il y a dans ce document des images explicatives et des formules mathématiques.\n" +
          "Ton but est de faire un fichier texte qui redit exactement tout ce qui est expliqué dans ce " +
          "document en incluant les formules mathématiques et les explications que les images peuvent apporter.\n",
      },
    ];

    // Add each page as an image
    base64Images.forEach((imgBase64) => {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${imgBase64}`
        },
      });
    });

    const message = new SystemMessage(content);

    return this.model.invoke([message]);
  }

  loadAndSplit(textSplitter?: BaseDocumentTransformer): Promise<Document[]> {
    return Promise.resolve([]);
  }
}