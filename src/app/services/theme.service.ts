import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pdms-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Reactive signal holding the current theme */
  readonly theme = signal<Theme>(this.resolveInitialTheme());

  constructor() {
    // Apply theme to DOM whenever the signal changes
    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  /** Toggle between light and dark */
  toggle(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  /** Set a specific theme */
  set(theme: Theme): void {
    this.theme.set(theme);
  }

  /** Whether current theme is dark */
  get isDark(): boolean {
    return this.theme() === 'dark';
  }

  // ---- Private helpers ----

  private resolveInitialTheme(): Theme {
    if (!this.isBrowser) return 'light';

    // 1. Check localStorage for saved preference
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;

    // 2. Fall back to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }
}
