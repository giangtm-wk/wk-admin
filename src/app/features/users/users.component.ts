import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport, } from '@angular/cdk/scrolling';

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUserDto, User } from '@models/user.model';
import { ApiStatus } from '@shared/enums/api.enum';
import { UserRole } from '@shared/enums/user-role.enum';
import { UserStatus } from '@shared/enums/user-status.enum';
import { UsersService } from '@shared/http-access/users.service';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAutoFocus } from '@taiga-ui/cdk';
import {
  TuiAlertService,
  TuiButton,
  TuiDialogContext,
  TuiDialogService,
  TuiLoader,
  TuiScrollable,
  TuiScrollbar,
  TuiTextfield,
  TuiTextfieldOptionsDirective,
  TuiTitle
} from '@taiga-ui/core';
import { TuiChevron, TuiDataListWrapper, TuiSelect, TuiStatus } from '@taiga-ui/kit';
import { TuiInputModule, TuiMultiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    TuiScrollable,
    TuiScrollbar,
    TuiTable,
    TuiTitle,
    TuiButton,
    TuiStatus,
    ReactiveFormsModule,
    TuiInputModule,
    TuiAutoFocus,
    TuiTextfieldOptionsDirective,
    TuiMultiSelectModule,
    TuiTextfieldControllerModule,
    TuiTextfield,
    TuiChevron,
    TuiDataListWrapper,
    TuiSelect,
    TuiLoader
],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  protected readonly ApiStatus = ApiStatus;
  protected readonly columns = ['email', 'name', 'roles', 'status', 'action'];

  getUserListStatus = signal<ApiStatus>(ApiStatus.IDLE);
  userList = signal<User[]>([]);

  private dialogRef?: Subscription;
  createUserStatus = signal<ApiStatus>(ApiStatus.IDLE);
  updateUserStatus = signal<ApiStatus>(ApiStatus.IDLE);
  deleteUserStatus = signal<ApiStatus>(ApiStatus.IDLE);

  protected readonly RoleList = [UserRole.USER, UserRole.ADMIN, UserRole.MODERATOR];
  protected readonly StatusList = [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BANNED, UserStatus.DELETED, UserStatus.UNVERIFIED];

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required]],
    password: [''],
    roles: [[UserRole.USER], [Validators.required]],
    status: [UserStatus.ACTIVE, [Validators.required]],
  });
  get email() {
    return this.userForm.get('email') as FormControl;
  }
  get password() {
    return this.userForm.get('password') as FormControl;
  }
  get name() {
    return this.userForm.get('name') as FormControl;
  }
  get roles() {
    return this.userForm.get('roles') as FormControl;
  }
  get status() {
    return this.userForm.get('status') as FormControl;
  }

  selectedUser?: User;

  ngOnInit() {
    this.getUserList();
  }

  getUserList() {
    this.getUserListStatus.set(ApiStatus.LOADING);
    this.usersService.getUserList().subscribe({
      next: (data) => {
        this.userList.set(data);
        this.getUserListStatus.set(ApiStatus.SUCCESS);
      },
      error: () => {
        this.alerts.open('', {
          label: 'Không thể tải danh sách người dùng',
          appearance: 'warning',
          autoClose: 3000,
        }).subscribe();
        this.getUserListStatus.set(ApiStatus.ERROR);
      }
    });
  }

  openCreateUserDialog(content: PolymorpheusContent<TuiDialogContext>) {
    this.password?.addValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.reset({
      email: '',
      name: '',
      password: '',
      roles: [UserRole.USER],
      status: UserStatus.ACTIVE,
    });
    this.dialogRef = this.dialogs.open(content, {
      size: 'fullscreen'
    }).subscribe();
  }

  createUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.createUserStatus.set(ApiStatus.LOADING);
    this.usersService.createUser(this.userForm.value as CreateUserDto).subscribe({
      next: () => {
        this.createUserStatus.set(ApiStatus.SUCCESS);
        if (this.dialogRef) {
          this.dialogRef.unsubscribe();
        }
        this.getUserList();
      },
      error: () => {
        this.alerts.open('', {
          label: 'Không thể tạo người dùng mới',
          appearance: 'warning',
          autoClose: 3000,
        }).subscribe();
        this.createUserStatus.set(ApiStatus.ERROR);
      }
    });
  }

  openUpdateUserDialog(content: PolymorpheusContent<TuiDialogContext>, user: User) {
    this.selectedUser = user;
    this.password?.clearValidators();
    this.userForm.reset({
      email: user.email,
      name: user.name,
      roles: user.roles,
      status: user.status,
    });
    this.dialogRef = this.dialogs.open(content, {
      size: 'fullscreen'
    }).subscribe();
  }

  updateUser() {
    if (this.userForm.invalid || !this.selectedUser) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.updateUserStatus.set(ApiStatus.LOADING);
    this.usersService.updateUser(this.selectedUser.id, this.userForm.value as CreateUserDto).subscribe({
      next: () => {
        this.updateUserStatus.set(ApiStatus.SUCCESS);
        this.dialogRef?.unsubscribe();
        this.getUserList();
      },
      error: () => {
        this.alerts.open('', {
          label: 'Không thể cập nhật thông tin người dùng',
          appearance: 'warning',
          autoClose: 3000,
        }).subscribe();
        this.updateUserStatus.set(ApiStatus.ERROR);
      }
    });
  }

  openDeleteUserDialog(content: PolymorpheusContent<TuiDialogContext>, user: User) {
    this.selectedUser = user;
    this.dialogRef = this.dialogs.open(content, {
      size: 'fullscreen'
    }).subscribe();
  }

  deleteUser() {
    if (!this.selectedUser) {
      return;
    }
    this.deleteUserStatus.set(ApiStatus.LOADING);
    return this.usersService
      .updateUser(this.selectedUser.id, { status: UserStatus.DELETED })
      .pipe()
      .subscribe({
        next: () => {
          this.deleteUserStatus.set(ApiStatus.SUCCESS);
          this.dialogRef?.unsubscribe();
          this.getUserList();
        },
        error: () => {
          this.alerts.open('', {
            label: 'Không thể xóa người dùng',
            appearance: 'warning',
            autoClose: 3000,
          }).subscribe();
          this.deleteUserStatus.set(ApiStatus.ERROR);
        }
      });
  }
}
