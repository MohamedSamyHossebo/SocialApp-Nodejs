import firebaseapp from "./notification.config";
export class NotificationService {
  async sendNotfication({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }) {
    const msg = {
      token,
      data,
    };
    return await firebaseapp.messaging().send(msg);
  }

  async sendNotfications({
    tokens,
    data,
  }: {
    tokens: string[];
    data: { title: string; body: string };
  }) {
    const msg = {
      tokens,
      data,
    };
    return await Promise.allSettled(
      tokens.map((token) => {
        return this.sendNotfication({ token, data });
      }),
    );
  }
}
export const notification = new NotificationService();
