import { apiClient } from "./client";

export async function listPosts() {
  return apiClient.get("/posts");
}

/** @param {{ title?: string, body: string, pinned?: boolean }} body */
export async function createPost(body) {
  return apiClient.post("/posts", body);
}
