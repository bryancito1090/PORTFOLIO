import { Observable } from 'rxjs';
import { ChatPayload, ChatResponse } from '../models/chat.model';

export abstract class ChatPort {
  abstract sendMessage(payload: ChatPayload): Observable<ChatResponse>;
}
