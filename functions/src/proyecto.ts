import * as express from "express";
import * as admin from "firebase-admin";
import {db} from "./index";

"use strict";

export interface Proyecto {
  datos: {
    cuit: string,
    direccion: string,
    director: string,
    email: string,
    nombre: string,
    productora: string,
    razonSocial: string,
    sigla: string,
  },
  foto: string,
  tipoProyecto: string,
}

export const proyectosRouter = express.Router();

// Post Proyecto nuevo
proyectosRouter.post("", async (req: any, res: any) => {
  db.doc("usuarios/" + req.user.uid).get().then( async (doc) => {
    if (!doc.data()!.isProductora) {
      return res.status(403).json({Error: "Unauthorized"});
    } else {
      try {
        const data = JSON.parse(req.body);
        const nuevoProyecto: Proyecto = {
          datos: {
            cuit: data.datos.cuit,
            direccion: data.datos.direccion,
            director: data.datos.director,
            email: "",
            nombre: data.datos.nombre,
            productora: data.datos.productora,
            razonSocial: data.datos.razonSocial,
            sigla: data.datos.sigla,
          },
          foto: "",
          tipoProyecto: data.tipoProyecto,
        };
        const newDoc = await db.collection("proyectos").add(nuevoProyecto);
        const muestraProyectoProductora = {
          director: nuevoProyecto.datos.director,
          id: newDoc.id,
          nombre: nuevoProyecto.datos.nombre,
          productora: nuevoProyecto.datos.productora,
          tipoProyecto: nuevoProyecto.tipoProyecto,
        };
        db.doc("usuarios/" + req.user.uid).update({
          proyectos: admin.firestore.FieldValue.arrayUnion(muestraProyectoProductora),
        });
        res.status(201).json({id: newDoc.id});
        return;
      } catch (error) {
        console.log("Error datos proyecto: " + error);
        res.status(400).json({Error: error});
        return;
      }
    }
  }).catch((error) => {
    console.log("Error al obtener el usuario: " + error);
    res.status(404).json({Error: error});
    return;
  });
});
