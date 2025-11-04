import { Oficina } from './oficina';

export type OficinaRef = Pick<Oficina, 'id'>; // ou 'id' | 'nome' se quiser exibir

export interface Carro {
    id?: number;
    marca: string;
    modelo: string;
    ano?: number;
    problema?: string;
    diagnostico?: string;
    oficina?: OficinaRef | null; // <— aceita {id} ou null
}
