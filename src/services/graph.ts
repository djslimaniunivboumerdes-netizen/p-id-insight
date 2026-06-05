import { graphNodes as mockNodes, graphEdges as mockEdges } from "@/lib/mock-data";
import { fetchOrMock } from "./api";

export type GraphNode = (typeof mockNodes)[number];
export type GraphEdge = (typeof mockEdges)[number];

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const graphService = {
  get: (projectId?: string): Promise<Graph> =>
    fetchOrMock<Graph>(
      "/graph",
      () => ({ nodes: [...mockNodes], edges: [...mockEdges] }),
      { query: { projectId } },
    ),
};
