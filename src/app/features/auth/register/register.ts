import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

// Custom password validator
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isValidLength = value.length >= 6;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isValidLength;

    if (!passwordValid) {
      return { passwordStrength: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private message = inject(NzMessageService);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordValidator()]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.message.success('Cont creat cu succes');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.message.error(err?.error?.message ?? 'Registration failed');
          console.error('Registration failed', err);
        }
      });
    } else {
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}

