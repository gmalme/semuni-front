import {Carro} from "./carro";

export interface Oficina {
    id: number;
    nome: string;
    endereco?: string | null;
    especialidade?: string | null;
    carros?: Carro[];
}