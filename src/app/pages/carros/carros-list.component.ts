import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CarroService } from '../../services/carro.service';
import { Carro } from '../../models/carro';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { LoadingOverlayComponent } from '../../shared/loading-overlay.component';

@Component({
  selector: 'app-carros-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    LoadingOverlayComponent
  ],
  templateUrl: './carros-list.component.html',
  styleUrls: ['./carros-list.component.scss']
})
export class CarrosListComponent implements OnInit {
  displayedColumns = ['marca', 'modelo', 'ano', 'problema', 'diagnostico', 'actions'];
  data: Carro[] = [];

  carregando = false;

  constructor(
    private service: CarroService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.carregando = true;
    this.service.list().subscribe({
      next: result => {
        this.data = result;
        this.carregando = false;
      },
      error: err => {
        console.error('Erro ao listar carros', err);
        this.carregando = false;
      }
    });
  }

  novo(): void {
    this.router.navigate(['/carros/new']);
  }

  editar(c: Carro): void {
    this.router.navigate(['/carros', c.id]);
  }

  deletar(c: Carro): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir carro',
        message: `Tem certeza que deseja excluir "${c.marca} ${c.modelo}" ?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(ok => {
      if (ok && c.id != null) {
        this.carregando = true;
        this.service.delete(c.id).subscribe({
          next: () => this.load(),
          error: err => {
            console.error('Erro ao excluir carro', err);
            this.carregando = false;
          }
        });
      }
    });
  }
}
