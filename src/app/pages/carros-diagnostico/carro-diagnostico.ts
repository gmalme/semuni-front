import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';   // +++
import { MatSelectModule } from '@angular/material/select';         // +++
import { CarroService } from '../../services/carro.service';
import { LoadingOverlayComponent } from '../../shared/loading-overlay.component';
import { Carro } from '../../models/carro';
import { Oficina } from '../../models/oficina';
import { AiService, DiagnosticoResponse } from '../../services/ai.service';
import { OficinaService } from '../../services/oficina.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-carro-diagnostico',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,   // +++
        MatSelectModule,      // +++
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

    // resultado da IA
    resultado = signal<DiagnosticoResponse | null>(null);

    // id selecionado no <mat-select> (começa null; após IA, definimos para a sugestão)
    selectedOficinaId = signal<number | null>(null); // +++

    // Computado: resolve a oficina selecionada (prioriza o select; se vazio, cai no id da IA)
    melhorOficina = computed(() => {                  // (reaproveitando o mesmo nome)
        const idSelecionado = this.selectedOficinaId();
        const idIa = this.resultado()?.melhorOficinaId ?? null;
        const id = (idSelecionado != null) ? idSelecionado : idIa;
        if (id == null) return undefined;
        return this.oficinas.find(o => o.id === id);
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
            carro: this.carroService.get(this.id),
            oficinas: this.oficinaService.list()
        }).subscribe({
            next: ({ carro, oficinas }) => {
                this.carro = carro;
                this.oficinas = oficinas ?? [];
                this.carregando = false;

                // se já houver um resultado de IA (edge cases), tenta pré-selecionar
                const r = this.resultado();
                if (r?.melhorOficinaId != null) {
                    this.selectedOficinaId.set(Number(r.melhorOficinaId));
                }
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
                especialidade: (o as any).especialidade,
                descricao: (o as any).descricao
            }))
        }).subscribe({
            next: (r) => {
                this.resultado.set(r);
                // pré-seleciona no <mat-select> a oficina sugerida
                this.selectedOficinaId.set(r.melhorOficinaId != null ? Number(r.melhorOficinaId) : null);
                this.gerando = false;
            },
            error: (e) => {
                console.error(e);
                this.erro = 'Erro ao gerar diagnóstico.';
                this.gerando = false;
            }
        });
    }

    // handler do <mat-select>
    onSelectOficina(id: number | null): void {        // +++
        this.selectedOficinaId.set(id);
    }

    aplicarNoCarro(): void {
        const r = this.resultado();
        if (!this.carro || !r) return;

        const chosenId = this.selectedOficinaId() ?? r.melhorOficinaId ?? null;

        // MONTA O CARRO COMPLETO (PUT = replace): mantém todos os campos existentes
        const fullPayload: Carro = {
            ...this.carro,                         // mantém modelo, marca, ano, etc.
            id: this.carro.id!,                    // garante id no corpo
            diagnostico: r.diagnosticoCurto,
            oficina: chosenId != null ? ({ id: chosenId } as any) : null
        };

        this.carroService.update(this.carro.id!, fullPayload).subscribe({
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
