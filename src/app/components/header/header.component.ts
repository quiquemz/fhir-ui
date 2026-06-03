import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../services/theme.service';
import { ServerConfigService } from '../../services/server-config.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule],
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();

  readonly themeService = inject(ThemeService);
  readonly serverConfigService = inject(ServerConfigService);
}
