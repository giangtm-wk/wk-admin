import { UserRole } from '@shared/enums/user-role.enum';
import { UserStatus } from '@shared/enums/user-status.enum';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export interface UpdateUserDto extends Partial<CreateUserDto> {}
