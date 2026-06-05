import { issues as mockIssues } from "@/lib/mock-data";
import { fetchOrMock } from "./api";

export type Issue = (typeof mockIssues)[number];

export const issuesService = {
  list: (projectId?: string): Promise<Issue[]> =>
    fetchOrMock<Issue[]>("/issues", () => [...mockIssues], { query: { projectId } }),
};
