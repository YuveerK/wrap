import * as communitiesRepo from "./communities.repository.js";
import { NotFoundError } from "../../libraries/errors.js";

export async function getCurrentCommunity(userId) {
  const communityId = await communitiesRepo.resolveUserCommunityId(userId);

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
