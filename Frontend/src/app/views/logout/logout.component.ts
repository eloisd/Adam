import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AuthStore} from '../../core/stores/auth.store';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {
  readonly authStore = inject(AuthStore);

  constructor(private router: Router) {
    this.authStore.logout().subscribe({
      next: () => {
        this.router.navigate(['signin']);
      }
    })
  }
}
