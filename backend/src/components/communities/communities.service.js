import * as communitiesRepo from "./communities.repository.js";
import { NotFoundError } from "../../libraries/errors.js";

const DEFAULT_COMMUNITY_ID = 1;

export async function getCurrentCommunity(userId) {
  let communityId = await communitiesRepo.getUserCommunityId(userId);

  if (!communityId) {
    await communitiesRepo.assignUserToCommunity(userId, DEFAULT_COMMUNITY_ID);
    communityId = DEFAULT_COMMUNITY_ID;
  }

  const community = await communitiesRepo.findCommunityById(communityId);
  if (!community) throw new NotFoundError("Community");

  return {
    id: community.id,
    name: community.name,
    slug: community.slug,
    memberCount: community._count.users,
    issueCount: community._count.issues,
    postCount: community._count.posts,
  };
}

export { DEFAULT_COMMUNITY_ID };
