import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface EventData {
  type: string;
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubject = new Subject<EventData>();

  constructor() {}

  emit(eventData: EventData): void {
    this.eventSubject.next(eventData);
  }

  on(eventType: string): Observable<EventData> {
    return this.eventSubject.asObservable()
      .pipe(
        filter((event: EventData) => event.type === eventType)
      );
  }
}
