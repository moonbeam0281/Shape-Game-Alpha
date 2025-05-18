import { Router } from "express";

import dev from "./dev";
import auth from "./auth";
import lobby from "./lobby";
import client from "./client";

const router = Router();

router.use(client);
router.use(dev);
router.use(auth);
router.use(lobby);

export default router;
