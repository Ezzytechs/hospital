import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { tenantScope } from "../middleware/tenantMiddleware.js";
import { can } from "../middleware/roleGuard.js";
import { controllers } from "../controllers/emrControllerFactory.js";

const router = express.Router();

const wireCRUD = (name, ctrl) => {
  const base = `/emr/${name.toLowerCase()}`;
  router.post(base, auth, tenantScope, can(name, "create"), ctrl.create);
  router.get(base, auth, tenantScope, can(name, "read"), ctrl.list);
  router.get(`${base}/:id`, auth, tenantScope, can(name, "read"), ctrl.get);
  router.patch(`${base}/:id`, auth, tenantScope, can(name, "update"), ctrl.update);
  router.delete(`${base}/:id`, auth, tenantScope, can(name, "delete"), ctrl.remove);
};

Object.entries(controllers).forEach(([name, ctrl]) => wireCRUD(name, ctrl));

export default router;
