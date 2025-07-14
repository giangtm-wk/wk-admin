import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@shared/http-access/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();
  if (!token) {
    return next(req);
  }

  const authReq = addToken(req, token);
  return next(authReq);
};

const addToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
