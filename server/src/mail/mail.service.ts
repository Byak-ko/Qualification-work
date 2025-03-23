import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
    try {
      await this.transporter.sendMail({
        from: `"Support" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });
      return { message: "Лист успішно надіслано" };
    } catch (error) {
      console.error("Помилка відправки email:", error);
      throw new Error("Не вдалося надіслати лист");
    }
  }
}
