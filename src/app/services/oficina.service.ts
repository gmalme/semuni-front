import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Oficina } from '../models/oficina';

export type OficinaPayload = {
    nome: string;
    endereco?: string | null;
    especialidade?: string | null;
};

@Injectable({ providedIn: 'root' })
export class OficinaService {
    private baseUrl = `${environment.apiBaseUrl}/oficinas`;

    constructor(private http: HttpClient) {}

    list(): Observable<Oficina[]> {
        return this.http.get<Oficina[]>(this.baseUrl);
    }

    get(id: number): Observable<Oficina> {
        return this.http.get<Oficina>(`${this.baseUrl}/${id}`);
    }

    create(oficina: Partial<Oficina>): Observable<Oficina> {
        return this.http.post<Oficina>(this.baseUrl, this.toPayload(oficina));
    }

    update(id: number, oficina: Partial<Oficina>): Observable<Oficina> {
        return this.http.put<Oficina>(`${this.baseUrl}/${id}`, this.toPayload(oficina));
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    /** Garante que não mandamos `carros` no payload */
    private toPayload(input: Partial<Oficina>): OficinaPayload {
        return {
            nome: input.nome ?? '',
            endereco: input.endereco ?? null,
            especialidade: input.especialidade ?? null
        };
    }
}
