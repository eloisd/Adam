import {Injectable} from '@angular/core';
import hljs from 'highlight.js/lib/core';
import {HLJS_LANGUAGES} from '../../../highlight-languages';

@Injectable({
  providedIn: 'root'
})
export class HighlightService {
  private languagesLoaded = new Set<string>();

  constructor() {
    // Initialisation de highlight.js
    hljs.configure({
      // throwUnescapedHTML: false,
      ignoreUnescapedHTML: false,
    });
  }

  /**
   * Charge dynamiquement un langage highlight.js si nécessaire
   */
  loadLanguage(language: string): Promise<void> {
    if (!language || language === 'plaintext' || this.languagesLoaded.has(language)) {
      return Promise.resolve();
    }

    return new Promise(async (resolve, reject) => {
      // Validation du nom de langage
      if (!/^[a-zA-Z0-9\-]+$/.test(language)) {
        console.warn(`Langage highlight.js non valide: ${language}`);
        reject(`Langage non valide: ${language}`);
        return;
      }

      // Importation dynamique du langage
      const loader = HLJS_LANGUAGES[language];
      if (!loader) {
        console.warn(`Langage non supporté : ${language}`);
        return;
      }

      try {
        const langModule = await loader();
        hljs.registerLanguage(language, langModule.default);
        this.languagesLoaded.add(language);
        resolve();
      } catch (err) {
        console.error(`Erreur lors du chargement du langage "${language}"`, err);
      }
    });
  }

  async highlightElement(element: HTMLElement, language: string) {
    await this.loadLanguage(language);
    hljs.highlightElement(element);
  }
}
