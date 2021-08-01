import * as express from "express";
import {db} from "./index";

("use strict");

// Globales Router
export const globalesRouter = express.Router();

// Get Globales
globalesRouter.get("", (req: any, res: any) => {
  db.doc("generales/globales")
    .get()
    .then((doc) => {
      return res.status(200).json(doc.data());
    })
    .catch((error) => {
      return res.status(404).json({Error: error});
    });
});
