import { Observable } from 'rxjs';
import { CreateGuestbookRequest, GuestbookEntry } from '../models/guestbook.model';

export abstract class GuestbookPort {
  abstract getEntries(limit?: number): Observable<GuestbookEntry[]>;
  abstract createEntry(request: CreateGuestbookRequest): Observable<GuestbookEntry>;
}
