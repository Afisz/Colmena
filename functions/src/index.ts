import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import {usuariosRouter} from "./usuario";
import {tareasRouter} from "./tarea";
import {notificacionesRouter} from "./notificaciones";
import {proyectosRouter} from "./proyecto";
import {tecnicoProyectosRouter} from "./tecnicoProyecto";
import {globalesRouter} from "./globales";

"use strict";

// Initialize Firebase
admin.initializeApp();

// Initialize Express server
export const app = express();

// Initialize the database
export const db = admin.firestore();

// Initialize the Bucket
export const bucket = admin.storage().bucket("gs://colmena-cac87.appspot.com/");

// Express middleware that validates Firebase ID Token passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// When decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req: any, res: any, next: any) => {
  console.log("Check if request is authorized with Firebase ID token");

  if ((!req.headers.authorization || !req.headers.authorization.startsWith("Bearer "))) {
    console.error(
        "No Firebase ID token was passed as a Bearer token in the Authorization header.",
        "Make sure you authorize your request by providing the following HTTP header:",
        "Authorization: Bearer <Firebase ID Token> or by passing a '__session' cookie.");
    res.status(403).send("Unauthorized");
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    console.log("Found 'Authorization' header");
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    // No cookie
    res.status(403).send("Unauthorized");
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log("ID Token correctly decoded", decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error("Error while verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized");
    return;
  }
};

// Add the path to receive request and set json as bodyParser (process the body)
app.use(express.json());
app.use(express.urlencoded());
app.use(cors({origin: ["https://colmena-cac87.web.app", "https://colmena-cac87.firebaseapp.com", "http://localhost:5000"]}));
app.use(validateFirebaseIdToken);
app.use("/usuarios", usuariosRouter);
app.use("/tareas", tareasRouter);
app.use("/notificaciones", notificacionesRouter);
app.use("/proyectos", proyectosRouter);
app.use("/tecnicoProyectos", tecnicoProyectosRouter);
app.use("/globales", globalesRouter);

// Define Google Cloud Function name
export const webApi = functions.https.onRequest(app);

// Exports creacionTecnico function
exports.creacionTecnico = require("./usuario");
