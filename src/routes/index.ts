import express from "express";
import { ProductRoutes } from "./product";

const router = express.Router();

router.use("/api", new ProductRoutes().router);

export { router as routes };
