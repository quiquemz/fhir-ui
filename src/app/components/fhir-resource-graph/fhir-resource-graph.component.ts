import { Component, ElementRef, Input, OnInit, ViewChild, effect } from '@angular/core';
import { Bundle, BundleEntry, DomainResource } from 'fhir/r4';
import { DataSet, Network, Node as VisNode, Edge, IdType } from 'vis-network/standalone/esm/vis-network';
import { FhirService } from '../../services/fhir.service';
import { ThemeService } from '../../services/theme.service';
import { JsonPipe } from '@angular/common';
import { FhirJsonViewerComponent } from '../fhir-json-viewer/fhir-json-viewer.component';
import { MatIconModule } from '@angular/material/icon';
import { EMPTY, expand, reduce } from 'rxjs';

const GRAPH_COLORS = {
  light: {
    root: {
      background: '#E8F5E9',
      border: '#43A047',
      font: '#1B5E20',
      highlight: { background: '#C8E6C9', border: '#2E7D32' },
    },
    direct: {
      background: '#E3F2FD',
      border: '#1E88E5',
      font: '#0D47A1',
      highlight: { background: '#BBDEFB', border: '#1565C0' },
    },
    indirect: {
      background: '#FFF3E0',
      border: '#FB8C00',
      font: '#E65100',
      highlight: { background: '#FFE0B2', border: '#EF6C00' },
    },
    edge: { color: '#90A4AE', highlight: '#546E7A' },
    text: '#37474F',
  },
  dark: {
    root: {
      background: '#1B5E20',
      border: '#66BB6A',
      font: '#E8F5E9',
      highlight: { background: '#2E7D32', border: '#81C784' },
    },
    direct: {
      background: '#0D47A1',
      border: '#42A5F5',
      font: '#E3F2FD',
      highlight: { background: '#1565C0', border: '#64B5F6' },
    },
    indirect: {
      background: '#E65100',
      border: '#FFA726',
      font: '#FFF3E0',
      highlight: { background: '#EF6C00', border: '#FFB74D' },
    },
    edge: { color: '#78909C', highlight: '#B0BEC5' },
    text: '#ECEFF1',
  },
} as const;

interface Node extends VisNode {
  data?: any;
}

@Component({
  selector: 'app-fhir-resource-graph',
  standalone: true,
  imports: [FhirJsonViewerComponent, MatIconModule],
  templateUrl: './fhir-resource-graph.component.html',
  styleUrl: './fhir-resource-graph.component.scss',
})
export class FhirResourceGraphComponent implements OnInit {
  @ViewChild('networkContainer', { static: true }) networkContainer!: ElementRef;
  @Input({ required: true }) resource!: DomainResource;
  selectedNode: Node | null = null;
  selectedEdge: Edge | null = null;
  selectedResource: DomainResource | null = null;

  private network!: Network;
  private nodes!: DataSet<Node>;
  private edges!: DataSet<Edge>;

  constructor(
    private fhirService: FhirService,
    private themeService: ThemeService,
  ) {
    effect(() => {
      const _ = this.themeService.theme();
      if (this.network) {
        this.updateGraphColors();
      }
    });
  }

  ngOnInit(): void {
    this.createNetwork();
    this.addNodeWithEdge(this.resource, undefined, 'root');
  }

  private get palette() {
    return this.themeService.isDark ? GRAPH_COLORS.dark : GRAPH_COLORS.light;
  }

  private createNetwork(): void {
    this.nodes = new DataSet<Node>([]);
    this.edges = new DataSet<Edge>([]);
    const container = this.networkContainer.nativeElement;
    const data = { nodes: this.nodes, edges: this.edges };
    const p = this.palette;
    const options = {
      nodes: {
        shape: 'box',
        borderWidth: 2,
        borderWidthSelected: 3,
        font: { size: 13, face: 'Inter, system-ui, sans-serif', color: p.text, multi: false },
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        shadow: { enabled: true, size: 4, x: 2, y: 2, color: 'rgba(0,0,0,0.15)' },
      },
      edges: {
        width: 2,
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.4 },
        color: { color: p.edge.color, highlight: p.edge.highlight },
      },
      interaction: {
        zoomView: false,
        hover: true,
        tooltipDelay: 200,
      },
      physics: {
        enabled: true,
        solver: 'barnesHut',
        barnesHut: { gravitationalConstant: -3000, springLength: 150, springConstant: 0.04, damping: 0.09 },
        stabilization: { iterations: 150 },
      },
    };

