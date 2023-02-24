import { query } from "express-validator";

export const singleProductdValidation = [
  query("currency", "currency not valid").isIn(["USD", "CAD"]),
];
