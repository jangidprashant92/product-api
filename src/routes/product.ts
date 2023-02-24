import { Router } from "express";
import ProductController from "../controllers/api/ProductController";
import Validate from "../middlewares/Validate";
import { singleProductdValidation } from "../validations/product";

export class ProductRoutes {
  public router: Router;
  public ProductController: ProductController = new ProductController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get(
      "/product/:id",
      singleProductdValidation,
      Validate.validateRequest,
      this.ProductController.show
    );
    this.router.get(
      "/mostViewed",
      singleProductdValidation,
      Validate.validateRequest,
      this.ProductController.mostViewed
    );
  }
}
