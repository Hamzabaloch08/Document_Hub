export type WorkspaceVisibility = "public" | "private";

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  visibility?: WorkspaceVisibility;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceMemberUser {
  _id: string;
  username: string;
  email: string;
}

export interface WorkspaceMember {
  _id?: string;
  workspaceId: string;
  userId: string | WorkspaceMemberUser;
  role: "admin" | "editor" | "viewer";
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
  visibility?: WorkspaceVisibility;
}

export interface AddWorkspaceMemberPayload {
  workspaceId: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

export interface RemoveWorkspaceMemberPayload {
  workspaceId: string;
  userId: string;
}

export interface UpdateWorkspacePayload {
  id: string;
  data: Partial<Pick<Workspace, "name" | "description" | "visibility">>;
}

export interface WorkspaceResponse {
  message?: string;
  workspace: Workspace;
}

export interface WorkspacesResponse {
  message?: string;
  workspaces: Workspace[];
}

export interface WorkspaceDetailsResponse {
  workspace: Workspace;
  members: WorkspaceMember[];
}
