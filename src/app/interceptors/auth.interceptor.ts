import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { ServerConfigService } from '../services/server-config.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly serverConfig = inject(ServerConfigService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const server = this.serverConfig.activeServer();
    if (!server || server.auth.type === 'none') {
      return next.handle(req);
    }

    const serverBase = server.url.replace(/\/$/, '');
    const isTokenRequest = server.auth.type === 'client_credentials' && req.url === server.auth.tokenUrl;
    const targetsFhirServer = req.url.startsWith(serverBase) || req.url.startsWith('/api');

    if (!targetsFhirServer || isTokenRequest) {
      return next.handle(req);
    }

    return this.serverConfig.buildAuthHeaders(server).pipe(
      switchMap((headers) => {
        const authReq = req.clone({ headers });
        return next.handle(authReq);
      }),
    );
  }
}
