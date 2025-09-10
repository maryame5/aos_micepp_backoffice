import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { QuillModule } from 'ngx-quill';
import 'quill/dist/quill.snow.css'; // Importation des styles Quill
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { NewsService, DocumentPublicDTO } from '../../../services/news.service';
import { Inject } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    QuillModule,
    PageHeaderComponent
  ],
  template: `
    <div class="news-container">
      <app-page-header
        title="Gestion des Actualités"
        subtitle="Créez et gérez les actualités de la plateforme">
        <div slot="actions">
          <button mat-raised-button color="primary" (click)="navigateToCreate()">
            <mat-icon>add</mat-icon>
            Nouvelle actualité
          </button>
        </div>
      </app-page-header>

      <!-- Documents List -->
      <mat-card class="documents-card">
        <mat-card-header>
          <mat-card-title>Actualités Publiées</mat-card-title>
          <mat-card-subtitle>Gestion des documents et actualités publiques</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="table-container" *ngIf="dataSource.data.length > 0; else noData">
            <table mat-table [dataSource]="dataSource" #sort="matSort" matSort class="documents-table">

              <!-- Title Column -->
              <ng-container matColumnDef="titre">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Titre</th>
                <td mat-cell *matCellDef="let document">{{ document.titre }}</td>
              </ng-container>

              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let document">
                  <mat-chip [color]="getTypeColor(document.type)" selected>
                    {{ getTypeLabel(document.type) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Published By Column -->
              <ng-container matColumnDef="publishedByName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Publié par</th>
                <td mat-cell *matCellDef="let document">{{ document.publishedByName }}</td>
              </ng-container>

              <!-- Created Date Column -->
              <ng-container matColumnDef="createdDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date de création</th>
                <td mat-cell *matCellDef="let document">{{ formatDate(document.createdDate) }}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let document">
                  <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewDocument(document)">
                      <mat-icon>visibility</mat-icon>
                      <span>Voir</span>
                    </button>
                    <button mat-menu-item (click)="editDocument(document)">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier</span>
                    </button>
                    <button mat-menu-item (click)="downloadDocument(document)">
                      <mat-icon>download</mat-icon>
                      <span>Télécharger</span>
                    </button>
                    <button mat-menu-item (click)="deleteDocument(document)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>Supprimer</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator
              #paginator
              [pageSizeOptions]="[5, 10, 20, 50]"
              [pageSize]="10"
              [length]="dataSource.data.length"
              showFirstLastButtons
              aria-label="Select page">
            </mat-paginator>
          </div>

          <ng-template #noData>
            <div class="no-data">
              <mat-icon class="no-data-icon">article</mat-icon>
              <h3>Aucune actualité trouvée</h3>
              <p>Commencez par créer votre première actualité en cliquant sur "Nouvelle actualité"</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Create/Edit Dialog -->
    <div class="dialog-container" *ngIf="showDialog">
      <div class="dialog-overlay" (click)="closeDialog()"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h2>{{ isEditing ? 'Modifier l\'actualité' : 'Nouvelle actualité' }}</h2>
          <button mat-icon-button (click)="closeDialog()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <form [formGroup]="documentForm" (ngSubmit)="onSubmit()" class="dialog-body">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Titre</mat-label>
            <input matInput formControlName="titre" placeholder="Entrez le titre de l'actualité" required>
            <mat-error *ngIf="documentForm.get('titre')?.invalid && documentForm.get('titre')?.touched">
              Le titre est requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <quill-editor
              formControlName="description"
              placeholder="Entrez la description de l'actualité"
              [modules]="quillConfig"
              [styles]="{'min-height': '200px'}">
            </quill-editor>
            <mat-error *ngIf="documentForm.get('description')?.invalid && documentForm.get('description')?.touched">
              La description est requise
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="news">Actualité</mat-option>
              <mat-option value="article">Article</mat-option>
              <mat-option value="document">Document</mat-option>
              <mat-option value="announcement">Annonce</mat-option>
            </mat-select>
            <mat-error *ngIf="documentForm.get('type')?.invalid && documentForm.get('type')?.touched">
              Le type est requis
            </mat-error>
          </mat-form-field>

          <div class="file-upload-section">
            <label class="file-upload-label">
              <mat-icon>attach_file</mat-icon>
              <span>{{ selectedFile ? selectedFile.name : 'Sélectionner un fichier (optionnel)' }}</span>
              <input type="file" (change)="onFileSelected($event)" style="display: none;">
            </label>
            <p class="file-hint">Formats acceptés: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</p>
          </div>

          <div class="dialog-actions">
            <button mat-button type="button" (click)="closeDialog()">Annuler</button>
            <button mat-raised-button color="primary" type="submit"
                    [disabled]="documentForm.invalid || isLoading">
              <mat-icon *ngIf="isLoading">hourglass_empty</mat-icon>
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .news-container {
      padding: 1rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .documents-card {
      margin-top: 1rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .documents-table {
      width: 100%;
      margin-bottom: 1rem;
    }

    .no-data {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }

    .no-data-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .delete-action {
      color: #f44336;
    }

    .dialog-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }

    .dialog-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      z-index: 1001;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .dialog-body {
      padding: 1.5rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .file-upload-section {
      margin-bottom: 1.5rem;
    }

    .file-upload-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border: 2px dashed #ccc;
      border-radius: 4px;
      cursor: pointer;
      transition: border-color 0.3s;
    }

    .file-upload-label:hover {
      border-color: #1976d2;
    }

    .file-hint {
      margin: 0.5rem 0 0 0;
      font-size: 0.875rem;
      color: #666;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `]
})
export class AdminNewsComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private newsService = inject(NewsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean'],                                         // remove formatting button
      ['link', 'image', 'video']                         // link and image, video
    ]
  };

  dataSource = new MatTableDataSource<DocumentPublicDTO>();
  displayedColumns: string[] = ['titre', 'type', 'publishedByName', 'createdDate', 'actions'];
  showDialog = false;
  isEditing = false;
  isLoading = false;
  selectedFile: File | null = null;
  editingDocument: DocumentPublicDTO | null = null;

  documentForm: FormGroup = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    type: ['news', Validators.required]
  });

  ngOnInit() {
    this.loadDocuments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDocuments() {
    this.newsService.getAllDocuments().subscribe({
      next: (docs) => {
        this.dataSource.data = docs;
        // Ensure paginator is properly connected after data is loaded
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
      },
      error: (error) => {
        this.showSnackBar('Erreur lors du chargement des documents', 'error');
        console.error('Error loading documents:', error);
      }
    });
  }

  openCreateDialog() {
    this.isEditing = false;
    this.selectedFile = null;
    this.editingDocument = null;
    this.documentForm.reset({
      titre: '',
      description: '',
      type: 'news'
    });
    this.showDialog = true;
  }

  navigateToCreate() {
    this.router.navigate(['/admin/news/create']);
  }

  editDocument(document: DocumentPublicDTO) {
    this.router.navigate(['/admin/news/edit', document.id]);
  }

  closeDialog() {
    this.showDialog = false;
    this.documentForm.reset();
    this.selectedFile = null;
    this.editingDocument = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        this.showSnackBar('Le fichier ne doit pas dépasser 10MB', 'error');
        return;
      }
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.documentForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('titre', this.documentForm.value.titre);
      formData.append('description', this.documentForm.value.description);
      formData.append('type', this.documentForm.value.type);

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      const operation = this.isEditing
        ? this.newsService.updateDocument(this.editingDocument!.id, formData)
        : this.newsService.createDocument(formData);

      operation.subscribe({
        next: (result) => {
          this.isLoading = false;
          this.closeDialog();
          this.loadDocuments();
          this.showSnackBar(
            this.isEditing ? 'Document modifié avec succès' : 'Document créé avec succès',
            'success'
          );
        },
        error: (error) => {
          this.isLoading = false;
          this.showSnackBar(
            this.isEditing ? 'Erreur lors de la modification' : 'Erreur lors de la création',
            'error'
          );
          console.error('Error saving document:', error);
        }
      });
    }
  }

  deleteDocument(document: DocumentPublicDTO) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${document.titre}" ?`)) {
      this.newsService.deleteDocument(document.id).subscribe({
        next: () => {
          this.loadDocuments();
          this.showSnackBar('Document supprimé avec succès', 'success');
        },
        error: (error) => {
          this.showSnackBar('Erreur lors de la suppression', 'error');
          console.error('Error deleting document:', error);
        }
      });
    }
  }

  downloadDocument(doc: DocumentPublicDTO) {
    this.newsService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.showSnackBar('Erreur lors du téléchargement', 'error');
        console.error('Error downloading document:', error);
      }
    });
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'news': return 'primary';
      case 'article': return 'accent';
      case 'document': return 'warn';
      case 'announcement': return '';
      default: return '';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'news': return 'Actualité';
      case 'article': return 'Article';
      case 'document': return 'Document';
      case 'announcement': return 'Annonce';
      default: return type;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }



  viewDocument(document: DocumentPublicDTO) {
    // Create a simple dialog to view the document content
    const dialogRef = this.dialog.open(ViewDocumentDialogComponent, {
      width: '800px',
      maxHeight: '80vh',
      data: document
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}

// Component for viewing document details
@Component({
  selector: 'app-view-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="view-dialog">
      <div class="dialog-header">
        <h2>{{ data.titre }}</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <div class="document-info">
          <p><strong>Type:</strong> {{ getTypeLabel(data.type) }}</p>
          <p><strong>Publié par:</strong> {{ data.publishedByName }}</p>
          <p><strong>Date de création:</strong> {{ formatDate(data.createdDate) }}</p>
        </div>

        <div class="document-description ql-container ql-snow">
          <h3>Description</h3>
          <div class="description-content ql-editor" [innerHTML]="getSafeHtml(data.description)"></div>
        </div>

        <div class="dialog-actions">
          <button mat-button (click)="close()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .view-dialog {
      padding: 0;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      background: #f5f5f5;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .dialog-content {
      padding: 1.5rem;
    }

    .document-info {
      margin-bottom: 1.5rem;
    }

    .document-info p {
      margin: 0.5rem 0;
      color: #666;
    }

    .document-description h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    .description-content {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 1rem;
      min-height: 200px;
      background: #fafafa;
      overflow-y: auto;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
    }

    /* Apply Quill editor styles to the content */
    .description-content.ql-editor {
      border: none;
      background: white;
      padding: 1rem;
    }

    .description-content.ql-editor * {
      margin: 0;
      padding: 0;
    }

    .description-content.ql-editor h1,
    .description-content.ql-editor h2,
    .description-content.ql-editor h3 {
      margin: 1rem 0 0.5rem 0;
      font-weight: 500;
    }

    .description-content.ql-editor h1 { font-size: 2rem; }
    .description-content.ql-editor h2 { font-size: 1.5rem; }
    .description-content.ql-editor h3 { font-size: 1.25rem; }

    .description-content.ql-editor p {
      margin: 0.5rem 0;
    }

    .description-content.ql-editor ul,
    .description-content.ql-editor ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }

    .description-content.ql-editor li {
      margin: 0.25rem 0;
    }

    .description-content.ql-editor blockquote {
      border-left: 4px solid #ccc;
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
      color: #666;
    }

    .description-content.ql-editor code {
      background: #f5f5f5;
      padding: 0.125rem 0.25rem;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .description-content.ql-editor pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      margin: 1rem 0;
    }

    .description-content.ql-editor strong,
    .description-content.ql-editor b {
      font-weight: bold;
    }

    .description-content.ql-editor em,
    .description-content.ql-editor i {
      font-style: italic;
    }

    .description-content.ql-editor u {
      text-decoration: underline;
    }

    .description-content.ql-editor s,
    .description-content.ql-editor strike {
      text-decoration: line-through;
    }

    /* Font sizes */
    .description-content.ql-editor .ql-size-small {
      font-size: 0.75em;
    }

    .description-content.ql-editor .ql-size-large {
      font-size: 1.5em;
    }

    .description-content.ql-editor .ql-size-huge {
      font-size: 2.5em;
    }

    /* Font families - common Quill fonts */
    .description-content.ql-editor .ql-font-serif {
      font-family: Georgia, 'Times New Roman', serif;
    }

    .description-content.ql-editor .ql-font-monospace {
      font-family: 'Courier New', monospace;
    }

    /* Text alignment */
    .description-content.ql-editor .ql-align-center {
      text-align: center;
    }

    .description-content.ql-editor .ql-align-right {
      text-align: right;
    }

    .description-content.ql-editor .ql-align-justify {
      text-align: justify;
    }

    /* Indentation */
    .description-content.ql-editor .ql-indent-1 {
      padding-left: 3em;
    }

    .description-content.ql-editor .ql-indent-2 {
      padding-left: 6em;
    }

    .description-content.ql-editor .ql-indent-3 {
      padding-left: 9em;
    }

    .description-content.ql-editor .ql-indent-4 {
      padding-left: 12em;
    }

    .description-content.ql-editor .ql-indent-5 {
      padding-left: 15em;
    }

    .description-content.ql-editor .ql-indent-6 {
      padding-left: 18em;
    }

    .description-content.ql-editor .ql-indent-7 {
      padding-left: 21em;
    }

    .description-content.ql-editor .ql-indent-8 {
      padding-left: 24em;
    }

    /* Text colors - common Quill colors */
    .description-content.ql-editor .ql-color-red { color: #e60000; }
    .description-content.ql-editor .ql-color-orange { color: #ff9900; }
    .description-content.ql-editor .ql-color-yellow { color: #ffff00; }
    .description-content.ql-editor .ql-color-green { color: #008a00; }
    .description-content.ql-editor .ql-color-blue { color: #0066cc; }
    .description-content.ql-editor .ql-color-purple { color: #9933ff; }
    .description-content.ql-editor .ql-color-black { color: #000000; }
    .description-content.ql-editor .ql-color-white { color: #ffffff; }
    .description-content.ql-editor .ql-color-gray { color: #999999; }

    /* Background colors - common Quill background colors */
    .description-content.ql-editor .ql-background-red { background-color: #e60000; }
    .description-content.ql-editor .ql-background-orange { background-color: #ff9900; }
    .description-content.ql-editor .ql-background-yellow { background-color: #ffff00; }
    .description-content.ql-editor .ql-background-green { background-color: #008a00; }
    .description-content.ql-editor .ql-background-blue { background-color: #0066cc; }
    .description-content.ql-editor .ql-background-purple { background-color: #9933ff; }
    .description-content.ql-editor .ql-background-black { background-color: #000000; }
    .description-content.ql-editor .ql-background-white { background-color: #ffffff; }
    .description-content.ql-editor .ql-background-gray { background-color: #999999; }

    /* Additional color variations that Quill might use */
    .description-content.ql-editor .ql-color-pink { color: #ff0080; }
    .description-content.ql-editor .ql-color-brown { color: #a52a2a; }
    .description-content.ql-editor .ql-color-cyan { color: #00ffff; }
    .description-content.ql-editor .ql-color-magenta { color: #ff00ff; }
    .description-content.ql-editor .ql-color-lime { color: #00ff00; }
    .description-content.ql-editor .ql-color-teal { color: #008080; }
    .description-content.ql-editor .ql-color-navy { color: #000080; }
    .description-content.ql-editor .ql-color-maroon { color: #800000; }
    .description-content.ql-editor .ql-color-olive { color: #808000; }
    .description-content.ql-editor .ql-color-silver { color: #c0c0c0; }

    .description-content.ql-editor .ql-background-pink { background-color: #ff0080; }
    .description-content.ql-editor .ql-background-brown { background-color: #a52a2a; }
    .description-content.ql-editor .ql-background-cyan { background-color: #00ffff; }
    .description-content.ql-editor .ql-background-magenta { background-color: #ff00ff; }
    .description-content.ql-editor .ql-background-lime { background-color: #00ff00; }
    .description-content.ql-editor .ql-background-teal { background-color: #008080; }
    .description-content.ql-editor .ql-background-navy { background-color: #000080; }
    .description-content.ql-editor .ql-background-maroon { background-color: #800000; }
    .description-content.ql-editor .ql-background-olive { background-color: #808000; }
    .description-content.ql-editor .ql-background-silver { background-color: #c0c0c0; }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
  `]
})
export class ViewDocumentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DocumentPublicDTO,
     private sanitizer: DomSanitizer
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'news': return 'Actualité';
      case 'article': return 'Article';
      case 'document': return 'Document';
      case 'announcement': return 'Annonce';
      default: return type;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSafeHtml(html: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(html);
}
}
