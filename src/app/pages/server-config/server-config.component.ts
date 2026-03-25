import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { ServerConfig, ServerConfigService } from '../../services/server-config.service';

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
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './server-config.component.html',
  styleUrl: './server-config.component.scss',
})
export class ServerConfigComponent {
  readonly serverConfigService = inject(ServerConfigService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly http = inject(HttpClient);

  newName = '';
  newUrl = '';
  testingId = signal<string | null>(null);

  get servers(): ServerConfig[] {
    return this.serverConfigService.servers();
  }

  get activeServer(): ServerConfig {
    return this.serverConfigService.activeServer();
  }

  isActive(id: string): boolean {
    return this.serverConfigService.activeServerId() === id;
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
    this.serverConfigService.addServer(name, url);
    this.newName = '';
    this.newUrl = '';
    this.snackBar.open(`Server "${name}" added`, '', { duration: 2500 });
  }

  removeServer(id: string): void {
    const name = this.servers.find((s) => s.id === id)?.name ?? '';
    this.serverConfigService.removeServer(id);
    this.snackBar.open(`Server "${name}" removed`, '', { duration: 2500 });
  }

  testConnection(server: ServerConfig): void {
    this.testingId.set(server.id);
    const metadataUrl = server.url.replace(/\/$/, '') + '/metadata';
    this.http.get(metadataUrl, { responseType: 'json' }).subscribe({
      next: () => {
        this.testingId.set(null);
        this.snackBar.open(`Connected to "${server.name}" successfully`, '', { duration: 3000 });
      },
      error: () => {
        this.testingId.set(null);
        this.snackBar.open(`Could not connect to "${server.name}"`, 'Dismiss', { duration: 4000 });
      },
    });
  }

  canDelete(id: string): boolean {
    return this.servers.length > 1 && !this.isActive(id);
  }
}
