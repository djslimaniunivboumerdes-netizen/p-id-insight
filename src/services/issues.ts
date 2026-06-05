import { listIssuesFn, type IssueDTO } from "@/lib/pid/api.functions";

export type Issue = IssueDTO;

export const issuesService = {
  list: (projectId?: string): Promise<Issue[]> =>
    listIssuesFn({ data: { projectId } }),
};
