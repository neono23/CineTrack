import { Injectable, signal, computed } from '@angular/core';

export interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number; // 1-5
  status: 'Văzut' | 'De văzut' | 'În progres';
  review?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private _movies = signal<Movie[]>(this.loadMovies());
  
  public movies = computed(() => this._movies());

  constructor() {}

  private loadMovies(): Movie[] {
    const saved = localStorage.getItem('movies');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default initial data
    return [
      { id: '1', title: 'Inception', genre: 'Sci-Fi', year: 2010, rating: 5, status: 'Văzut' },
      { id: '2', title: 'The Matrix', genre: 'Sci-Fi', year: 1999, rating: 5, status: 'Văzut' },
      { id: '3', title: 'Interstellar', genre: 'Sci-Fi', year: 2014, rating: 4, status: 'De văzut' }
    ];
  }

  private saveMovies(movies: Movie[]) {
    localStorage.setItem('movies', JSON.stringify(movies));
  }

  addMovie(movie: Omit<Movie, 'id'>) {
    const newMovie: Movie = { ...movie, id: Date.now().toString() };
    this._movies.update(movies => {
      const updated = [...movies, newMovie];
      this.saveMovies(updated);
      return updated;
    });
  }

  updateMovie(updatedMovie: Movie) {
    this._movies.update(movies => {
      const updated = movies.map(m => m.id === updatedMovie.id ? updatedMovie : m);
      this.saveMovies(updated);
      return updated;
    });
  }

  deleteMovie(id: string) {
    this._movies.update(movies => {
      const updated = movies.filter(m => m.id !== id);
      this.saveMovies(updated);
      return updated;
    });
  }
}

