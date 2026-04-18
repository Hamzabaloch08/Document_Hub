import { DocumentAuthorRef } from "@/src/features/document/types/documentTypes";

export interface CommentItem {
  _id: string;
  text: string;
  documentId: string;
  userId?: string | DocumentAuthorRef;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommentPayload {
  documentId: string;
  text: string;
}
