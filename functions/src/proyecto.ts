import * as express from "express";
import * as admin from "firebase-admin";
import * as formidable from "formidable-serverless";
import * as fs from "fs";
import {randomBytes} from "crypto";
import {v4 as uuidv4} from "uuid";
import {db, bucket} from "./index";
import {mailTransport} from "./mail";

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
  logoProductora: string;
  tecnicos: Array<any>;
  tecnicosInvitados: Array<any>;
  tipoProyecto: string;
}

// Proyecto Router
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
          var publicPortadaPath: any = null;
          var publicLogoPath: any = null;
          const promises: Array<any> = [];
          const idProyecto = autoId();

          if (files.portada && files.logo) {
            const portadaPath = `proyectos/${idProyecto}/${files.portada.name}`;
            const logoPath = `proyectos/${idProyecto}/${files.logo.name}`;
            const uuidPortada = uuidv4();
            const uuidLogo = uuidv4();
            publicPortadaPath = createPersistentDownloadUrl(bucket.name, portadaPath, uuidPortada);
            publicLogoPath = createPersistentDownloadUrl(bucket.name, logoPath, uuidLogo);
            const nuevoProyecto: Proyecto = {
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
              logoProductora: publicLogoPath,
              tecnicos: [],
              tecnicosInvitados: data.tecnicosInvitados,
              tipoProyecto: data.tipoProyecto,
            };
            const muestraProyecto = {
              director: nuevoProyecto.datos.director,
              id: idProyecto,
              nombre: nuevoProyecto.datos.nombre,
              productora: nuevoProyecto.datos.productora,
              tipoProyecto: nuevoProyecto.tipoProyecto,
              foto: nuevoProyecto.foto,
            };

            data.tecnicosInvitados.forEach(async (tecnico) => {
              const snapshotUsuario = await db.collection("usuarios").where("datos.email", "==", tecnico.email).get();

              if (!snapshotUsuario.empty) {
                promises.push(
                  db.doc(`usuarios/${snapshotUsuario.docs[0].id}`)
                  .update({invitacionesProyectos: admin.firestore.FieldValue.arrayUnion(muestraProyecto)})
                );
              } else {
                const snapshotTecnicoInvitado = await db.collection("tecnicosInvitados").where("email", "==", tecnico.email).get();

                if (!snapshotTecnicoInvitado.empty) {
                  promises.push(
                    db
                      .doc(`tecnicosInvitados/${snapshotTecnicoInvitado.docs[0].id}`)
                      .update({proyectos: admin.firestore.FieldValue.arrayUnion(muestraProyecto)})
                  );
                } else {
                  const tecnicoInvitado = {
                    email: tecnico.email,
                    proyectos: [muestraProyecto],
                  };

                  promises.push(db.collection("tecnicosInvitados").add(tecnicoInvitado));
                }
              }

              const mailOptions = {
                from: `${nuevoProyecto.datos.sigla} | ${nuevoProyecto.datos.productora} <${nuevoProyecto.datos.email}>`,
                to: tecnico.email,
                subject: `Invitación al proyecto: "${nuevoProyecto.datos.nombre}" de ${nuevoProyecto.datos.productora}`,
                html: `<p style="font-size: 16px;">¡Hola! Fuiste invitado/a a participar en el nuevo proyecto de 
                ${nuevoProyecto.datos.productora}: "${nuevoProyecto.datos.nombre}".<br>
                Hacé click en este <a href="https://colmena-cac87.web.app/ingreso">link</a> para aceptar y empezar a utilizar Colmena.</p>`,
              };

              promises.push(mailTransport.sendMail(mailOptions));
            });

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

            promises.push(db.doc(`proyectos/${idProyecto}`).set(nuevoProyecto));

            promises.push(db.doc(`usuarios/${req.user.uid}`).update({proyectos: admin.firestore.FieldValue.arrayUnion(muestraProyecto)}));

            Promise.all(promises)
              .then(() => {
                fs.unlinkSync(files.portada.path);
                fs.unlinkSync(files.logo.path);
                return res.status(201).json({
                  id: idProyecto,
                  portada: publicPortadaPath,
                  logo: publicLogoPath,
                });
              })
              .catch((error) => {
                return res.status(500).json({Error: error});
              });
          } else {
            return res.status(400).json({Error: error});
          }
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
