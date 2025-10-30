import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Carro } from '../models/carro';

@Injectable({ providedIn: 'root' })
export class CarroService {
  private baseUrl = `${environment.apiBaseUrl}/carros`;

  constructor(private http: HttpClient) {}

  list(): Observable<Carro[]> {
    return this.http.get<Carro[]>(this.baseUrl);
  }

  get(id: number): Observable<Carro> {
    return this.http.get<Carro>(`${this.baseUrl}/${id}`);
  }

  create(carro: Partial<Carro>): Observable<Carro> {
    return this.http.post<Carro>(this.baseUrl, carro);
  }

  update(id: number, carro: Partial<Carro>): Observable<Carro> {
    return this.http.put<Carro>(`${this.baseUrl}/${id}`, carro);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
