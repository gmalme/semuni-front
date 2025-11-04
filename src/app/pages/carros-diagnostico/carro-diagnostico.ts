// carro-diagnostico.component.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {CarroService} from "../../services/carro.service";
import {LoadingOverlayComponent} from "../../shared/loading-overlay.component";
import {Carro} from "../../models/carro";
import {Oficina} from "../../models/oficina";
import {AiService, DiagnosticoResponse} from "../../services/ai.service";
import {OficinaService} from "../../services/oficina.service";
import {forkJoin} from "rxjs";

@Component({
    selector: 'app-carro-diagnostico',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        LoadingOverlayComponent,
        RouterLink
    ],
    templateUrl: './carro-diagnostico.html',
    styleUrls: ['./carro-diagnostico.scss']
})
export class CarroDiagnosticoComponent implements OnInit {
    id!: number;

    carregando = true;
    gerando = false;
    erro?: string;

    carro?: Carro;
    oficinas: Oficina[] = [];

    resultado = signal<DiagnosticoResponse | null>(null);
    melhorOficina = computed(() => {
        const r = this.resultado();
        if (!r) return undefined;
        return this.oficinas.find(o => o.id === r.melhorOficinaId);
    });

    constructor(
        private route: ActivatedRoute,
        protected router: Router,
        private carroService: CarroService,
        private oficinaService: OficinaService,
        private ai: AiService
    ) {}

    ngOnInit(): void {
        this.id = Number(this.route.snapshot.paramMap.get('id'));
        this.carregando = true;

        forkJoin({
            carro: this.carroService.get(this.id),   // Observable<Carro>
            oficinas: this.oficinaService.list()     // Observable<Oficina[]>
        }).subscribe({
            next: ({ carro, oficinas }) => {
                this.carro = carro;
                this.oficinas = oficinas ?? [];
                this.carregando = false;
            },
            error: (err) => {
                console.error(err);
                this.erro = 'Falha ao carregar dados.';
                this.carregando = false;
            }
        });
    }

    gerarIA(): void {
        if (!this.carro?.problema) return;
        this.gerando = true;
        this.ai.diagnosticar({
            problema: this.carro.problema,

            oficinas: this.oficinas.map(o => ({
                id: o.id,
                nome: o.nome,
                especialidade: (o as any).especialidade, // se existir no seu modelo
                descricao: (o as any).descricao          // se existir no seu modelo
            }))
        }).subscribe({
            next: (r) => { this.resultado.set(r); this.gerando = false; },
            error: (e) => { console.error(e); this.erro = 'Erro ao gerar diagnóstico.'; this.gerando = false; }
        });
    }

    aplicarNoCarro(): void {
        const r = this.resultado();
        if (!this.carro || !r) return;

        const payload: Partial<Carro> = {
            diagnostico: r.diagnosticoCurto,
            ...(r.melhorOficinaId != null ? { oficina: { id: r.melhorOficinaId } } : {})
        };

        this.carroService.update(this.carro.id!, payload).subscribe({
            next: () => this.router.navigate(['/carros']),
            error: (e) => { console.error(e); this.erro = 'Erro ao salvar alterações no carro.'; }
        });
    }

    get busy(): boolean { return this.carregando || this.gerando; }
    get busyMessage(): string {
        if (this.gerando) return 'Gerando diagnóstico e melhor oficina...';
        return 'Carregando dados...';
    }
}
