import * as nodemailer from "nodemailer";

// Configuración del Mail Transport
export const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "plataformacolmena@gmail.com",
    pass: "Senillosayrosario4",
  },
});
