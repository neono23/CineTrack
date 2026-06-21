import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MovieService, Movie } from '../../../core/services/movie';
import { Auth } from '../../../core/services/auth';
import * as _ from 'lodash';

// NG-Zorro Imports
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzRateModule,
    NzTagModule,
    NzPopconfirmModule,
    NzLayoutModule,
    NzMenuModule,
    NzInputNumberModule
  ],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.css',
})
export class MovieList {
  private movieService = inject(MovieService);
  public authService = inject(Auth);
  private fb = inject(FormBuilder);

  // Search logic utilizing signals
  searchTerm = signal('');
  
  // Computed property to filter and optionally sort movies using Lodash
  filteredMovies = computed(() => {
    let movies = this.movieService.movies();
    const term = this.searchTerm().toLowerCase();
    
    if (term) {
      movies = movies.filter(m => 
        m.title.toLowerCase().includes(term) ||
        m.genre.toLowerCase().includes(term)
      );
    }
    
    return movies;
    // We could use lodash here for sorting if we were storing sort state in signals
    // as well. E.g., return _.orderBy(movies, [sortColumn], [sortOrder]);
  });

  // Modal logic
  isModalVisible = false;
  isReviewModalVisible = false;
  editingMovie: Movie | null = null;
  selectedMovieForReview: Movie | null = null;

  movieForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    genre: ['', [Validators.required]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1888), Validators.max(2025)]],
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    status: ['De văzut', [Validators.required]]
  });

  reviewForm: FormGroup = this.fb.group({
    review: ['', [Validators.maxLength(500)]]
  });

  statusOptions = ['Văzut', 'De văzut', 'În progres'];
  genreOptions = ['Acțiune', 'Comedie', 'Horror', 'Dramă', 'Sci-Fi', 'Thriller', 'Animație'];

  // Map status to tag color
  getStatusColor(status: string): string {
    switch(status) {
      case 'Văzut': return 'green';
      case 'În progres': return 'orange';
      case 'De văzut': return 'blue';
      default: return 'default';
    }
  }

  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
  }

  showAddModal() {
    this.editingMovie = null;
    this.movieForm.reset({
      year: new Date().getFullYear(),
      rating: 0,
      status: 'De văzut'
    });
    this.isModalVisible = true;
  }

  showEditModal(movie: Movie) {
    this.editingMovie = movie;
    this.movieForm.patchValue({
      title: movie.title,
      genre: movie.genre,
      year: movie.year,
      rating: movie.rating,
      status: movie.status
    });
    this.isModalVisible = true;
  }

  handleModalCancel() {
    this.isModalVisible = false;
  }

  handleModalOk() {
    if (this.movieForm.valid) {
      if (this.editingMovie) {
        this.movieService.updateMovie({
          ...this.editingMovie,
          ...this.movieForm.value
        });
      } else {
        this.movieService.addMovie(this.movieForm.value);
      }
      this.isModalVisible = false;
    } else {
      Object.values(this.movieForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  deleteMovie(id: string) {
    this.movieService.deleteMovie(id);
  }

  // Sorting
  // We use lodash _.orderBy for the sorting behavior of NgZorro
  sortMovies(sort: { key: string; value: string | null }): void {
    if (sort.key && sort.value) {
      // In a real app we'd update a sortSignal, but for NgZorro table
      // it might modify the list. To be safe, we'll sort the output
      // of the movieService using lodging
      // For NgZorro, since it's client side, we usually provide the sort fn in the template
    }
  }

  // Review functionality
  showReviewModal(movie: Movie) {
    this.selectedMovieForReview = movie;
    this.reviewForm.patchValue({
      review: movie.review || ''
    });
    this.isReviewModalVisible = true;
  }

  handleReviewModalCancel() {
    this.isReviewModalVisible = false;
  }

  handleReviewModalOk() {
    if (this.reviewForm.valid && this.selectedMovieForReview) {
      this.movieService.updateMovie({
        ...this.selectedMovieForReview,
        review: this.reviewForm.value.review
      });
      this.isReviewModalVisible = false;
      this.selectedMovieForReview = null;
    }
  }

  logout() {
    this.authService.logout();
  }
}

