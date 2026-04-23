import { EventEmitter } from "node:events";
import {
  sendEmail,
  emailSubject,
  emailHTML,
  emailText,
} from "../email/mail.utils.js";
import Mail from "nodemailer/lib/mailer/index.js";

export const emailEmitter = new EventEmitter();
interface IEmail extends Mail.Options {
  otp: string;
  userName: string;
  email: string;
  name: string;
  message: string;
}

emailEmitter.on("confirmEmail", async (data: IEmail) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.confirmEmail,
    text: emailText.confirmEmail(data.otp),
    html: emailHTML.confirmEmail(data.otp),
  }).catch((err) => {
    console.log(err);
  });
});

emailEmitter.on("confirmEmailSuccess", async (data: IEmail) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.confirmEmailSuccess,
    text: emailText.confirmEmailSuccess(data.name),
    html: emailHTML.confirmEmailSuccess(data.name),
  }).catch((err) => {
    console.log(err);
  });
});
emailEmitter.on("forgetPassword", async (data: IEmail) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.forgetPassword,
    text: emailText.forgetPassword(data.otp),
    html: emailHTML.forgetPassword(data.otp),
  }).catch((err) => {
    console.log(err);
  });
});
emailEmitter.on("resetPassword", async (data: IEmail) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.resetPassword,
    text: emailText.resetPassword(data.name),
    html: emailHTML.resetPassword(data.name),
  }).catch((err) => {
    console.log(err);
  });
});
emailEmitter.on("changePassword", async (data: IEmail) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.changePassword,
    text: emailText.changePassword(data.name),
    html: emailHTML.changePassword(data.name),
  }).catch((err) => {
    console.log(err);
  });
});

emailEmitter.on("welcome", async (data: IEmail) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.welcome,
    text: emailText.welcome(data.name),
    html: emailHTML.welcome(data.name),
  }).catch((err) => {
    console.log(err);
  });
});

emailEmitter.on("contactUs", async (data: IEmail) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.contactUs,
    text: emailText.contactUs(data.name, data.email, data.message),
    html: emailHTML.contactUs(data.name, data.email, data.message),
  }).catch((err) => {
    console.log(err);
  });
});
