import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@shared/http-access/auth.service';
import { ApiStatus } from '@shared/enums/api.enum';
import { TuiAlertService, TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-login',
  imports: [
    TuiButton,
    TuiInputModule,
    TuiTextfield,
    ReactiveFormsModule,
    NgIf,
    TuiTextfieldControllerModule,
    TuiButtonLoading
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  readonly HttpStatus = ApiStatus;
  private authService = inject(AuthService);
  private readonly alerts = inject(TuiAlertService);
  private readonly router = inject(Router);

  readonly form: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }> = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  loginApiStatus = ApiStatus.IDLE;

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  onLogin() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loginApiStatus = ApiStatus.LOADING;
    const { email, password } = this.form.value;
    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.loginApiStatus = ApiStatus.SUCCESS;
        void this.router.navigate([this.authService.redirectUrl]);
      },
      error: () => {
        this.loginApiStatus = ApiStatus.ERROR;
        this.alerts.open('', {
          label: 'Đăng nhập không thành công',
          appearance: 'warning',
          autoClose: 3000,
        }).subscribe();
      }
    })
  }
}
