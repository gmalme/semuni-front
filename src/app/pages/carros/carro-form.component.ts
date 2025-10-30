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
import { AiService } from '../../services/ai.service';
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
  gerandoIA = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: CarroService,
    private aiService: AiService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      ano: [null, [Validators.required]],
      problema: ['', Validators.required],
      diagnostico: ['', Validators.required]
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
          problema: c.problema,
          diagnostico: c.diagnostico
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

  gerarSugestaoIA(): void {
    const problema = this.form.value.problema;
    if (!problema || problema.trim().length === 0) {
      return;
    }

    this.gerandoIA = true;
    this.aiService.sugerirDiagnostico(problema).subscribe({
      next: (resp) => {
        this.form.patchValue({
          diagnostico: resp.diagnosticoSugerido
        });
        this.gerandoIA = false;
      },
      error: err => {
        console.error('Erro ao gerar sugestão IA', err);
        this.gerandoIA = false;
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    const payload: Partial<Carro> = this.form.value;

    if (this.id) {
      this.service.update(this.id, payload).subscribe({
        next: () => {
          this.salvando = false;
          this.router.navigate(['/carros']);
        },
        error: err => {
          console.error('Erro ao atualizar carro', err);
          this.salvando = false;
        }
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.salvando = false;
          this.router.navigate(['/carros']);
        },
        error: err => {
          console.error('Erro ao criar carro', err);
          this.salvando = false;
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/carros']);
  }

  // usamos isso no overlay
  get busy(): boolean {
    // se qualquer uma dessas estiver true, mostra overlay
    return this.carregando || this.salvando || this.gerandoIA;
  }

  get busyMessage(): string {
    if (this.gerandoIA) {
      return 'Gerando sugestão de diagnóstico com IA...';
    }
    if (this.salvando) {
      return 'Salvando dados do carro...';
    }
    return 'Carregando dados do carro...';
  }
}
