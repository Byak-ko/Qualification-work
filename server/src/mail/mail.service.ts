import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { User } from "../entities/user.entity";
import { Rating } from "../entities/rating.entity";
import { RatingParticipant } from "../entities/rating-participant.entity";

interface FailedEmail {
  name?: string;
  email?: string;
  reason: string;
}

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

  async sendRatingNotification(rating: Rating, respondents: User[]) {
    const failedEmails: FailedEmail[] = [];
    const successEmails: string[] = [];
    for (const respondent of respondents) {
      if (!respondent.email) {
        failedEmails.push({
          name: respondent.firstName || `ID: ${respondent.id}`,
          reason: 'Відсутня електронна адреса'
        });
        continue;
      }
      const subject = `Призначено новий рейтинг: ${rating.title}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Вам призначено новий рейтинг</h2>
          <p>Шановний(а) ${respondent.firstName || 'користувач'},</p>
          <p>Вам призначено новий рейтинг для заповнення: <strong>${rating.title}</strong></p>
          <p>Тип рейтингу: ${rating.type}</p>
          <p>Автор рейтингу: ${rating.author?.firstName || 'Адміністратор'}</p>
         
          <p>Будь ласка, перейдіть на сайт для заповнення рейтингу.</p>
         
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/ratings/${rating.id}/fill"
               style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
              Перейти до заповнення рейтингу
            </a>
          </div>
         
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Це автоматичне повідомлення, будь ласка, не відповідайте на нього.
          </p>
        </div>
      `;
      try {
        await this.sendMail({
          to: respondent.email,
          subject,
          html
        });
        successEmails.push(respondent.email);
      } catch (error) {
        failedEmails.push({
          email: respondent.email,
          reason: error.message
        });
      }
    }
    return {
      success: successEmails.length,
      failed: failedEmails.length,
      failedDetails: failedEmails,
      message: `Успішно відправлено: ${successEmails.length}, Не вдалось відправити: ${failedEmails.length}`
    };
  }

  async sendReviewerNotification(participant: RatingParticipant): Promise<{ success: boolean; message: string }> {
    let reviewer: User | undefined = undefined;
    let reviewerType = '';

    if (participant.departmentReviewer) {
      reviewer = participant.departmentReviewer;
      reviewerType = 'кафедри';
    } else if (participant.unitReviewer) {
      reviewer = participant.unitReviewer;
      reviewerType = 'підрозділу';
    } else if (participant.rating.author) {
      reviewer = participant.rating.author;
      reviewerType = 'рейтингу';
    }

    if (!reviewer || !reviewer.email) {
      return {
        success: false,
        message: 'Не вдалося знайти контактну інформацію перевіряючих для надсилання сповіщення'
      };
    }

    const respondent = participant.respondent;

    const subject = `Рейтинг заповнено: ${participant.rating.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Заповнено рейтинг, що потребує перевірки</h2>
        <p>Шановний(а) ${reviewer.firstName || 'перевіряючий'},</p>
        <p>Користувач ${respondent?.firstName || `ID: ${respondent?.id || 'невідомий'}`} заповнив рейтинг <strong>${participant.rating.title}</strong>, який очікує вашої перевірки.</p>
        <p>Ви отримали це повідомлення як перевіряючий ${reviewerType}.</p>
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/ratings/${participant.rating.id}/review/${participant.id}"
             style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            Перейти до перевірки рейтингу
          </a>
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Це автоматичне повідомлення, будь ласка, не відповідайте на нього.
          </p>
      </div>
    `;

    try {
      await this.sendMail({
        to: reviewer.email,
        subject,
        html
      });
      return {
        success: true,
        message: `Сповіщення надіслано перевіряючому ${reviewerType}: ${reviewer.email}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Помилка відправки сповіщення перевіряючому: ${error.message}`
      };
    }
  }

  async sendNextReviewerNotification(participant: RatingParticipant, nextReviewer: User): Promise<{ success: boolean; message: string }> {

    const subject = `Рейтинг очікує вашої перевірки: ${participant.rating.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Рейтинг очікує вашої перевірки</h2>
        <p>Шановний(а) ${nextReviewer.firstName || 'перевіряючий'},</p>
        <p>Рейтинг <strong>${participant.rating.title}</strong> користувача ${participant.respondent.firstName || ''} ${participant.respondent.lastName || ''} 
           був схвалений попереднім перевіряючим та очікує вашої перевірки як перевіряючого.</p>
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/ratings/${participant.rating.id}/review/${participant.id}"
             style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            Перейти до перевірки рейтингу
          </a>
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Це автоматичне повідомлення, будь ласка, не відповідайте на нього.
        </p>
      </div>
    `;

    try {
      await this.sendMail({
        to: nextReviewer.email,
        subject,
        html
      });
      return {
        success: true,
        message: `Сповіщення надіслано перевіряючому: ${nextReviewer.email}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Помилка відправки сповіщення перевіряючому: ${error.message}`
      };
    }
  }

  async sendRatingApprovedNotification(participant: RatingParticipant): Promise<{ success: boolean; message: string }> {
    const subject = `Ваш рейтинг затверджено: ${participant.rating.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Ваш рейтинг затверджено</h2>
        <p>Шановний(а) ${participant.respondent.firstName || 'користувач'},</p>
        <p>Ваш рейтинг <strong>${participant.rating.title}</strong> успішно пройшов усі рівні перевірки та був затверджений.</p>
        <p>Дякуємо за вашу роботу!</p>
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/ratings/${participant.rating.id}"
             style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            Переглянути рейтинг
          </a>
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Це автоматичне повідомлення, будь ласка, не відповідайте на нього.
        </p>
      </div>
    `;

    try {
      await this.sendMail({
        to: participant.respondent.email,
        subject,
        html
      });
      return {
        success: true,
        message: `Сповіщення про затвердження рейтингу надіслано: ${participant.respondent.email}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Помилка відправки сповіщення про затвердження: ${error.message}`
      };
    }
  }

  async sendRevisionRequiredNotification(participant: RatingParticipant, reviewer: User): Promise<{ success: boolean; message: string }> {
    const subject = `Рейтинг повернено на доопрацювання: ${participant.rating.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Рейтинг повернено на доопрацювання</h2>
        <p>Шановний(а) ${participant.respondent.firstName || 'користувач'},</p>
        <p>Ваш рейтинг <strong>${participant.rating.title}</strong> був повернутий на доопрацювання 
           рецензентом ${reviewer.firstName || ''} ${reviewer.lastName || ''}.</p>
        
        <p>Будь ласка, внесіть необхідні зміни та відправте рейтинг на повторну перевірку.</p>
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/ratings/${participant.rating.id}/fill"
             style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            Перейти до редагування рейтингу
          </a>
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Це автоматичне повідомлення, будь ласка, не відповідайте на нього.
        </p>
      </div>
    `;

    try {
      await this.sendMail({
        to: participant.respondent.email,
        subject,
        html
      });
      return {
        success: true,
        message: `Сповіщення про необхідність доопрацювання надіслано: ${participant.respondent.email}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Помилка відправки сповіщення про доопрацювання: ${error.message}`
      };
    }
  }

}