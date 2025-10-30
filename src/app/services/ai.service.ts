import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface AiRequest {
  problema: string;
}

export interface AiResponse {
  diagnosticoSugerido: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {

  private baseUrl = `${environment.apiBaseUrl}/ai`;

  constructor(private http: HttpClient) {}

  sugerirDiagnostico(problema: string): Observable<AiResponse> {
    return this.http.post<AiResponse>(
      `${this.baseUrl}/sugerir-diagnostico`,
      { problema } as AiRequest
    );
  }
}
