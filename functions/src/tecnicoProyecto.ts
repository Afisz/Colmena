import * as express from "express";
import * as admin from "firebase-admin";
import {randomBytes} from "crypto";
import {db} from "./index";

("use strict");

// TecnicoProyecto Interface
export interface TecnicoProyecto {
  datos: {
    apellido: string;
    codigoArea: string;
    codigoPostal: string;
    cuil: string;
    datosBancarios: {
      banco: string;
      cbu: string;
      numeroCuenta: string;
      tipoCuenta: string;
    };
    direccion: string;
    dni: string;
    email: string;
    estudiosCursados: string;
    fechaNacimiento: string;
    nacionalidad: string;
    nombre: string;
    obraSocial: string;
    sat?: boolean;
    sica?: boolean;
    telefono: string;
  };
  alta: Date;
  baja: Date;
  area: string;
  puesto: string;
  sueldoBruto: number;
  idProyecto: string;
  idTecnico: string;
  idTecnicoProyecto: string;
  permisos: Array<string>;
}

// TecnicoProyecto Router
export const tecnicoProyectosRouter = express.Router();

// Get TecnicoProyecto
tecnicoProyectosRouter.get("/:idProyecto/:idTecnicoProyecto", (req: any, res: any) => {
  db.doc(`proyectos/${req.params.idProyecto}/tecnicoProyectos/${req.params.idTecnicoProyecto}`)
    .get()
    .then((doc) => {
      if (doc.data()!.idTecnico != req.user.uid) {
        return res.status(403).json({Error: "Unauthorized"});
      }
      return res.status(200).json(doc.data());
    })
    .catch((error) => {
      return res.status(404).json({Error: error});
    });
});

// Get TecnicosInvitados
tecnicoProyectosRouter.get("/:idProyecto/tecnicosInvitados/:idTecnicoProyecto", (req: any, res: any) => {
  const tecnicos = {
    tecnicosInvitados: [],
    tecnicoProyectos: [],
  };

  // Chequea que el usuario este autorizado
  db.doc(`proyectos/${req.params.idProyecto}/tecnicoProyectos/${req.params.idTecnicoProyecto}`)
    .get()
    .then((doc) => {
      if (doc.data()!.idTecnico != req.user.uid || !doc.data()!.permisos.includes("Técnicxs")) {
        return res.status(403).json({Error: "Unauthorized"});
      }
      // Trae los técnicos invitados que no aceptaron aun
      db.doc(`proyectos/${req.params.idProyecto}`)
        .get()
        .then((doc) => {
          doc.data().tecnicosInvitados.forEach((element) => {
            tecnicos.tecnicosInvitados.push(element);
          });

          db.collection(`proyectos/${req.params.idProyecto}/tecnicoProyectos`)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                tecnicos.tecnicoProyectos.push(doc.data());
              });
              return res.status(200).json(tecnicos);
            })
            .catch((error) => {
              return res.status(404).json({Error: error});
            });
        })
        .catch((error) => {
          return res.status(404).json({Error: error});
        });
    })
    .catch((error) => {
      return res.status(404).json({Error: error});
    });
});

