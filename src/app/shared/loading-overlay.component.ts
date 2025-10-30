import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="overlay" *ngIf="active">
      <div class="overlay-card">
        <mat-progress-spinner
          mode="indeterminate"
          diameter="48">
        </mat-progress-spinner>
        <div class="overlay-text">{{ message || 'Carregando...' }}</div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.28);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000; /* acima do resto da UI */
      backdrop-filter: blur(2px);
    }

    .overlay-card {
      background: #fff;
      min-width: 220px;
      max-width: 80vw;
      border-radius: 12px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.2);
      border: 1px solid rgba(0,0,0,0.05);
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
      text-align: center;
      font-family: Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .overlay-text {
      font-size: 0.95rem;
      font-weight: 500;
      color: #1a1a1a;
      line-height: 1.4;
      word-break: break-word;
    }
  `]
})
export class LoadingOverlayComponent {
  @Input() active = false;
  @Input() message?: string;
}
