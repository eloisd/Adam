import {Component, effect, inject, signal} from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {Router, RouterLink} from '@angular/router';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {passwordMatchValidator} from './validators/password-match.validator';
import {NgIf} from '@angular/common';
import {AuthStore} from '../../core/stores/auth.store';
import {toObservable} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sign-up',
  imports: [
    MatButton,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
    MatError,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './sign-up.component.html',
  standalone: true,
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  readonly authStore = inject(AuthStore);

  hide = signal(true);
  hideConfirm = signal(true);

  form = new FormGroup({
    lastname: new FormControl('', Validators.required),
    firstname: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required)
  },{
    validators: passwordMatchValidator('password', 'confirmPassword')
  })

  constructor(private router: Router) {  }

  clickEvent(event: MouseEvent): void {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  clickEventConfirm(event: MouseEvent): void {
    this.hideConfirm.set(!this.hideConfirm());
    event.stopPropagation();
  }

  signUp() {
    const formValue = this.form.getRawValue();
    if (!formValue.lastname || !formValue.firstname || !formValue.email || !formValue.password) return;
    this.authStore.register({
        lastname: formValue.lastname,
        firstname: formValue.firstname,
        email: formValue.email,
        password: formValue.password
    }).subscribe({
      next: () => {
        this.router.navigate(['signin']);
      }
    })
  }

}
