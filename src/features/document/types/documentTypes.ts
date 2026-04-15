export type DocumentVisibility = "private" | "public";

export interface DocumentWorkspaceRef {
  _id: string;
  name?: string;
}

export interface DocumentAuthorRef {
  _id: string;
  username?: string;
  email?: string;
  image?: string;
}

export interface DocumentItem {
  _id: string;
  title: string;
  content: string;
  workspaceId: string | DocumentWorkspaceRef;
  visibility: DocumentVisibility;
  createdAt?: string;
  updatedAt?: string;
  authorId?: string | DocumentAuthorRef;
}

export interface DocumentsResponse {
  documents: DocumentItem[];
  message?: string;
}

export interface DocumentResponse {
  document: DocumentItem;
  message?: string;
}

export interface CreateDocumentPayload {
  workspaceId: string;
  title: string;
  content: string;
  visibility?: DocumentVisibility;
}

export interface UpdateDocumentPayload {
  id: string;
  data: Partial<Pick<DocumentItem, "title" | "content" | "visibility">>;
}

export interface SearchPublicDocumentsPayload {
  query: string;
}

export interface MarkDocumentReadPayload {
  documentId: string;
}
