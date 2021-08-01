import * as express from "express";
import * as admin from "firebase-admin";
import * as formidable from "formidable-serverless";
import * as fs from "fs";
import {randomBytes} from "crypto";
import {v4 as uuidv4} from "uuid";
import {db, bucket} from "./index";
import {mailTransport} from "./mail";
import {NotificacionNuevoProyecto} from "./notificaciones";

("use strict");

// Proyecto Interface
export interface Proyecto {
  datos: {
    cuit: string;
    direccion: string;
    director: string;
    email: string;
    nombre: string;
    productora: string;
    razonSocial: string;
    sigla: string;
  };
  foto: string;
  inicioRodaje: Date;
  finRodaje: Date;
  logoProductora: string;
  tecnicosInvitados: Array<any>;
  tipoProyecto: string;
}

// Proyectos Router
export const proyectosRouter = express.Router();

// Post Proyecto nuevo
proyectosRouter.post("", (req: any, res: any, next) => {
  db.doc(`usuarios/${req.user.uid}`)
    .get()
    .then((doc) => {
      if (!doc.data()!.isProductora) {
        return res.status(403).json({Error: "Unauthorized"});
      } else {
        const mailProductora = doc.data()!.datos.email;

        const form = new formidable.IncomingForm();

        form.parse(req, async function (error, fields, files) {
          if (error) {
            next(error);
            return res.status(400).json({Error: error});
          }

          const data = JSON.parse(fields.data);
          const promises: Array<any> = [];
          const idProyecto = autoId();
          var publicPortadaPath: any = null;
          var publicLogoPath: any = null;
          var nuevoProyecto: Proyecto = {
            datos: {
              cuit: "",
              direccion: "",
              director: "",
              email: "",
              nombre: "",
              productora: "",
              razonSocial: "",
              sigla: "",
            },
            foto: "",
            inicioRodaje: null,
            finRodaje: null,
            logoProductora: "",
            tecnicosInvitados: [],
            tipoProyecto: "",
          };
          var portadaPath: any = null;
          var logoPath: any = null;
          var uuidPortada: any = null;
          var uuidLogo: any = null;

          if ((files.portada && files.logo) || (files.portada && data.logoProductora != "")) {
            portadaPath = `proyectos/${idProyecto}/portada-proyecto.png`;
            logoPath = `proyectos/${idProyecto}/logo-productora-proyecto.png`;
            uuidPortada = uuidv4();
            uuidLogo = uuidv4();
            publicPortadaPath = createPersistentDownloadUrl(bucket.name, portadaPath, uuidPortada);
            publicLogoPath = createPersistentDownloadUrl(bucket.name, logoPath, uuidLogo);
            nuevoProyecto = {
              datos: {
                cuit: data.datos.cuit,
                direccion: data.datos.direccion,
                director: data.datos.director,
                email: mailProductora,
                nombre: data.datos.nombre,
                productora: data.datos.productora,
                razonSocial: data.datos.razonSocial,
                sigla: data.datos.sigla,
              },
              foto: publicPortadaPath,
              inicioRodaje: null,
              finRodaje: null,
              logoProductora: publicLogoPath,
              tecnicosInvitados: data.tecnicosInvitados,
              tipoProyecto: data.tipoProyecto,
            };
          } else if (files.portada) {
            portadaPath = `proyectos/${idProyecto}/portada-proyecto.png`;
            uuidPortada = uuidv4();
            publicPortadaPath = createPersistentDownloadUrl(bucket.name, portadaPath, uuidPortada);
            nuevoProyecto = {
              datos: {
                cuit: data.datos.cuit,
                direccion: data.datos.direccion,
                director: data.datos.director,
                email: mailProductora,
                nombre: data.datos.nombre,
                productora: data.datos.productora,
                razonSocial: data.datos.razonSocial,
                sigla: data.datos.sigla,
              },
              foto: publicPortadaPath,
              inicioRodaje: null,
              finRodaje: null,
              logoProductora: data.logoProductora,
              tecnicosInvitados: data.tecnicosInvitados,
              tipoProyecto: data.tipoProyecto,
            };
          } else if (files.logo || data.logoProductora != "") {
            logoPath = `proyectos/${idProyecto}/logo-productora-proyecto.png`;
            uuidLogo = uuidv4();
            publicLogoPath = createPersistentDownloadUrl(bucket.name, logoPath, uuidLogo);
            nuevoProyecto = {
              datos: {
                cuit: data.datos.cuit,
                direccion: data.datos.direccion,
                director: data.datos.director,
                email: mailProductora,
                nombre: data.datos.nombre,
                productora: data.datos.productora,
                razonSocial: data.datos.razonSocial,
                sigla: data.datos.sigla,
              },
              foto: "",
              inicioRodaje: null,
              finRodaje: null,
              logoProductora: publicLogoPath,
              tecnicosInvitados: data.tecnicosInvitados,
              tipoProyecto: data.tipoProyecto,
            };
          } else {
            nuevoProyecto = {
              datos: {
                cuit: data.datos.cuit,
                direccion: data.datos.direccion,
                director: data.datos.director,
                email: mailProductora,
                nombre: data.datos.nombre,
                productora: data.datos.productora,
                razonSocial: data.datos.razonSocial,
                sigla: data.datos.sigla,
              },
              foto: "",
              inicioRodaje: null,
              finRodaje: null,
              logoProductora: "",
              tecnicosInvitados: data.tecnicosInvitados,
              tipoProyecto: data.tipoProyecto,
            };
          }

          const muestraProyecto = {
            director: nuevoProyecto.datos.director,
            idProyecto: idProyecto,
            nombre: nuevoProyecto.datos.nombre,
            productora: nuevoProyecto.datos.productora,
            tipoProyecto: nuevoProyecto.tipoProyecto,
            foto: nuevoProyecto.foto,
          };

          data.tecnicosInvitados.forEach(async (tecnico) => {
            const snapshotUsuario = await db.collection("usuarios").where("datos.email", "==", tecnico.email).get();

            const idInvitacion = autoId();

            const invitacionAProyecto = Object.assign({idInvitacion: idInvitacion}, muestraProyecto);

            const notificacion = new NotificacionNuevoProyecto(idInvitacion);

            if (!snapshotUsuario.empty) {
              promises.push(
                db
                  .doc(`usuarios/${snapshotUsuario.docs[0].id}`)
                  .update({
                    invitacionesProyectos: admin.firestore.FieldValue.arrayUnion(invitacionAProyecto),
                    notificaciones: admin.firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(notificacion))),
                  })
              );
            } else {
              const snapshotTecnicoInvitado = await db.collection("tecnicosInvitados").where("email", "==", tecnico.email).get();

              if (!snapshotTecnicoInvitado.empty) {
                promises.push(
                  db
                    .doc(`tecnicosInvitados/${snapshotTecnicoInvitado.docs[0].id}`)
                    .update({
                      proyectos: admin.firestore.FieldValue.arrayUnion(invitacionAProyecto),
                      notificaciones: admin.firestore.FieldValue.arrayUnion(JSON.parse(JSON.stringify(notificacion))),
                    })
                );
              } else {
                const tecnicoInvitado = {
                  email: tecnico.email,
                  proyectos: [invitacionAProyecto],
                  notificaciones: [JSON.parse(JSON.stringify(notificacion))],
                };

                promises.push(db.collection("tecnicosInvitados").add(tecnicoInvitado));
              }
            }

            const mailOptions = {
              from: `${nuevoProyecto.datos.sigla} | ${nuevoProyecto.datos.productora} <${nuevoProyecto.datos.email}>`,
              to: tecnico.email,
              subject: `Invitación al proyecto: "${nuevoProyecto.datos.nombre}" de ${nuevoProyecto.datos.productora}`,
              html: `<p style="font-size: 16px;">¡Hola! Fuiste invitadx a participar en el nuevo proyecto de 
                ${nuevoProyecto.datos.productora}: "${nuevoProyecto.datos.nombre}".<br>
                Hacé click en este <a href="https://colmena-cac87.web.app/ingreso">link</a> para aceptar y empezar a utilizar Colmena.</p>`,
            };

            promises.push(mailTransport.sendMail(mailOptions));
          });

          if (files.portada) {
            promises.push(
              bucket.upload(files.portada.path, {
                destination: portadaPath,
                metadata: {
                  metadata: {
                    firebaseStorageDownloadTokens: uuidPortada,
                  },
                },
              })
            );
          }

          if (files.logo) {
            promises.push(
              bucket.upload(files.logo.path, {
                destination: logoPath,
                metadata: {
                  metadata: {
                    firebaseStorageDownloadTokens: uuidLogo,
                  },
                },
              })
            );
          }

          if (!files.logo && data.logoProductora != "") {
            promises.push(
              bucket.file(`usuarios/${req.user.uid}/logo-productora.png`).copy(logoPath, (errnullable, copiedFile, apiResponse) => {
                copiedFile.setMetadata({
                  metadata: {
                    metadata: {
                      firebaseStorageDownloadTokens: uuidLogo,
                    },
                  },
                });
              })
            );
          }

          promises.push(db.doc(`proyectos/${idProyecto}`).set(nuevoProyecto));

          promises.push(db.doc(`usuarios/${req.user.uid}`).update({proyectos: admin.firestore.FieldValue.arrayUnion(muestraProyecto)}));

          Promise.all(promises)
            .then(() => {
              if (files.portada) {
                fs.unlinkSync(files.portada.path);
              }
              if (files.logo) {
                fs.unlinkSync(files.logo.path);
              }
              return res.status(201).json({
                id: idProyecto,
                portada: nuevoProyecto.foto,
                logo: nuevoProyecto.logoProductora,
              });
            })
            .catch((error) => {
              return res.status(500).json({Error: error});
            });
        });
      }
    })
    .catch((error) => {
      return res.status(404).json({Error: error});
    });
});

// Crea la direccion de descarga
const createPersistentDownloadUrl = (bucket, pathToFile, downloadToken) => {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(pathToFile)}?alt=media&token=${downloadToken}`;
};

// Genera Ids para Firestore y Storage
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
