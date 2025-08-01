import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '@config/app.config';
import { CreateUserDto, UpdateUserDto, User } from '@models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersHttpService {
  private readonly appConfig = inject(APP_CONFIG);
  private readonly http = inject(HttpClient);

  getUserList() {
    return this.http.get<User[]>(`${this.appConfig.apiUrl}/users`);
  }

  createUser(user: CreateUserDto) {
    return this.http.post<User>(`${this.appConfig.apiUrl}/users`, user);
  }

  updateUser(id: string, user: UpdateUserDto) {
    return this.http.put<User>(`${this.appConfig.apiUrl}/users/${id}`, user);
  }
}
