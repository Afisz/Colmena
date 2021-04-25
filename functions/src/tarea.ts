import * as express from "express";
import {db} from "./index";

("use strict");

// Tarea Interface
export interface Tarea {
  tarea: string;
  finalizada: boolean;
}

// Tareas Router
export const tareasRouter = express.Router();

// Put Tareas
tareasRouter.put("/:id", (req: any, res: any) => {
  if (req.user.uid !== req.params.id) {
    return res.status(403).json({Error: "Unauthorized"});
  }
  db.doc(`usuarios/${req.user.uid}`)
    .update({
      tareas: JSON.parse(req.body),
    })
    .then(() => {
      return res.status(200).json({id: req.params.id});
    })
    .catch((error) => {
      return res.status(404).json({Error: error});
    });
});
