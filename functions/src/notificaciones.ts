import * as express from "express";
import {db} from "./index";

("use strict");

// Notificaciones Interface
export class NotificacionNuevoProyecto {
  color: string;
  fecha: string;
  icono: string;
  id: string;
  mensaje: string;
  noLeida: boolean;
  constructor(idInvitacion) {
    this.color = "bg-success";
    this.fecha = new Date().toLocaleDateString("es-AR", {day: "2-digit", month: "2-digit", year: "numeric"});
    this.icono = "mdi-filmstrip";
    this.id = idInvitacion;
    this.mensaje = "Invitación a proyecto";
    this.noLeida = true;
  }
}

// Notificaciones Router
export const notificacionesRouter = express.Router();

// Put Notificaciones
notificacionesRouter.put("/:id", (req: any, res: any) => {
  if (req.user.uid !== req.params.id) {
    return res.status(403).json({Error: "Unauthorized"});
  }
  db.doc(`usuarios/${req.user.uid}`)
    .update({
      notificaciones: JSON.parse(req.body),
    })
    .then(() => {
      return res.status(200).json({id: req.params.id});
    })
    .catch((error) => {
      return res.status(404).json({Error: error});
    });
});
