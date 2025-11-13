import { Injectable } from '@nestjs/common';
import { NotificacionPort } from '../../../dominio/ports/services/notificaciones.port';

@Injectable()
export class EmailService implements NotificacionPort {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Implementar envío de email con Nodemailer/SendGrid
    console.log(`Sending email to ${to}: ${subject}`);
  }

  async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    // Implementar push notification con Firebase FCM
    console.log(`Sending push to ${userId}: ${title} - ${message}`);
  }
}