import {MARKED_OPTIONS, MarkedOptions, provideMarkdown} from 'ngx-markdown';
import {SecurityContext} from '@angular/core';
import {marked} from 'marked';

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new marked.Renderer();

  // Code inline
  renderer.codespan = ({ text }): string => {
    // Escape HTML to prevent XSS attacks
    return `<code class="language-plaintext inline">${escapeHtml(text)}</code>`;
  };

  // Code blocks
  renderer.code = ({ text, lang }): string => {
    const langText = lang ? lang : 'plaintext';
    const langClass = lang ? `language-${lang === 'html' ? 'xml' : lang}` : 'language-plaintext';
    return `<pre class="${langClass}"><div class="header hljs">${langText}</div><app-chat-bubble></app-chat-bubble><code class="${langClass}">${escapeHtml(text)}</code></pre>`;
  };

  return { renderer };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function provideMarkdownConfig() {
  return provideMarkdown({
    markedOptions: {
      provide: MARKED_OPTIONS,
      useFactory: () => markedOptionsFactory(),
    },
    sanitize: SecurityContext.NONE,
  });
}
