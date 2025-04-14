import { ChatPromptTemplate } from '@langchain/core/prompts';
import { TextSplitter } from '@langchain/textsplitters';
import { Subject } from 'rxjs';
import { ChatOpenAI } from '@langchain/openai';

/**
 * GPT-powered text splitter that processes chunks as they're streamed
 */
export class StreamingGPTSplitter extends TextSplitter {
  private model: ChatOpenAI;
  private prompt: ChatPromptTemplate;

  constructor(model: ChatOpenAI, options: Record<string, any> = {}) {
    super(options);
    this.model = model;

    this.prompt = ChatPromptTemplate.fromTemplate(
      "You are an expert in identifying semantic meaning of text. " +
      "You wrap each chunk in <<<>>>.\n\n" +
      "Example:\n" +
      `Text: 
"## TABLE DES MATIÈRES

1. Motivation
2. Types de graphes
3. Applications dans les graphes
4. Node embeddings
5. GNN

## HISTORIQUE DES GNN

- Les graphes attirent l'intérêt des chercheurs en mathématique et en informatique depuis très longtemps
- La première application concrète des réseaux de neurones aux graphes date de 1997 - A. Sperduti and A. Starita
- Cependant, la première référence connu au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010)
  - Ces GNN tombaient dans la catégorie des réseaux récurrents (RecGNN)
  - Ils souffrent donc des mêmes problèmes à l'entraînement!
- Les GNN sont réellement devenus populaires suite à l'adaptation de la convolution par Bruna et al (2013) - ConvGNN
- Depuis, il existe des GNN exploitant tous les types d'unité: GAE, Transformeur, etc.

## MOTIVATION

- Nous avons vu jusqu'à présent qu'il faut parfois prendre en considération le format des données afin de bien tirer avantage d'informations qui peuvent s'y cacher
  - Par exemple, les informations de nature spatiale sont particulièrement bien exploitées à l'aide des convolutions
  - Et celles de nature séquentielle/temporelle à l'aide d'unités récurrentes
- Les graphes eux incorporent de l'information relationnelle, pas toujours bien capturées par une structure en grille dont le nombre de voisins est fixé à l'avance
  - Les CNN et RNN se concentrent sur la capture d'informations d'un nœud unique (pixel, mot, etc.)
  - Ils ne capturent pas bien l'information contextuelle des nœuds voisins et de leurs liens"\n` +
      `Wrapped:\n
<<<## TABLE DES MATIÈRES \t 1. Motivation 2. Types de graphes 3. Applications dans les graphes 4. Node embeddings 5. GNN>>>
<<<## HISTORIQUE DES GNN \t - Les graphes attirent l'intérêt des chercheurs en mathématique et en informatique depuis très longtemps>>>
<<<## HISTORIQUE DES GNN \t - La première application concrète des réseaux de neurones aux graphes date de 1997 - A. Sperduti and A. Starita>>>
<<<## HISTORIQUE DES GNN \t - Cependant, la première référence connu au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010) \t - Ces GNN tombaient dans la catégorie des réseaux récurrents (RecGNN)>>>
<<<## HISTORIQUE DES GNN \t - Cependant, la première référence connu au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010) \t - Ils souffrent donc des mêmes problèmes à l'entraînement!>>>
<<<## HISTORIQUE DES GNN \t - Les GNN sont réellement devenus populaires suite à l'adaptation de la convolution par Bruna et al (2013) - ConvGNN>>>
<<<## HISTORIQUE DES GNN \t - Depuis, il existe des GNN exploitant tous les types d'unité: GAE, Transformeur, etc.>>>
<<<S## MOTIVATION \t - Nous avons vu jusqu'à présent qu'il faut parfois prendre en considération le format des données afin de bien tirer avantage d'informations qui peuvent s'y cacher \t - Par exemple, les informations de nature spatiale sont particulièrement bien exploitées à l'aide des convolutions>>>
<<<S## MOTIVATION \t - Nous avons vu jusqu'à présent qu'il faut parfois prendre en considération le format des données afin de bien tirer avantage d'informations qui peuvent s'y cacher \t - Et celles de nature séquentielle/temporelle à l'aide d'unités récurrentes>>>
<<<S## MOTIVATION \t - Les graphes eux incorporent de l'information relationnelle, pas toujours bien capturées par une structure en grille dont le nombre de voisins est fixé à l'avance \t - Les CNN et RNN se concentrent sur la capture d'informations d'un nœud unique (pixel, mot, etc.)>>>
<<<S## MOTIVATION \t - Les graphes eux incorporent de l'information relationnelle, pas toujours bien capturées par une structure en grille dont le nombre de voisins est fixé à l'avance \t - Ils ne capturent pas bien l'information contextuelle des nœuds voisins et de leurs liens>>>\n\n` +
      "Now, process the following text:\n\n" +
      "{text}"
    );
  }

  /**
   * Split text and return chunks as an Observable stream
   * @param text Text to split
   * @returns Observable that emits chunks as they are identified
   */
  async splitTextStream(text: string) {
    const chunkSubject = new Subject<string>();

    // Create and store partial chunks as they're being built
    let currentBuffer = '';

    const prompt = await this.prompt.formatMessages({ text: text });

    // Get streaming response from the model
    const promise = this.model.invoke(prompt, {
      callbacks: [
        {
          handleLLMNewToken: (token: string) => {
            // Append token to the current buffer
            currentBuffer += token;

            // Check if the token contains the closing tag
            if (currentBuffer.includes('>>>')) {
              this.processBuffer(currentBuffer, (chunk) => {
                chunkSubject.next(chunk);
              });
              currentBuffer = ''; // Reset buffer after processing
            }
          }
        },
        {
          handleLLMEnd: () => {
            // Emit any remaining buffer content
            if (currentBuffer) {
              this.processBuffer(currentBuffer, (chunk) => {
                chunkSubject.next(chunk);
              });
            }
            chunkSubject.complete();
          }
        }
      ]
    })

    promise.catch((err) => {
      chunkSubject.error(err);
      chunkSubject.complete();
    });

    return chunkSubject.asObservable();
  }

  /**
   * Process the current buffer to find and extract chunks
   * @param buffer Current text buffer to process
   * @param chunkCallback Callback function to handle extracted chunks
   */
  private processBuffer(buffer: string, chunkCallback: (chunk: string) => void): void {
    // Use regex to find all complete chunks in the current buffer
    const regex = /<<<(.*?)>>>/g;
    let match;

    while ((match = regex.exec(buffer)) !== null) {
      if (match[1]) {
        chunkCallback(match[1].trim());
      }
    }
  }

  /**
   * Split text into chunks (non-streaming version)
   * @param text Text to split
   * @returns Promise with array of chunks
   */
  splitText(text: string) {
    return new Promise<string[]>(async (resolve, reject) => {
      const chunks: string[] = [];

      (await this.splitTextStream(text)).subscribe({
        next: (chunk) => chunks.push(chunk),
        error: (err) => reject(err),
        complete: () => resolve(chunks)
      });
    });
  }
}