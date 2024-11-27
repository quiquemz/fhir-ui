import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Bundle, BundleEntry, DomainResource } from 'fhir/r4';
import { DataSet, Network, Node as VisNode, Edge, IdType } from 'vis-network/standalone/esm/vis-network';
import { PdmsService } from '../../services/pdms.service';
import { JsonPipe } from '@angular/common';
import { FhirJsonViewerComponent } from '../fhir-json-viewer/fhir-json-viewer.component';
import { EMPTY, expand, reduce } from 'rxjs';

interface Node extends VisNode {
	data?: any;
}

@Component({
	selector: 'app-fhir-resource-graph',
	standalone: true,
	imports: [JsonPipe, FhirJsonViewerComponent],
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

	constructor(private pdmsService: PdmsService) {}

	ngOnInit(): void {
		this.createNetwork();
		this.addNodeWithEdge(this.resource, undefined, '#95E06C');
	}

	private createNetwork(): void {
		this.nodes = new DataSet<Node>([]);
		this.edges = new DataSet<Edge>([]);
		const container = this.networkContainer.nativeElement;
		const data = { nodes: this.nodes, edges: this.edges };
		const options = {
			nodes: {
				shape: 'dot',
				borderWidth: 2,
			},
			edges: {
				width: 2,
			},
			interaction: {
				zoomView: false,
			},
			physics: {
				enabled: true,
				solver: 'barnesHut',
				stabilization: { iterations: 100 },
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
			this.pdmsService.getByReference(ref).subscribe((resource) => {
				this.addNodeWithEdge(resource, this.selectedNode?.id, '#BFDBF7');
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

			this.pdmsService.getAll(resourceType, '', 10, searchParams).subscribe((resources) => {
				if (
					resources == null ||
					resources.entry == null ||
					resources.entry.find((e) => e.resource?.resourceType === 'OperationOutcome')
				) {
					alert('No resources found, make sure the resource type and search prefix are correct');
					return;
				}

				for (const resource of resources.entry?.map((entry) => entry.resource) || []) {
					this.addNodeWithEdge(resource, clickedNodeId, '#BFDBF7');
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

		this.pdmsService
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

					return this.pdmsService.getEverythingById(resource!.resourceType, resource!.id!, nextToken);
				}),
				reduce((acc: BundleEntry<DomainResource>[], current: Bundle<DomainResource>) => {
					return [...acc, ...(current.entry || [])];
				}, [] as BundleEntry<DomainResource>[]),
			)
			.subscribe((allEntries: BundleEntry<DomainResource>[]) => {
				for (const entry of allEntries) {
					const resource = entry.resource;
					if (resource?.id && resource?.resourceType) {
						this.addNodeWithEdge(resource, this.selectedNode?.id, '#BFDBF7');
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

	private addNodeWithEdge(resource: DomainResource | undefined, from: IdType | undefined, color: string): void {
		if (!resource || !resource.id) {
			return;
		}

		const newNode: Node = {
			id: resource.id,
			label: this.getResourceLabel(resource),
			data: resource,
			color: color,
		};

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