    this.network = new Network(container, data, options);
    this.network.on('click', (params) => {
      const clickedNodeId = params.nodes[0];
      const clickedEdgeId = params.edges[0];

      this.handleGraphClick(clickedNodeId, clickedEdgeId);
    });
  }

  private getResourceLabel = (resource: DomainResource | undefined): string =>
    `${resource?.resourceType}\n(${resource?.id?.slice(0, 8)})`;

  zoomIn(): void {
    const scaleFactor = 1.2;
    const options = {
      scale: this.network.getScale() * scaleFactor,
    };
    this.network.moveTo(options);
  }

  zoomOut(): void {
    const scaleFactor = 0.8;
    const options = {
      scale: this.network.getScale() * scaleFactor,
    };
    this.network.moveTo(options);
  }

  fit = (): void =>
    this.network.fit({
      animation: {
        duration: 500,
        easingFunction: 'easeInOutQuad',
      },
    });

  handleGraphClick(nodeId: number, edgeId: number): void {
    this.selectNode(nodeId);
    this.selectEdge(edgeId);
  }

  selectNode(nodeId: number): void {
    if (nodeId === undefined) {
      this.selectedNode = null;
      this.selectedResource = null;
    } else {
      this.selectedNode = this.nodes.get(nodeId);
      this.selectedResource = this.selectedNode?.data;
    }
  }

  selectEdge(edgeId: number): void {
    if (edgeId === undefined) {
      this.selectedEdge = null;
    } else {
      this.selectedEdge = this.edges.get(edgeId);
    }
  }

  private findReferences(obj: any): string[] {
    const references: string[] = [];

    function rec(obj: any, depth: number = 0): void {
      if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
          if (key === 'reference' && typeof obj[key] === 'string') {
            references.push(obj[key]);
          } else if (typeof obj[key] === 'object') {
            rec(obj[key], depth + 1);
          }
        }
      }
    }

    rec(obj);
    return references;
  }

  showDirectReferences(): void {
    if (!this.selectedResource) {
      alert('Please select a node before adding a resource');
      return;
    }

    const references = this.findReferences(this.selectedResource);
    for (const ref of references) {
      this.fhirService.getByReference(ref).subscribe((resource) => {
        this.addNodeWithEdge(resource, this.selectedNode?.id, 'direct');
      });
    }
  }

  addIndirectReference(): void {
    if (!this.selectedNode) {
      alert('Please select a node before adding a resource');
      return;
    }

    const resourceType = prompt('Enter the resource:', 'EpisodeOfCare');
    const searchByPrefix = prompt('Enter the search prefix:', 'patient:Patient');
    const resourceId = this.selectedNode?.data?.id;
    const clickedNodeId = this.selectedNode?.id;

    if (resourceType && searchByPrefix && resourceId) {
      const searchParams: { [key: string]: string[] } = {};
      searchParams[searchByPrefix] = [resourceId];

      this.fhirService.getAll(resourceType, '', 10, searchParams).subscribe((resources) => {
        if (
          resources == null ||
          resources.entry == null ||
          resources.entry.find((e) => e.resource?.resourceType === 'OperationOutcome')
        ) {
          alert('No resources found, make sure the resource type and search prefix are correct');
          return;
        }

        for (const resource of resources.entry?.map((entry) => entry.resource) || []) {
          this.addNodeWithEdge(resource, clickedNodeId, 'indirect');
        }
      });
    }
  }

  showAllReferences(): void {
    var resource = this.selectedResource;
    if (!resource || !resource.id || !resource.resourceType) {
      alert('Please select a node before adding a resource');
      return;
    }

    this.fhirService
      .getEverythingById(resource.resourceType, resource.id, '')
      .pipe(
        expand((response) => {
          if (!response.link?.some((l) => l.relation === 'next')) {
            return EMPTY;
          }

          const nextUrl = response.link.find((link: { relation: string }) => link.relation === 'next')!.url;
          const url = new URL(nextUrl);
          const nextToken = url.searchParams.get('ct');

          if (!nextToken) {
            return EMPTY;
          }

          return this.fhirService.getEverythingById(resource!.resourceType, resource!.id!, nextToken);
        }),
        reduce((acc: BundleEntry<DomainResource>[], current: Bundle<DomainResource>) => {
          return [...acc, ...(current.entry || [])];
        }, [] as BundleEntry<DomainResource>[]),
      )
      .subscribe((allEntries: BundleEntry<DomainResource>[]) => {
        for (const entry of allEntries) {
          const resource = entry.resource;
          if (resource?.id && resource?.resourceType) {
            this.addNodeWithEdge(resource, this.selectedNode?.id, 'direct');
          }
        }
      });
  }

  deleteNodeOrEdge(): void {
    if (!(this.selectedNode || this.selectedEdge)) {
      alert('Please select a node/edge before deleting');
      return;
    }

    if (this.selectedNode?.id === this.resource.id) {
      alert('Cannot delete the root node');
      return;
    }

    if (this.selectedNode) {
      this.nodes.remove(this.selectedNode);
    }

    if (this.selectedEdge) {
      this.edges.remove(this.selectedEdge);
    }
  }

  private updateGraphColors(): void {
    const p = this.palette;
    this.nodes.forEach((node) => {
      const nodeType = (node as any)._nodeType || 'direct';
      const colors = p[nodeType as keyof typeof p] as any;
      if (colors?.background) {
        this.nodes.update({ id: node.id, color: colors, font: { color: colors.font } });
      }
    });
    this.network.setOptions({
      edges: { color: { color: p.edge.color, highlight: p.edge.highlight } },
      nodes: { font: { color: p.text } },
    });
  }

  private addNodeWithEdge(resource: DomainResource | undefined, from: IdType | undefined, nodeType: string): void {
    if (!resource || !resource.id) {
      return;
    }

    const p = this.palette;
    const colors = p[nodeType as keyof typeof p] as any;

    const newNode: Node = {
      id: resource.id,
      label: this.getResourceLabel(resource),
      data: resource,
      color: colors,
      font: { color: colors.font },
      _nodeType: nodeType,
    } as any;

    if (!this.nodes.get(resource.id)) {
      this.nodes.add(newNode);
    }

    if (from && resource.id && !this.edgeExists(from, resource.id) && from !== resource.id) {
      const newEdge: Edge = { from: from, to: resource.id };
      this.edges.add(newEdge);
    }
  }

  private edgeExists = (from: IdType, to: IdType): boolean =>
    this.edges.get().some((edge) => edge.from === from && edge.to === to) ||
    this.edges.get().some((edge) => edge.from === to && edge.to === from);

  onKeyUp(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        this.deleteNodeOrEdge();
        break;
      default:
        break;
    }
  }
}
