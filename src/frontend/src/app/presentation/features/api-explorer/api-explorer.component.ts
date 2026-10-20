import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/tokens/api-config.token';

export type ApiEndpointKey = 'telemetry' | 'projects' | 'guestbook' | 'sign' | 'n8n_notify' | 'ping';

export interface ApiEndpointDef {
  readonly key: ApiEndpointKey;
  readonly method: 'GET' | 'POST';
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly sampleBody?: Record<string, unknown>;
}

export const API_ENDPOINTS: readonly ApiEndpointDef[] = [
  {
    key: 'telemetry',
    method: 'GET',
    path: '/telemetry',
    title: 'OCI Telemetry',
    description: 'Métricas de CPU, memoria, uptime y ping del VPS en Ashburn'
  },
  {
    key: 'projects',
    method: 'GET',
    path: '/projects',
    title: 'Featured Projects',
    description: 'Catálogo de proyectos de producción con arquitectura y stacks'
  },
  {
    key: 'guestbook',
    method: 'GET',
    path: '/guestbook?limit=10',
    title: 'Guestbook Wall',
    description: 'Últimas firmas de visitantes y reclutadores en MySQL'
  },
  {
    key: 'sign',
    method: 'POST',
    path: '/guestbook',
    title: 'Sign Guestbook',
    description: 'Crea una firma con validación FluentValidation y CQRS',
    sampleBody: {
      authorName: 'Recruiter / Visitor',
      authorRole: 'Tech Lead / CTO',
      company: 'Enterprise Inc',
      message: 'Impresionante arquitectura en .NET 8 y Angular Signals.',
      badgeTag: 'DEV_ZEN'
    }
  },
  {
    key: 'n8n_notify',
    method: 'POST',
    path: 'https://n8n.bryan-bano.com/webhook/portfolio-notify',
    title: 'n8n AI Push Dispatcher',
    description: 'Dispara triage cognitivo con IA y notificación instantánea a Telegram de Bryan',
    sampleBody: {
      eventType: 'LEAD_PROSPECT_ALERT',
      senderName: 'Director de Ingeniería (Headhunting)',
      senderContact: 'hiring@tech-scale.io',
      serviceType: 'Contratación Senior .NET / Angular',
      message: 'Revisamos tu portafolio y queremos agendar una entrevista técnica inmediata para un rol remoto.'
    }
  },
  {
    key: 'ping',
    method: 'GET',
    path: '/ping',
    title: 'Health Ping',
    description: 'Heartbeat ultra-rápido de disponibilidad de Kestrel'
  }
];

