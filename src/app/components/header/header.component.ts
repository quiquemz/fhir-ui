import { Component } from '@angular/core';
import { CxHeaderModule } from '@quiquemz/cortex/header';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { CxLogoModule } from '@quiquemz/cortex/logo';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CxHeaderModule, CxLogoModule, MatButton, MatButtonModule, MatIconModule, RouterLink],
})
export class HeaderComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
