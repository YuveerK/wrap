import { Router } from "express";
import * as usersController from "./users.controller.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/authenticate.js";
import { updateUserSchema } from "./users.schemas.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN", "COMMITTEE"), usersController.getUsers);
router.get("/:id", authenticate, usersController.getUserById);
router.put("/:id", authenticate, validateBody(updateUserSchema), usersController.updateUser);
router.delete("/:id", authenticate, authorize("ADMIN"), usersController.deleteUser);

export default router;
