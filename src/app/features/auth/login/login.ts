import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule, 
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzCardModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private message = inject(NzMessageService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  isLoading = false;

  submitForm(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(
        { email: this.loginForm.value.email, password: this.loginForm.value.password },
        this.loginForm.value.rememberMe
      ).subscribe({
        next: () => {
          this.isLoading = false;
          this.message.success('Login reușit');
          this.router.navigate(['/movies']);
        },
        error: (err) => {
          this.isLoading = false;
          this.message.error(err?.error?.message ?? 'Login failed');
          console.error('Login failed', err);
        }
      });
    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}

