import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

    /** Normaliza a resposta da API -> model do front */
    private fromApi = (row: any): Oficina => {
        return {
            // mantém quaisquer outros campos que venham do backend
            ...(row ?? {}),
            id: Number(row?.id),                       // ← garante number
            nome: String(row?.nome ?? ''),
            endereco: row?.endereco ?? null,
            especialidade: row?.especialidade ?? null
        } as Oficina;
    };

    list(): Observable<Oficina[]> {
        return this.http.get<any[]>(this.baseUrl).pipe(
            map((list) => (list ?? []).map((o) => this.fromApi(o)))
        );
    }

    get(id: number): Observable<Oficina> {
        return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
            map((o) => this.fromApi(o))
        );
    }

    create(oficina: Partial<Oficina>): Observable<Oficina> {
        return this.http.post<any>(this.baseUrl, this.toPayload(oficina)).pipe(
            map((o) => this.fromApi(o))
        );
    }

    update(id: number, oficina: Partial<Oficina>): Observable<Oficina> {
        return this.http.put<any>(`${this.baseUrl}/${id}`, this.toPayload(oficina)).pipe(
            map((o) => this.fromApi(o))
        );
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
