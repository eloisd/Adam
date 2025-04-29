import {ChatbotGateway} from '../../ports/chatbot.gateway';
import {Observable} from 'rxjs';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Message} from '../../models/message.model';
import {AuthStore} from '../../stores/auth.store';
import {Question} from '../../models/question.model';

export class ApiChatbotGateway extends ChatbotGateway {
  readonly http = inject(HttpClient);
  readonly authStore = inject(AuthStore);

  chat(message: Message): Observable<{ p?: string, o?: string, v: any }> {
    return new Observable<{ p?: string, o?: string, v: any }>((observer) => {
      const decoder = new TextDecoder();

      const sendRequest = () => {
        return fetch(`${environment.apiUrl}/chatbot`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authStore.accessToken()}`,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify(message)
        });
      };

      const processResponse = async (response: Response) => {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonString = line.slice(5).trim();
              try {
                const json = JSON.parse(jsonString);
                observer.next(json);
              } catch (err) {
                console.error('Erreur JSON :', err, jsonString);
              }
            }
          }
        }

        observer.complete();
      };

      const refreshToken = () => {
        return new Promise((resolve, reject) => {
          this.authStore.refreshToken().subscribe({
            next: () => resolve(true),
            error: (err) => reject(err)
          });
        })
      }

      const handleFetch = () => {
        sendRequest().then(async response => {
          if (response.status === 401) {
            try {
              await refreshToken();
              const retryResponse = await sendRequest(); // Refaire la requête avec le nouveau token
              await processResponse(retryResponse);
            } catch (refreshError) {
              observer.error(refreshError);
            }
          } else if (!response.ok) {
            observer.error(`Erreur HTTP : ${response.status}`);
          } else {
            await processResponse(response);
          }
        }).catch(error => observer.error(error));
      };

      handleFetch();
    });
  }

  chatTest(message: Message): Observable<{ message: Message, questions: Question[] }> {
    return this.http.post<{ message: Message, questions: Question[] }>(`${environment.apiUrl}/chatbot/test`, message);
  }

}