// Post TecnicoProyecto nuevo
tecnicoProyectosRouter.post("", (req: any, res: any, next) => {
  const data = JSON.parse(req.body);

  db.doc(`usuarios/${req.user.uid}`)
    .get()
    .then((docUsuario) => {
      if (docUsuario.data()!.datos.email != data.datos.email) {
        return res.status(403).json({Error: "Unauthorized"});
      } else {
        const promises: Array<any> = [];
        const idTecnicoProyecto = autoId();
        const invitacionesTecnico = docUsuario.data().invitacionesProyectos;
        var invitacionAProyecto = null;
        var proyectoDelTecnico = null;

        db.doc(`proyectos/${data.idProyecto}`)
          .get()
          .then((docProyecto) => {
            const tecnicosInvitadosProyecto = docProyecto.data().tecnicosInvitados;
            var tecnicoInvitado = null;

            for (let i = 0; i < tecnicosInvitadosProyecto.length; i++) {
              if (tecnicosInvitadosProyecto[i].email == data.datos.email) {
                tecnicoInvitado = tecnicosInvitadosProyecto[i];
              }
            }

            if (tecnicoInvitado != null) {
              promises.push(
                db.doc(`proyectos/${data.idProyecto}`).update({
                  tecnicosInvitados: admin.firestore.FieldValue.arrayRemove(tecnicoInvitado),
                })
              );

              if (data.tipoProyecto == "Cine") {
                const nuevoTecnicoProyecto: TecnicoProyecto = {
                  datos: {
                    apellido: data.datos.apellido,
                    codigoArea: data.datos.codigoArea,
                    codigoPostal: data.datos.codigoPostal,
                    cuil: data.datos.cuil,
                    datosBancarios: {
                      banco: data.datos.datosBancarios.banco,
                      cbu: data.datos.datosBancarios.cbu,
                      numeroCuenta: data.datos.datosBancarios.numeroCuenta,
                      tipoCuenta: data.datos.datosBancarios.tipoCuenta,
                    },
                    direccion: data.datos.direccion,
                    dni: data.datos.dni,
                    email: data.datos.email,
                    estudiosCursados: data.datos.estudiosCursados,
                    fechaNacimiento: data.datos.fechaNacimiento,
                    nacionalidad: data.datos.nacionalidad,
                    nombre: data.datos.nombre,
                    obraSocial: data.datos.obraSocial,
                    sica: data.datos.sica,
                    telefono: data.datos.telefono,
                  },
                  alta: null,
                  baja: null,
                  area: "",
                  puesto: "",
                  sueldoBruto: null,
                  idProyecto: data.idProyecto,
                  idTecnico: req.user.uid,
                  idTecnicoProyecto: idTecnicoProyecto,
                  permisos: tecnicoInvitado.permisos,
                };

                promises.push(db.doc(`proyectos/${data.idProyecto}/tecnicoProyectos/${idTecnicoProyecto}`).set(nuevoTecnicoProyecto));
              } else if (data.tipoProyecto == "TV") {
                const nuevoTecnicoProyecto: TecnicoProyecto = {
                  datos: {
                    apellido: data.datos.apellido,
                    codigoArea: data.datos.codigoArea,
                    codigoPostal: data.datos.codigoPostal,
                    cuil: data.datos.cuil,
                    datosBancarios: {
                      banco: data.datos.datosBancarios.banco,
                      cbu: data.datos.datosBancarios.cbu,
                      numeroCuenta: data.datos.datosBancarios.numeroCuenta,
                      tipoCuenta: data.datos.datosBancarios.tipoCuenta,
                    },
                    direccion: data.datos.direccion,
                    dni: data.datos.dni,
                    email: data.datos.email,
                    estudiosCursados: data.datos.estudiosCursados,
                    fechaNacimiento: data.datos.fechaNacimiento,
                    nacionalidad: data.datos.nacionalidad,
                    nombre: data.datos.nombre,
                    obraSocial: data.datos.obraSocial,
                    sat: data.datos.sat,
                    telefono: data.datos.telefono,
                  },
                  alta: null,
                  baja: null,
                  area: "",
                  puesto: "",
                  sueldoBruto: null,
                  idProyecto: data.idProyecto,
                  idTecnico: req.user.uid,
                  idTecnicoProyecto: idTecnicoProyecto,
                  permisos: tecnicoInvitado.permisos,
                };

                promises.push(db.doc(`proyectos/${data.idProyecto}/tecnicoProyectos/${idTecnicoProyecto}`).set(nuevoTecnicoProyecto));
              }
            } else {
              return res.status(403).json({Error: "Unauthorized"});
            }

            for (let i = 0; i < invitacionesTecnico.length; i++) {
              if (invitacionesTecnico[i].idProyecto == data.idProyecto) {
                invitacionAProyecto = invitacionesTecnico[i];
                proyectoDelTecnico = Object.assign({}, invitacionesTecnico[i]);
                proyectoDelTecnico["idTecnicoProyecto"] = idTecnicoProyecto;
              }
            }

            if (invitacionAProyecto != null) {
              promises.push(
                db.doc(`usuarios/${req.user.uid}`).update({
                  invitacionesProyectos: admin.firestore.FieldValue.arrayRemove(invitacionAProyecto),
                  proyectos: admin.firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(proyectoDelTecnico))),
                })
              );
            }

            Promise.all(promises)
              .then(() => {
                return res.status(201).json({
                  idTecnicoProyecto: idTecnicoProyecto,
                });
              })
              .catch((error) => {
                return res.status(500).json({Error: error});
              });
          })
          .catch((error) => {
            return res.status(500).json({Error: error});
          });
      }
    })
    .catch((error) => {
      return res.status(404).json({Error: error});
    });
});

