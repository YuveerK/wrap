import { apiClient } from "./client";

export async function fetchCurrentCommunity() {
  return apiClient.get("/communities/current");
}
