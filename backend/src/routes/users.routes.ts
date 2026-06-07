import { Router, IRouter } from "express";
import {
  getProfile,
  listUsers,
  updateUser,
  deleteUser,
} from "../controllers/users.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { updateUserSchema, userIdParamSchema } from "../models/users.schemas";

export const router: IRouter = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", getProfile);

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin only)
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
router.get("/", authorize("admin"), listUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user (admin or own profile)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  "/:id",
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  updateUser,
);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204:
 *         description: User deleted
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/:id",
  authorize("admin"),
  validate({ params: userIdParamSchema }),
  deleteUser,
);
