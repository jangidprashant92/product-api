import axios from "axios";
import { Request, Response } from "express";
import Product from "../../interfaces/Product";
import database from "../../utils/Database";
import { error, success } from "../../utils/ResponseApi";

interface ExchangeResponse {
  exchange: number;
  error: string;
}

class ProductController {
  public show = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { currency } = req.query;

      const [rows] = await database.connection.query(
        `SELECT * FROM product WHERE id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).send(error("Product not found"));
      }

      const product: Product = rows[0];

      if (currency && currency !== "USD") {
        try {
          const exchangeRate = await this.getCurrencyData(currency as string);
          console.log("exchangeRate", exchangeRate);
          if (exchangeRate.error)
            return res.status(500).json(error(exchangeRate.error));

          product.price = +(exchangeRate.exchange * product.price).toFixed(2);
        } catch (error) {
          return res
            .status(500)
            .send({ message: "Failed to convert currency" });
        }
      }

      await database.connection.execute(
        `UPDATE product SET productViewed = ? WHERE id = ?`,
        [product.productViewed + 1, id]
      );

      return res.status(200).json(success(product));
    } catch (err) {
      const typedError = err as Error;
      return res.status(500).json(error(typedError.message));
    }
  };

  public mostViewed = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { limit = 5, currency } = req.query;

    let exchangeRes: ExchangeResponse;

    if (currency && currency !== "USD") {
      try {
        exchangeRes = await this.getCurrencyData(currency as string);
        if (exchangeRes.error)
          return res.status(500).json(error(exchangeRes.error));
      } catch (err) {
        const e = err as Error;
        return res.status(500).json(error(e.message));
      }
    }
    try {
      const [rows] = await database.connection.query(
        `SELECT * FROM product WHERE productViewed > 0 ORDER BY productViewed DESC LIMIT ?`,
        [limit]
      );

      const products = await Promise.all(
        rows.map(async (product: Product) => {
          if (currency && currency !== "USD") {
            product.price = +(exchangeRes.exchange * product.price).toFixed(2);
          }

          return product;
        })
      );

      return res.status(200).json(success(products));
    } catch (err) {
      const e = err as Error;
      return res.status(500).json(error(e.message));
    }
  };

  async getCurrencyData(currency: string): Promise<ExchangeResponse> {
    try {
      const url = `${process.env.CURRENCY_API_URL}/currency_data/live?base=USD&currencies=${currency}`;
      const { data } = await axios.get(url, {
        headers: {
          apikey: process.env.CURRENCY_API_KEY,
        },
      });

      if (!data.success) return { exchange: 0, error: data.error.info };

      return { exchange: data.quotes[`USD${currency}`], error: "" };
    } catch (err) {
      const error = err as Error;
      return { exchange: 0, error: error.message };
    }
  }
}

export default ProductController;
