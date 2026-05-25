import { Router } from "express";
import * as communitiesController from "./communities.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = Router();

router.get("/current", authenticate, communitiesController.getCurrent);

export default router;
