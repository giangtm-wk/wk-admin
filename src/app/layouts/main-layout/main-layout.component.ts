import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ApiStatus } from '@shared/enums/api.enum';
import { AuthService } from '@shared/http-access/auth.service';
import { TuiThemeColorService } from '@taiga-ui/cdk';
import { TuiAlertService, TuiButton, TuiRoot } from '@taiga-ui/core';
import { TuiAvatar, TuiButtonLoading, TuiFade } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    TuiRoot,
    TuiAvatar,
    TuiFade,
    TuiNavigation,
    TuiButton,
    TuiButtonLoading,
    RouterLink
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent implements OnInit {
  protected expanded = signal(false);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alerts = inject(TuiAlertService);
  private readonly theme = inject(TuiThemeColorService);

  readonly HttpStatus = ApiStatus;
  logoutStatus = ApiStatus.IDLE;

  ngOnInit(): void {
    this.theme.color = 'var(--color-gray-800)';
  }

  logout() {
    this.logoutStatus = ApiStatus.LOADING;
    this.authService.logout().subscribe({
      next: () => {
        this.logoutStatus = ApiStatus.SUCCESS;
        void this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.logoutStatus = ApiStatus.ERROR;
        this.alerts.open('', {
          label: 'Đăng xuất không thành công',
          appearance: 'warning',
          autoClose: 3000,
        }).subscribe()
      }
    });
  }

  handleToggle(): void {
    this.expanded.update((e) => !e);
  }
}
