import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@shared/http-access/auth.service';
import { catchError, map, of } from 'rxjs';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.refreshToken().pipe(
    map(() => {
      return router.parseUrl('/dashboard');
    }),
    catchError(() => {
      return of(true);
    })
  );
};
