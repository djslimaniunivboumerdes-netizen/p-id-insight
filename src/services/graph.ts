import { getGraphFn } from "@/lib/pid/api.functions";
import { graphNodes as mockNodes, graphEdges as mockEdges } from "@/lib/mock-data";

export type GraphNode = (typeof mockNodes)[number];
export type GraphEdge = (typeof mockEdges)[number];

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const graphService = {
  get: (projectId?: string): Promise<Graph> =>
    getGraphFn({ data: { projectId } }) as Promise<Graph>,
};
