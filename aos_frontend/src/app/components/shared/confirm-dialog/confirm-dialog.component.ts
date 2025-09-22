import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header">
        <mat-icon [class.destructive]="data.isDestructive">
          {{ data.isDestructive ? 'warning' : 'help_outline' }}
        </mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content>
        <p [innerHTML]="data.message"></p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button 
          mat-button 
          (click)="onCancel()"
          [attr.data-test]="'cancel-button'">
          {{ data.cancelText || 'Annuler' }}
        </button>
        
        <button 
          mat-raised-button 
          [color]="data.isDestructive ? 'warn' : 'primary'"
          (click)="onConfirm()"
          [attr.data-test]="'confirm-button'">
          {{ data.confirmText || 'Confirmer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 320px;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .dialog-header mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #3b82f6;
    }

    .dialog-header mat-icon.destructive {
      color: #ef4444;
    }

    .dialog-header h2 {
      margin: 0;
      color: #374151;
      font-size: 1.25rem;
      font-weight: 600;
    }

    mat-dialog-content {
      margin: 0;
      padding: 0;
    }

    mat-dialog-content p {
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
    }

    mat-dialog-actions {
      margin: 0;
      padding: 1.5rem 0 0 0;
    }

    mat-dialog-actions button {
      margin-left: 0.75rem;
      min-width: 100px;
    }

    ::ng-deep .mat-mdc-dialog-container {
      border-radius: 12px !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}