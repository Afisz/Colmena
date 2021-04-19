import * as functions from "firebase-functions";
import * as express from "express";
import * as formidable from "formidable-serverless";
import * as fs from "fs";
import {v4 as uuidv4} from "uuid";
import {db, bucket} from "./index";
import {Tarea} from "./tarea";

("use strict");

export interface Tecnico {
  consentimientoDatos: boolean;
  datos: {
    apellido: string;
    codigoArea: string;
    cuil: string;
    datosBancarios: {
      banco: string;
      cbu: string;
      numeroCuenta: string;
      tipoCuenta: string;
    };
    direccion: string;
    dni: string;
    email?: string;
    fechaNacimiento: string;
    nacionalidad: string;
    nombre?: string;
    obraSocial: string;
    sat: boolean;
    sica: boolean;
    telefono: string;
  };
  foto?: string;
  invitacionesProyectos: Array<any>;
  isProductora: boolean;
  isTecnico: boolean;
  nuevoUsuario: boolean;
  proyectos: Array<any>;
  tareas: Array<Tarea>;
}

export interface Productora {
  consentimientoDatos: boolean;
  datos: {
    codigoArea: string;
    cuit: string;
    direccion: string;
    email: string;
    nombre: string;
    razonSocial: string;
    telefono: string;
  };
  foto: string;
  isProductora: boolean;
  isTecnico: boolean;
  nuevoUsuario: boolean;
  proyectos: Array<any>;
  tareas: Array<Tarea>;
}

export const usuariosRouter = express.Router();

// Crea un nuevo tecnico con el primer logueo de Google
export const creacionTecnico = functions.auth.user().onCreate((user) => {
  const nuevoTecnico: Tecnico = {
    consentimientoDatos: false,
    datos: {
      apellido: "",
      codigoArea: "",
      cuil: "",
      datosBancarios: {
        banco: "",
        cbu: "",
        numeroCuenta: "",
        tipoCuenta: "",
      },
      direccion: "",
      dni: "",
      email: user.email,
      fechaNacimiento: "",
      nacionalidad: "",
      nombre: "",
      obraSocial: "",
      sat: false,
      sica: false,
      telefono: "",
    },
    foto: user.photoURL,
    invitacionesProyectos: [],
    isProductora: false,
    isTecnico: true,
    nuevoUsuario: true,
    proyectos: [],
    tareas: [],
  };
  return db.doc("usuarios/" + user.uid).set(nuevoTecnico);
});

// Get Inicio - Mis Datos
usuariosRouter.get("/:id", (req: any, res: any) => {
  if (req.user.uid !== req.params.id) {
    return res.status(403).json({Error: "Unauthorized"});
  }
  db.doc("usuarios/" + req.user.uid)
    .get()
    .then((doc) => {
      return res.status(200).json(doc.data());
    })
    .catch((error) => {
      return res.status(404).json({Error: error});
    });
});

