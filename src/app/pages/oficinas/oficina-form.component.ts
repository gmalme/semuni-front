import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { OficinaService } from '../../services/oficina.service';
import { Oficina } from '../../models/oficina';
import { LoadingOverlayComponent } from '../../shared/loading-overlay.component'; // ***

@Component({
  selector: 'app-oficina-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    LoadingOverlayComponent // ***
  ],
  templateUrl: './oficina-form.component.html',
  styleUrls: ['./oficina-form.component.scss']
})
export class OficinaFormComponent implements OnInit {
  form!: FormGroup;
  id?: number;
  titulo = 'Nova Oficina';

  carregando = false; // ***
  salvando = false;   // ***

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: OficinaService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      endereco: ['', Validators.required],
      especialidade: ['', Validators.required]
    });

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId && paramId !== 'new') {
      this.id = Number(paramId);
      this.titulo = 'Editar Oficina';
      this.carregarOficina(this.id);
    }
  }

  private carregarOficina(id: number): void {
    this.carregando = true;
    this.service.get(id).subscribe({
      next: (o: Oficina) => {
        this.form.patchValue({
          nome: o.nome,
          endereco: o.endereco,
          especialidade: o.especialidade
        });
        this.carregando = false;
      },
      error: err => {
        console.error('Erro ao carregar oficina', err);
        this.carregando = false;
        this.router.navigate(['/oficinas']);
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    const payload: Partial<Oficina> = this.form.value;

    if (this.id) {
      this.service.update(this.id, payload).subscribe({
        next: () => {
          this.salvando = false;
          this.router.navigate(['/oficinas']);
        },
        error: err => {
          console.error('Erro ao atualizar oficina', err);
          this.salvando = false;
        }
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.salvando = false;
          this.router.navigate(['/oficinas']);
        },
        error: err => {
          console.error('Erro ao criar oficina', err);
          this.salvando = false;
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/oficinas']);
  }

  // helper pra saber se mostra overlay
  get busy(): boolean {
    return this.carregando || this.salvando;
  }
}