// Delete Invitación a Proyecto
tecnicoProyectosRouter.delete("/invitacionAProyecto/:id", (req: any, res: any, next) => {
  const data = JSON.parse(req.body);

  db.doc(`usuarios/${req.user.uid}`)
    .get()
    .then((docUsuario) => {
      const promises: Array<any> = [];
      const invitacionesTecnico = docUsuario.data().invitacionesProyectos;
      const notificacionesTecnico = docUsuario.data().notificaciones;
      const emailTecnico = docUsuario.data().datos.email;
      var invitacionAProyecto = null;
      var notificacion = null;

      db.doc(`proyectos/${req.params.id}`)
        .get()
        .then((docProyecto) => {
          const tecnicosInvitadosProyecto = docProyecto.data().tecnicosInvitados;
          var tecnicoInvitado = null;

          for (let i = 0; i < tecnicosInvitadosProyecto.length; i++) {
            if (tecnicosInvitadosProyecto[i].email == emailTecnico) {
              tecnicoInvitado = tecnicosInvitadosProyecto[i];
            }
          }

          if (tecnicoInvitado != null) {
            promises.push(
              db.doc(`proyectos/${req.params.id}`).update({
                tecnicosInvitados: admin.firestore.FieldValue.arrayRemove(tecnicoInvitado),
              })
            );
          } else {
            return res.status(403).json({Error: "Unauthorized"});
          }

          for (let i = 0; i < invitacionesTecnico.length; i++) {
            if (invitacionesTecnico[i].idInvitacion == data.idInvitacion) {
              invitacionAProyecto = invitacionesTecnico[i];
            }
          }

          for (let i = 0; i < notificacionesTecnico.length; i++) {
            if (notificacionesTecnico[i].id == data.idInvitacion) {
              notificacion = notificacionesTecnico[i];
            }
          }

          if (invitacionAProyecto != null) {
            promises.push(
              db.doc(`usuarios/${req.user.uid}`).update({
                invitacionesProyectos: admin.firestore.FieldValue.arrayRemove(invitacionAProyecto),
                notificaciones: admin.firestore.FieldValue.arrayRemove(notificacion),
              })
            );
          }

          Promise.all(promises)
            .then(() => {
              return res.status(200).json("Invitación eliminada.");
            })
            .catch((error) => {
              return res.status(500).json({Error: error});
            });
        })
        .catch((error) => {
          return res.status(404).json({Error: error});
        });
    })
    .catch((error) => {
      return res.status(404).json({Error: error});
    });
});

// Genera Ids para Firestore
function autoId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let autoId = "";
  while (autoId.length < 20) {
    const bytes = randomBytes(40);
    bytes.forEach((b) => {
      // Length of `chars` is 62. We only take bytes between 0 and 62*4-1
      // (both inclusive). The value is then evenly mapped to indices of `char`
      // via a modulo operation.
      const maxValue = 62 * 4 - 1;
      if (autoId.length < 20 && b <= maxValue) {
        autoId += chars.charAt(b % 62);
      }
    });
  }
  return autoId;
}
