// imports iguais aos seus, EXCETO remover OficinaService/Oficina e AiService
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { CarroService } from '../../services/carro.service';
import { Carro } from '../../models/carro';
import { LoadingOverlayComponent } from '../../shared/loading-overlay.component';

@Component({
    selector: 'app-carro-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        LoadingOverlayComponent
    ],
    templateUrl: './carro-form.component.html',
    styleUrls: ['./carro-form.component.scss']
})
export class CarroFormComponent implements OnInit {
    form!: FormGroup;
    id?: number;
    titulo = 'Novo Carro';

    carregando = false;
    salvando = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private service: CarroService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            marca: ['', Validators.required],
            modelo: ['', Validators.required],
            ano: [null, Validators.required],
            problema: ['', Validators.required]
        });

        const paramId = this.route.snapshot.paramMap.get('id');
        if (paramId && paramId !== 'new') {
            this.id = Number(paramId);
            this.titulo = 'Editar Carro';
            this.carregarCarro(this.id);
        }
    }

    private carregarCarro(id: number): void {
        this.carregando = true;
        this.service.get(id).subscribe({
            next: (c: Carro) => {
                this.form.patchValue({
                    marca: c.marca,
                    modelo: c.modelo,
                    ano: c.ano,
                    problema: c.problema
                });
                this.carregando = false;
            },
            error: err => {
                console.error('Erro ao carregar carro', err);
                this.carregando = false;
                this.router.navigate(['/carros']);
            }
        });
    }

    salvar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.salvando = true;

        const { marca, modelo, ano, problema } = this.form.value as Partial<Carro>;
        const payload: Partial<Carro> = { marca, modelo, ano, problema };

        const obs = this.id
            ? this.service.update(this.id, payload)
            : this.service.create(payload);

        obs.subscribe({
            next: () => { this.salvando = false; this.router.navigate(['/carros']); },
            error: err => { console.error('Erro ao salvar carro', err); this.salvando = false; }
        });
    }

    cancelar(): void {
        this.router.navigate(['/carros']);
    }

    get busy(): boolean { return this.carregando || this.salvando; }

    get busyMessage(): string {
        if (this.salvando) return 'Salvando dados do carro...';
        return 'Carregando dados do carro...';
    }
}
