export interface NotificacionPort {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendPushNotification(userId: string, title: string, message: string): Promise<void>;
}