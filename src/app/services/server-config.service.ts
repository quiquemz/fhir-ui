import { Injectable, computed, effect, signal } from '@angular/core';

export interface ServerConfig {
  id: string;
  name: string;
  url: string;
}

const SERVERS_KEY = 'fhir-server-configs';
const ACTIVE_KEY = 'fhir-active-server';

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
export class ServerConfigService {
  readonly servers = signal<ServerConfig[]>(this.loadServers());
  readonly activeServerId = signal<string>(this.loadActiveId());

  readonly activeServer = computed(
    () => this.servers().find((s) => s.id === this.activeServerId()) ?? this.servers()[0],
  );

  readonly baseUrl = computed(() => this.activeServer()?.url ?? '/api');

  constructor() {
    effect(() => {
      localStorage.setItem(SERVERS_KEY, JSON.stringify(this.servers()));
    });
    effect(() => {
      localStorage.setItem(ACTIVE_KEY, this.activeServerId());
    });
  }

  addServer(name: string, url: string): void {
    const id = crypto.randomUUID();
    this.servers.update((list) => [...list, { id, name, url }]);
  }

  removeServer(id: string): void {
    this.servers.update((list) => list.filter((s) => s.id !== id));
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
