import {AfterViewInit, Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[textarea[appAutoResize_textarea]]',
  standalone: true
})
export class AutoResize_elDirective implements AfterViewInit {
  private _yPadding = 0;
  private _lineHeight = 0;

  constructor(private _el: ElementRef<HTMLTextAreaElement>) {}

  ngAfterViewInit(): void {
    this._configureHeights();
    this._setHeightRange();
    this._resize();
    this._el.nativeElement.addEventListener('input', () => this._resize());
  }

  _resize() {
    // Calcul de la hauteur à partir du contenu courant
    if (this._el) {
      this._el.nativeElement.style.height = 'auto';
      this._el.nativeElement.style.height = `${this._el.nativeElement.scrollHeight}px`;
    }
  }

  /**
   * Calcule les hauteurs des lignes et du padding lorsque c'est nécessaire.
   */
  _configureHeights() {
    const clone = this._el?.nativeElement.cloneNode(true) as HTMLTextAreaElement;

    // Configurer l'élément comme invisible
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';

    // Supprimer les espacements verticaux parasites (sauf padding)
    clone.style.border = 'none';
    clone.style.height = '';
    clone.style.minHeight = '';
    clone.style.maxHeight = '';

    if (this._el?.nativeElement.parentNode) {
      this._el?.nativeElement.parentNode.appendChild(clone);

      const height = clone.getBoundingClientRect().height;

      clone.style.padding = '0';
      this._lineHeight = clone.clientHeight;
      this._yPadding = height - this._lineHeight + 2; // +2 pour compenser les erreurs d'arrondi
    }

    clone.remove();
  }

  /**
   * Configure l'attribut rows et la hauteur min et max du _el.
   */
  _setHeightRange() {
    // Récupération des paramètres
    const min = Number.parseInt(this._el?.nativeElement.dataset['rowsMin'] || '1');
    const max = Number.parseInt(this._el?.nativeElement.dataset['rowsMax'] || '4');

    if (isNaN(min) || isNaN(max)) {
      throw new Error("'data-rows-min' and 'data-rows-max' data attributes must be integers");
    }

    if (!this._el || !this._el.nativeElement) return;

    const borderWidth = this._el?.nativeElement.offsetHeight - this._el?.nativeElement.clientHeight;

    // Appliquer les règles
    this._el.nativeElement.rows = min;
    this._el.nativeElement.style.minHeight = `${borderWidth + this._yPadding + this._lineHeight * min}px`;
    this._el.nativeElement.style.maxHeight = `${borderWidth + this._yPadding + this._lineHeight * max}px`;
  }
}
