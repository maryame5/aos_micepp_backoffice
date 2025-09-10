import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import 'quill/dist/quill.snow.css'; // Importation des styles
import { PageHeaderComponent } from '../../../components/shared/page-header/page-header.component';
import { NewsService, DocumentPublicDTO } from '../../../services/news.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    QuillModule,
    PageHeaderComponent
  ],
  template: `
    <div class="article-editor-container">
      <app-page-header
        [title]="getTitle()"
        [subtitle]="getSubtitle()">
        <div slot="actions">
          <button mat-button (click)="cancel()">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
          <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="articleForm.invalid || isLoading">
            <mat-icon *ngIf="isLoading">hourglass_empty</mat-icon>
            <mat-icon *ngIf="!isLoading">save</mat-icon>
            {{ isEditing ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </app-page-header>

      <form [formGroup]="articleForm" (ngSubmit)="onSubmit()" class="article-form">
        <mat-card class="article-card">
          <mat-card-content>
            <div class="form-row">
              <mat-form-field class="title-field">
                <mat-label>Titre de l'article</mat-label>
                <input matInput formControlName="titre" placeholder="Entrez le titre de l'article" required>
                <mat-error *ngIf="articleForm.get('titre')?.invalid && articleForm.get('titre')?.touched">
                  Le titre est requis (minimum 3 caractères)
                </mat-error>
              </mat-form-field>

              <mat-form-field class="type-field">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type" required>
                  <mat-option value="article">Article</mat-option>
                  <mat-option value="news">Actualité</mat-option>
                  <mat-option value="announcement">Annonce</mat-option>
                </mat-select>
                <mat-error *ngIf="articleForm.get('type')?.invalid && articleForm.get('type')?.touched">
                  Le type est requis
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Utilisation correcte de Quill Editor -->
            <div class="quill-container">
              <label class="quill-label">Contenu de l'article *</label>
              <quill-editor
                formControlName="description"
                [modules]="quillConfig"
                [placeholder]="'Écrivez le contenu de votre article ici...'"
                [styles]="editorStyle"
                theme="snow"
                format="html">
              </quill-editor>
              <mat-error *ngIf="articleForm.get('description')?.invalid && articleForm.get('description')?.touched" class="quill-error">
                Le contenu est requis (minimum 10 caractères)
              </mat-error>
              <div class="quill-hint">Utilisez les en-têtes, listes et formatage pour structurer votre contenu</div>
            </div>

            <div class="file-upload-section">
              <label class="file-upload-label">
                <mat-icon>attach_file</mat-icon>
                <span>{{ selectedFile ? selectedFile.name : 'Joindre un fichier (optionnel)' }}</span>
                <input type="file" (change)="onFileSelected($event)" style="display: none;">
              </label>
              <p class="file-hint">Formats acceptés: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</p>
            </div>
          </mat-card-content>
        </mat-card>
      </form>
    </div>
  `,
  styles: [`
    .article-editor-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .article-form {
      margin-top: 2rem;
    }

    .article-card {
      padding: 0;
    }

    .form-row {
      display: block;
      margin-bottom: 2rem;
    }

    .title-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .type-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    /* Styles pour Quill Editor */
    .quill-container {
      width: 100%;
      margin-bottom: 2rem;
    }

    .quill-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 400;
      color: rgba(0,0,0,.6);
      margin-bottom: 0.5rem;
      line-height: 1.125;
    }

    .quill-error {
      font-size: 0.75rem;
      color: #f44336;
      margin-top: 0.25rem;
    }

    .quill-hint {
      font-size: 0.75rem;
      color: rgba(0,0,0,.6);
      margin-top: 0.25rem;
    }

    /* Personnalisation de l'éditeur Quill */
    ::ng-deep .ql-editor {
      min-height: 300px;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }

    ::ng-deep .ql-toolbar {
      border-top: 1px solid #ccc;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
    }

    ::ng-deep .ql-container {
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
    }

    ::ng-deep .ql-editor.ql-blank::before {
      color: rgba(0,0,0,.6);
      font-style: normal;
    }

    /* Focus styles */
    ::ng-deep .ql-container.ql-focused,
    ::ng-deep .ql-toolbar.ql-focused {
      border-color: #1976d2;
    }

    .file-upload-section {
      margin-top: 2rem;
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
  `]
})
export class ArticleEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private newsService = inject(NewsService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Configuration Quill simplifiée et fonctionnelle
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ]
  };

  // Styles pour l'éditeur
  editorStyle = {
    'min-height': '300px'
  };

  articleForm: FormGroup = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    type: ['article', Validators.required]
  });

  isEditing = false;
  isLoading = false;
  selectedFile: File | null = null;
  editingArticle: DocumentPublicDTO | null = null;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditing = true;
      this.loadArticle(id);
    }
  }

  getTitle(): string {
    return this.isEditing ? 'Modifier l\'article' : 'Nouvel article';
  }

  getSubtitle(): string {
    return this.isEditing ? 'Modifiez le contenu de l\'article' : 'Créez un nouvel article avec du contenu riche';
  }

  loadArticle(id: number) {
    this.newsService.getDocumentById(id).subscribe({
      next: (article) => {
        this.editingArticle = article;
        this.articleForm.patchValue({
          titre: article.titre,
          description: article.description,
          type: article.type
        });
      },
      error: (error) => {
        this.showSnackBar('Erreur lors du chargement de l\'article', 'error');
        console.error('Error loading article:', error);
        this.router.navigate(['/admin/news']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        this.showSnackBar('Le fichier ne doit pas dépasser 10MB', 'error');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        this.showSnackBar('Format de fichier non supporté', 'error');
        return;
      }
      
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.articleForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('titre', this.articleForm.value.titre);
      formData.append('description', this.articleForm.value.description);
      formData.append('type', this.articleForm.value.type);

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      const operation = this.isEditing
        ? this.newsService.updateDocument(this.editingArticle!.id, formData)
        : this.newsService.createDocument(formData);

      operation.subscribe({
        next: (result) => {
          this.isLoading = false;
          this.showSnackBar(
            this.isEditing ? 'Article modifié avec succès' : 'Article créé avec succès',
            'success'
          );
          this.router.navigate(['/admin/news']);
        },
        error: (error) => {
          this.isLoading = false;
          this.showSnackBar(
            this.isEditing ? 'Erreur lors de la modification' : 'Erreur lors de la création',
            'error'
          );
          console.error('Error saving article:', error);
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.articleForm.controls).forEach(key => {
        this.articleForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/news']);
  }

  private showSnackBar(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

}