@Component({
  selector: 'app-api-explorer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-explorer.component.html',
  styleUrl: './api-explorer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiExplorerComponent {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly endpoints = API_ENDPOINTS;
  readonly selectedKey = signal<ApiEndpointKey>('telemetry');
  readonly isDispatching = signal<boolean>(false);
  readonly packetStage = signal<number>(0); // 0=idle, 1=client->cf, 2=cf->oci, 3=returned
  readonly responseStatusCode = signal<number | null>(200);
  readonly responseStatusText = signal<string>('OK');
  readonly responseLatency = signal<number>(24);
  readonly responseHeaders = signal<Record<string, string>>({
    'content-type': 'application/json; charset=utf-8',
    'server': 'Kestrel / Caddy Reverse Proxy',
    'x-region': 'us-ashburn-1'
  });
  readonly responseFormattedJson = signal<string>('');
  readonly isCopied = signal<boolean>(false);

  readonly currentEndpoint = computed(() => {
    return this.endpoints.find(e => e.key === this.selectedKey()) ?? this.endpoints[0];
  });

  constructor() {
    this.dispatchRequest();
  }

  selectEndpoint(key: ApiEndpointKey): void {
    if (this.selectedKey() === key && !this.isDispatching()) {
      this.dispatchRequest();
      return;
    }
    this.selectedKey.set(key);
    this.dispatchRequest();
  }

  dispatchRequest(): void {
    if (this.isDispatching()) return;

    this.isDispatching.set(true);
    this.packetStage.set(1);

    const startTime = performance.now();
    const endpoint = this.currentEndpoint();
    const targetUrl = endpoint.path.startsWith('http') ? endpoint.path : `${this.baseUrl}${endpoint.path}`;

    // Animación visual secuencial de paquetes
    setTimeout(() => {
      this.packetStage.set(2);
    }, 180);

    const finishWithData = (data: unknown, statusCode = 200, statusText = 'OK') => {
      const elapsed = Math.max(12, Math.round(performance.now() - startTime));
      this.packetStage.set(3);
      this.responseLatency.set(elapsed);
      this.responseStatusCode.set(statusCode);
      this.responseStatusText.set(statusText);
      this.responseFormattedJson.set(JSON.stringify(data, null, 2));

      setTimeout(() => {
        this.isDispatching.set(false);
        this.packetStage.set(0);
      }, 350);
    };

    if (endpoint.method === 'POST') {
      const body = endpoint.sampleBody ?? {};
      this.http.post(targetUrl, body).subscribe({
        next: res => finishWithData(res, 201, 'Created'),
        error: () => {
          // Fallback enriquecido simulado si no hay backend activo
          const mockCreated = {
            id: 'mock-' + Date.now().toString(36),
            ...body,
            createdAtUtc: new Date().toISOString(),
            status: 'PERSISTED_IN_MEMORY'
          };
          finishWithData(mockCreated, 201, 'Created (Simulated Clean Arch)');
        }
      });
    } else {
      this.http.get(targetUrl).subscribe({
        next: res => finishWithData(res, 200, 'OK'),
        error: () => {
          const fallbackData = this.getFallbackData(endpoint.key);
          finishWithData(fallbackData, 200, 'OK (Local Fallback Stream)');
        }
      });
    }
  }

  copyResponse(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.responseFormattedJson()).then(() => {
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2000);
      });
    }
  }

  private getFallbackData(key: ApiEndpointKey): unknown {
    switch (key) {
      case 'telemetry':
        return {
          status: 'OPERATIONAL',
          uptime: '14d 08h 22m 10s',
          host: 'srv-personal-core',
          architecture: 'ARM64 Ampere Altra (4 OCPU, 24GB RAM)',
          processMemoryMb: 94.6,
          os: 'Oracle Linux Server 8.9',
          dotnetVersion: '.NET 8.0.12 LTS Runtime',
          region: 'us-ashburn-1',
          pingMs: 24
        };
      case 'projects':
        return [
          {
            id: 'zen-portfolio-v2',
            title: 'Full-Stack High-Impact Portfolio',
            architecture: 'Clean Architecture (.NET 9 + Angular 20 Signals)',
            tags: ['.NET 9', 'Angular 20', 'MySQL', 'n8n', 'OCI ARM64'],
            productionUrl: 'https://bryan-bano.com',
            status: 'ACTIVE_PRODUCTION'
          },
          {
            id: 'incident-simulator',
            title: 'Cloud Security Incident Response Lab',
            architecture: 'Serverless Event-Driven Orchestration',
            tags: ['TypeScript', 'Signals', 'Cloud Architecture'],
            status: 'COMPLETED'
          }
        ];
      case 'guestbook':
        return [
          {
            id: 'gb-1',
            authorName: 'Alex Mercer',
            authorRole: 'Engineering Manager',
            company: 'Cloud Scale Corp',
            message: 'Excelente atención al detalle en la arquitectura y rendimiento.',
            badgeTag: 'VIP_GUEST',
            createdAtUtc: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'gb-2',
            authorName: 'Evelyn Reed',
            authorRole: 'Senior SRE',
            company: 'Fintech Solutions',
            message: 'El tracer de paquetes en vivo demuestra dominio real de networking.',
            badgeTag: 'DEV_ZEN',
            createdAtUtc: new Date(Date.now() - 7200000).toISOString()
          }
        ];
      case 'ping':
        return {
          status: 'PONG',
          timestamp: new Date().toISOString(),
          datacenter: 'ashburn-oci-ad1'
        };
      default:
        return { success: true };
    }
  }
}
