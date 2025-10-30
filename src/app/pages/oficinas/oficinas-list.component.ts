import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OficinaService } from '../../services/oficina.service';
import { Oficina } from '../../models/oficina';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { LoadingOverlayComponent } from '../../shared/loading-overlay.component'; // ***

@Component({
  selector: 'app-oficinas-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    LoadingOverlayComponent // ***
  ],
  templateUrl: './oficinas-list.component.html',
  styleUrls: ['./oficinas-list.component.scss']
})
export class OficinasListComponent implements OnInit {
  displayedColumns = ['nome', 'endereco', 'especialidade', 'actions'];
  data: Oficina[] = [];

  carregando = false; // ***

  constructor(
    private service: OficinaService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.carregando = true; // ***
    this.service.list().subscribe({
      next: result => {
        this.data = result;
        this.carregando = false; // ***
      },
      error: err => {
        console.error('Erro ao listar oficinas', err);
        this.carregando = false; // ***
      }
    });
  }

  novo(): void {
    this.router.navigate(['/oficinas/new']);
  }

  editar(oficina: Oficina): void {
    this.router.navigate(['/oficinas', oficina.id]);
  }

  deletar(oficina: Oficina): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir oficina',
        message: `Tem certeza que deseja excluir "${oficina.nome}" ?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (ok && oficina.id != null) {
        this.carregando = true; // *** feedback enquanto apaga
        this.service.delete(oficina.id).subscribe({
          next: () => this.load(),
          error: err => {
            console.error('Erro ao excluir oficina', err);
            this.carregando = false; // ***
          }
        });
      }
    });
  }
}
