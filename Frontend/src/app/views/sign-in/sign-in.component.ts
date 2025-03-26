import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {Router, RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';
import {AuthStore} from '../../core/stores/auth.store';
import {toObservable} from '@angular/core/rxjs-interop';
import {tap} from 'rxjs';


@Component({
  selector: 'app-sign-in',
  imports: [
    MatButton,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    RouterLink,
    MatError,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './sign-in.component.html',
  standalone: true,
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  hide = signal(true);
  form = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  })
  readonly authStore = inject(AuthStore);

  constructor(private router: Router) {
    this.authStore.isSuccess$.subscribe({
      next: value => {
        if (value) {
          const redirectTo = localStorage.getItem('redirectTo') || '';
          localStorage.removeItem('redirectTo');
          this.router.navigate([redirectTo]);
        }
      },
    });
    this.authStore.error$.subscribe({
      next: value => {
        this.form.get('password')?.setErrors({wrongCredentials: true});
      }
    });
  }

  clickEvent(event: MouseEvent): void {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  signIn() {
    const formValue = this.form.getRawValue();
    if (!formValue.email || !formValue.password) return;
    this.authStore.login({ email: formValue.email, password: formValue.password });
  }

}
