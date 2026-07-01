import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthType, ServerAuth, ServerConfig, ServerConfigService } from '../../services/server-config.service';

const emptyAuth = (): ServerAuth => ({
  type: 'none',
  clientId: '',
  clientSecret: '',
  tokenUrl: '',
  scope: '',
});

@Component({
  selector: 'app-server-config',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './server-config.component.html',
  styleUrl: './server-config.component.scss',
})
export class ServerConfigComponent {
  readonly serverConfigService = inject(ServerConfigService);
  private readonly snackBar = inject(MatSnackBar);

  newName = '';
  newUrl = '';
  newAuth: ServerAuth = emptyAuth();
  showNewSecret = signal(false);

  readonly authTypeOptions: { value: AuthType; label: string }[] = [
    { value: 'none', label: 'No Auth' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'client_credentials', label: 'OAuth2 Client Credentials' },
  ];

  get servers(): ServerConfig[] {
    return this.serverConfigService.servers();
  }

  get activeServer(): ServerConfig {
    return this.serverConfigService.activeServer();
  }

  isActive(id: string): boolean {
    return this.serverConfigService.activeServerId() === id;
  }

  healthOf(id: string) {
    return this.serverConfigService.healthOf(id);
  }

  authLabel(auth: ServerAuth): string {
    if (auth.type === 'basic') return 'Basic';
    if (auth.type === 'client_credentials') return 'OAuth2';
    return 'No Auth';
  }

  setActive(id: string): void {
    this.serverConfigService.setActive(id);
    const name = this.servers.find((s) => s.id === id)?.name ?? '';
    this.snackBar.open(`Switched to "${name}"`, '', { duration: 2500 });
  }

  addServer(): void {
    const name = this.newName.trim();
    const url = this.newUrl.trim();
    if (!name || !url) return;
    this.serverConfigService.addServer(name, url, { ...this.newAuth });
    this.newName = '';
    this.newUrl = '';
    this.newAuth = emptyAuth();
    this.snackBar.open(`Server "${name}" added`, '', { duration: 2500 });
  }

  removeServer(id: string): void {
    const name = this.servers.find((s) => s.id === id)?.name ?? '';
    this.serverConfigService.removeServer(id);
    this.snackBar.open(`Server "${name}" removed`, '', { duration: 2500 });
  }

  canDelete(id: string): boolean {
    return this.servers.length > 1 && !this.isActive(id);
  }
}
