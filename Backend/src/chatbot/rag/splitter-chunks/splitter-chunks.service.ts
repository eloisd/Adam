// splitter-chunks.service.ts
import { Injectable } from "@nestjs/common";
import { Document } from "langchain/document";
import { Subject } from "rxjs";
import { StreamingGPTSplitter } from "./splitter/StreamingGPTSplitter";
import { ChromaDbService } from "../../vector-store/chromadb/chromadb.service";
import { OpenAiService } from "../../llm/openai/openai.service";

@Injectable()
export class SplitterChunksService {
  private streamingSplitter: StreamingGPTSplitter;

  constructor(
    private readonly openAiService: OpenAiService,
    private readonly chromaDbService: ChromaDbService,
  ) {
    this.streamingSplitter = new StreamingGPTSplitter(
      this.openAiService.getChatModel('gpt-4o-mini'),
    );
  }

  /**
   * Split text into semantic chunks using GPT with streaming
   * @param text The text to split
   * @returns Observable of chunks as they are processed
   */
  splitText(text: string) {
    return this.streamingSplitter.splitText(text);
  }

  /**
   * Split text into semantic chunks using GPT with streaming
   * @param text The text to split
   * @returns Observable of chunks as they are processed
   */
  splitTextStreaming(text: string) {
    return this.streamingSplitter.splitTextStream(text);
  }

  /**
   * Process a document for a specific conversation
   * @param content
   * @param metadata
   * @param topic_id Unique ID of the conversation
   * @returns Observable of Document objects
   */
  async processTopicDocumentStreaming(
    content: string,
    topic_id: string,
    metadata?: Record<string, any>,
  ) {
    // Create a subject to emit Document objects
    const documentsSubject = new Subject<Document>();

    // Ensure metadata includes conversationId
    const enhancedMetadata = {
      ...metadata,
      topic_id: topic_id, // This is critical for filtering later
      timestamp: new Date().toISOString(),
    };

    // Start streaming and process each chunk as it comes
    (await this.splitTextStreaming(content)).subscribe({
      next: (chunk) => {
        // Create Document object for the chunk with conversation metadata
        const document = new Document({
          pageContent: chunk,
          metadata: enhancedMetadata,
        });

        // Process embedding in the background
        this.processChunkEmbedding([document])
          .then(() => {
            // Once embedded, emit the document
            documentsSubject.next(document);
          })
          .catch((error) => {
            console.error("Error processing chunk embedding:", error);
          });
      },
      error: (err) => {
        console.error("Error in streaming process:", err);
        documentsSubject.error(err);
      },
      complete: () => {
        documentsSubject.complete();
      },
    });

    return documentsSubject.asObservable();
  }

  /**
   * Process a document for a specific conversation
   * @param content
   * @param metadata
   * @param topic_id Unique ID of the conversation
   * @returns Observable of Document objects
   */
  async processTopicDocument(
    content: string,
    topic_id: string,
    metadata?: Record<string, any>,
  ) {
    // Ensure metadata includes conversationId
    const enhancedMetadata = {
      ...metadata,
      topic_id: topic_id, // This is critical for filtering later
      timestamp: new Date().toISOString(),
    };

    const chunks = await this.splitText(content);

    const docs = chunks.map((chunk) => new Document({
      pageContent: chunk,
      metadata: enhancedMetadata,
    }));

    await this.processChunkEmbedding(docs)
  }

  /**
   * Process embeddings for a chunk and store in ChromaDB
   * @param docs
   */
  private async processChunkEmbedding(docs: Document[]): Promise<void> {
    // Add the document to ChromaDB (which will generate embeddings)
    await this.chromaDbService.addDocuments(docs);
  }
}