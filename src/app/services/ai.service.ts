import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DiagnosticoRequest {
    problema: string;
    oficinas?: Array<{
        id: number;                 // tipado como number (sem undefined)
        nome: string;
        especialidade?: string | null;
        descricao?: string | null;
    }>;
}

export interface DiagnosticoResponse {
    diagnosticoCurto: string;
    melhorOficinaId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AiService {
    private baseUrl = `${environment.apiBaseUrl}/ai`; // ex: http://localhost:8080/api

    constructor(private http: HttpClient) {}

    diagnosticar(req: DiagnosticoRequest): Observable<DiagnosticoResponse> {
        return this.http.post<DiagnosticoResponse>(`${this.baseUrl}/diagnostico`, req);
    }
}
