import * as communitiesService from "./communities.service.js";

export async function getCurrent(req, res, next) {
  try {
    const community = await communitiesService.getCurrentCommunity(req.user.sub);
    res.json({ community });
  } catch (err) {
    next(err);
  }
}
