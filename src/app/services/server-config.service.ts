import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { Subscription, timer } from 'rxjs';

export type ServerHealthStatus = 'testing' | 'success' | 'error';

export interface ServerConfig {
  id: string;
  name: string;
  url: string;
}

const SERVERS_KEY = 'fhir-server-configs';
const ACTIVE_KEY = 'fhir-active-server';

const POLL_INTERVAL_MS = 5_000;

const DEFAULT_SERVER: ServerConfig = {
  id: 'default',
  name: 'HAPI (Local)',
  url: 'http://localhost:8080/hapi-fhir-jpaserver/fhir',
};

const AZURE_SERVER: ServerConfig = {
  id: 'azure',
  name: 'Azure FHIR (Local)',
  url: 'http://localhost:8081',
};

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

  testServer(server: ServerConfig): void {
    // Only show 'testing' state if the request takes longer than 5s
    const slowTimer = setTimeout(() => this.serverHealth.update((h) => ({ ...h, [server.id]: 'testing' })), 5_000);
    this.slowTimers.set(server.id, slowTimer);

    const url = server.url.replace(/\/$/, '') + '/metadata';
    this.http.get(url, { responseType: 'json' }).subscribe({
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

  addServer(name: string, url: string): void {
    const id = crypto.randomUUID();
    const server: ServerConfig = { id, name, url };
    this.servers.update((list) => [...list, server]);
    this.testServer(server);
  }

  removeServer(id: string): void {
    clearTimeout(this.slowTimers.get(id));
    this.slowTimers.delete(id);
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
    this.servers.update((list) => list.map((s) => (s.id === id ? { ...s, name, url } : s)));
  }

  private loadServers(): ServerConfig[] {
    try {
      const raw = localStorage.getItem(SERVERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ServerConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