// Put Mis Datos
usuariosRouter.put("/:id", (req: any, res: any, next) => {
  if (req.user.uid !== req.params.id) {
    return res.status(403).json({Error: "Unauthorized"});
  }

  const form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    if (error) {
      next(error);
      return res.status(400).json({Error: error});
    }

    const data = JSON.parse(fields.data);
    var publicImagePath = "";

    if (files.imagen) {
      const imagePath = "usuarios/" + req.user.uid + "/" + files.imagen.name;
      const uuid = uuidv4();

      bucket
        .upload(files.imagen.path, {
          destination: imagePath,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: uuid,
            },
          },
        })
        .then(() => {
          fs.unlinkSync(files.imagen.path);
          publicImagePath = createPersistentDownloadUrl(bucket.name, imagePath, uuid);

          if (data.isTecnico) {
            return db
              .doc("usuarios/" + req.user.uid)
              .update({
                "consentimientoDatos": data.consentimientoDatos,
                "datos.apellido": data.datos.apellido,
                "datos.telefono": data.datos.telefono,
                "datos.codigoArea": data.datos.codigoArea,
                "datos.cuil": data.datos.cuil,
                "datos.datosBancarios.banco": data.datos.datosBancarios.banco,
                "datos.datosBancarios.cbu": data.datos.datosBancarios.cbu,
                "datos.datosBancarios.numeroCuenta": data.datos.datosBancarios.numeroCuenta,
                "datos.datosBancarios.tipoCuenta": data.datos.datosBancarios.tipoCuenta,
                "datos.direccion": data.datos.direccion,
                "datos.dni": data.datos.dni,
                "datos.fechaNacimiento": data.datos.fechaNacimiento,
                "datos.nacionalidad": data.datos.nacionalidad,
                "datos.nombre": data.datos.nombre,
                "datos.obraSocial": data.datos.obraSocial,
                "datos.sat": data.datos.sat,
                "datos.sica": data.datos.sica,
                "foto": publicImagePath,
                "nuevoUsuario": data.nuevoUsuario,
              })
              .then(() => {
                return res.status(200).json({
                  id: req.params.id,
                  img: publicImagePath,
                });
              })
              .catch((error) => {
                fs.unlinkSync(files.imagen.path);
                return res.status(500).json({Error: error});
              });
          } else if (data.isProductora) {
            return db
              .doc("usuarios/" + req.user.uid)
              .update({
                "consentimientoDatos": data.consentimientoDatos,
                "datos.telefono": data.datos.telefono,
                "datos.codigoArea": data.datos.codigoArea,
                "datos.cuit": data.datos.cuit,
                "datos.direccion": data.datos.direccion,
                "datos.nombre": data.datos.nombre,
                "datos.razonSocial": data.datos.razonSocial,
                "foto": publicImagePath,
                "nuevoUsuario": data.nuevoUsuario,
              })
              .then(() => {
                return res.status(200).json({
                  id: req.params.id,
                  img: publicImagePath,
                });
              })
              .catch((error) => {
                fs.unlinkSync(files.imagen.path);
                return res.status(500).json({Error: error});
              });
          } else {
            return res.status(404).json({Error: "Foto cargada pero usuario no encontrado."});
          }
        })
        .catch((error) => {
          fs.unlinkSync(files.imagen.path);
          return res.status(500).json({Error: error});
        });
    } else {
      if (data.isTecnico) {
        return db
          .doc("usuarios/" + req.user.uid)
          .update({
            "consentimientoDatos": data.consentimientoDatos,
            "datos.apellido": data.datos.apellido,
            "datos.telefono": data.datos.telefono,
            "datos.codigoArea": data.datos.codigoArea,
            "datos.cuil": data.datos.cuil,
            "datos.datosBancarios.banco": data.datos.datosBancarios.banco,
            "datos.datosBancarios.cbu": data.datos.datosBancarios.cbu,
            "datos.datosBancarios.numeroCuenta": data.datos.datosBancarios.numeroCuenta,
            "datos.datosBancarios.tipoCuenta": data.datos.datosBancarios.tipoCuenta,
            "datos.direccion": data.datos.direccion,
            "datos.dni": data.datos.dni,
            "datos.fechaNacimiento": data.datos.fechaNacimiento,
            "datos.nacionalidad": data.datos.nacionalidad,
            "datos.nombre": data.datos.nombre,
            "datos.obraSocial": data.datos.obraSocial,
            "datos.sat": data.datos.sat,
            "datos.sica": data.datos.sica,
            "nuevoUsuario": data.nuevoUsuario,
          })
          .then(() => {
            return res.status(200).json({id: req.params.id});
          })
          .catch((error) => {
            return res.status(500).json({Error: error});
          });
      } else if (data.isProductora) {
        return db
          .doc("usuarios/" + req.user.uid)
          .update({
            "consentimientoDatos": data.consentimientoDatos,
            "datos.telefono": data.datos.telefono,
            "datos.codigoArea": data.datos.codigoArea,
            "datos.cuit": data.datos.cuit,
            "datos.direccion": data.datos.direccion,
            "datos.nombre": data.datos.nombre,
            "datos.razonSocial": data.datos.razonSocial,
            "nuevoUsuario": data.nuevoUsuario,
          })
          .then(() => {
            return res.status(200).json({id: req.params.id});
          })
          .catch((error) => {
            return res.status(500).json({Error: error});
          });
      } else {
        return res.status(404).json({Error: "Usuario no encontrado"});
      }
    }
  });
});

// Crea la direccion de descarga
const createPersistentDownloadUrl = (bucket, pathToFile, downloadToken) => {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(pathToFile)}?alt=media&token=${downloadToken}`;
};
