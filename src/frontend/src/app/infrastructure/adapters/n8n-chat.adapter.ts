import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ChatPort } from '../../domain/ports/chat.port';
import { ChatPayload, ChatResponse } from '../../domain/models/chat.model';
import { N8nChatRequestDto, N8nChatResponseDto } from '../dtos/n8n-chat.dto';
import { CHAT_WEBHOOK_URL } from '../../core/tokens/chat-config.token';

@Injectable({ providedIn: 'root' })
export class N8nChatAdapter implements ChatPort {
  private readonly http = inject(HttpClient);
  private readonly webhookUrl = inject(CHAT_WEBHOOK_URL);

  sendMessage(payload: ChatPayload): Observable<ChatResponse> {
    const requestDto: N8nChatRequestDto = {
      message: payload.message,
      sessionId: payload.sessionId
    };

    return this.http.post<N8nChatResponseDto>(this.webhookUrl, requestDto).pipe(
      map(res => {
        const replyText = res.reply ?? res.output ?? res.text ?? '';
        if (!replyText) {
          throw new Error('Respuesta vacía del asistente.');
        }
        return {
          reply: replyText,
          sessionId: res.sessionId ?? payload.sessionId
        };
      }),
      catchError(err => {
        const errorMsg =
          err.status === 0
            ? 'No se pudo conectar con el agente de n8n. Por favor verifica que el webhook esté activo.'
            : err.error?.reply || err.message || 'Error temporal al procesar tu consulta con la IA.';
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
