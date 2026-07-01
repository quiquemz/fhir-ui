import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { Observable, Subscription, of, switchMap, timer } from 'rxjs';
import { tap } from 'rxjs/operators';

export type ServerHealthStatus = 'testing' | 'success' | 'error';
export type AuthType = 'none' | 'basic' | 'client_credentials';

export interface ServerAuth {
  type: AuthType;
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scope: string;
}

export interface ServerConfig {
  id: string;
  name: string;
  url: string;
  auth: ServerAuth;
}

const SERVERS_KEY = 'fhir-server-configs';
const ACTIVE_KEY = 'fhir-active-server';

const POLL_INTERVAL_MS = 5_000;

const NO_AUTH: ServerAuth = { type: 'none', clientId: '', clientSecret: '', tokenUrl: '', scope: '' };

const DEFAULT_SERVER: ServerConfig = {
  id: 'default',
  name: 'HAPI (Local)',
  url: 'http://localhost:8080/hapi-fhir-jpaserver/fhir',
  auth: NO_AUTH,
};

const AZURE_SERVER: ServerConfig = {
  id: 'azure',
  name: 'Azure FHIR (Local)',
  url: 'http://localhost:8081',
  auth: NO_AUTH,
};

interface CachedToken {
  token: string;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class ServerConfigService implements OnDestroy {
  private readonly http = inject(HttpClient);

  readonly servers = signal<ServerConfig[]>(this.loadServers());
  readonly activeServerId = signal<string>(this.loadActiveId());
  readonly serverHealth = signal<Record<string, ServerHealthStatus>>({});

  readonly activeServer = computed(
    () => this.servers().find((s) => s.id === this.activeServerId()) ?? this.servers()[0],
  );

  readonly baseUrl = computed(() => this.activeServer()?.url ?? '/api');

  private readonly tokenCache = new Map<string, CachedToken>();
  private readonly pollSub: Subscription;
  private readonly slowTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    effect(() => {
      localStorage.setItem(SERVERS_KEY, JSON.stringify(this.servers()));
    });
    effect(() => {
      localStorage.setItem(ACTIVE_KEY, this.activeServerId());
    });
    this.pollSub = timer(0, POLL_INTERVAL_MS).subscribe(() => this.servers().forEach((s) => this.testServer(s)));
  }

  ngOnDestroy(): void {
    this.pollSub.unsubscribe();
    this.slowTimers.forEach((t) => clearTimeout(t));
    this.slowTimers.clear();
  }

  healthOf(id: string): ServerHealthStatus | null {
    return this.serverHealth()[id] ?? null;
  }

  fetchToken(server: ServerConfig): Observable<string> {
    const cached = this.tokenCache.get(server.id);
    if (cached && cached.expiresAt > Date.now() + 10_000) {
      return of(cached.token);
    }

    const body = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set('client_id', server.auth.clientId)
      .set('client_secret', server.auth.clientSecret)
      .set('scope', server.auth.scope);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http
      .post<{ access_token: string; expires_in: number }>(server.auth.tokenUrl, body.toString(), { headers })
      .pipe(
        tap((res) => {
          this.tokenCache.set(server.id, {
            token: res.access_token,
            expiresAt: Date.now() + (res.expires_in ?? 3600) * 1000,
          });
        }),
        switchMap((res) => of(res.access_token)),
      );
  }

  buildAuthHeaders(server: ServerConfig): Observable<HttpHeaders> {
    const base = new HttpHeaders({ 'Content-Type': 'application/fhir+json' });

    if (server.auth.type === 'basic') {
      const encoded = btoa(`${server.auth.clientId}:${server.auth.clientSecret}`);
      return of(base.set('Authorization', `Basic ${encoded}`));
    }

    if (server.auth.type === 'client_credentials') {
      return this.fetchToken(server).pipe(switchMap((token) => of(base.set('Authorization', `Bearer ${token}`))));
    }

    return of(base);
  }

  testServer(server: ServerConfig): void {
    const slowTimer = setTimeout(() => this.serverHealth.update((h) => ({ ...h, [server.id]: 'testing' })), 5_000);
    this.slowTimers.set(server.id, slowTimer);

    const url = server.url.replace(/\/$/, '') + '/metadata';

    this.buildAuthHeaders(server).pipe(
      switchMap((headers) => this.http.get(url, { headers, responseType: 'json' }))
    ).subscribe({
      next: () => {
        clearTimeout(this.slowTimers.get(server.id));
        this.slowTimers.delete(server.id);
        this.serverHealth.update((h) => ({ ...h, [server.id]: 'success' }));
      },
      error: () => {
        clearTimeout(this.slowTimers.get(server.id));
        this.slowTimers.delete(server.id);
        this.serverHealth.update((h) => ({ ...h, [server.id]: 'error' }));
      },
    });
  }

  addServer(name: string, url: string, auth: ServerAuth): void {
    const id = crypto.randomUUID();
    const server: ServerConfig = { id, name, url, auth };
    this.servers.update((list) => [...list, server]);
    this.testServer(server);
  }

  removeServer(id: string): void {
    clearTimeout(this.slowTimers.get(id));
    this.slowTimers.delete(id);
    this.tokenCache.delete(id);
    this.servers.update((list) => list.filter((s) => s.id !== id));
    this.serverHealth.update((h) => {
      const next = { ...h };
      delete next[id];
      return next;
    });
  }

  setActive(id: string): void {
    this.activeServerId.set(id);
  }

  updateServer(id: string, name: string, url: string): void {
    this.tokenCache.delete(id);
    this.servers.update((list) => list.map((s) => (s.id === id ? { ...s, name, url } : s)));
  }

  private loadServers(): ServerConfig[] {
    try {
      const raw = localStorage.getItem(SERVERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ServerConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s) => ({ ...s, auth: s.auth ?? NO_AUTH }));
        }
      }
    } catch {
      // ignore parse errors
    }
    return [DEFAULT_SERVER, AZURE_SERVER];
  }

  private loadActiveId(): string {
    return localStorage.getItem(ACTIVE_KEY) ?? DEFAULT_SERVER.id;
  }
}
