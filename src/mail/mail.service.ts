import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: Number(this.config.get<string>('SMTP_PORT')),
      secure: false, // true solo si usas el puerto 465
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async enviarCorreoRecuperacion(destino: string, urlReset: string): Promise<void> {
    const info = await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM') ?? 'Daemon Fitness <no-reply@daemonfitness.com>',
      to: destino,
      subject: 'Recuperación de contraseña - Daemon Fitness',
      html: `
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="${urlReset}">Haz click aquí para crear una nueva contraseña</a></p>
        <p>Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
      `,
    });

    // Con Ethereal (SMTP de pruebas), esto imprime un link para VER el correo
    // enviado en un navegador, sin necesitar una bandeja de entrada real.
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log('Vista previa del correo (Ethereal):', preview);
    }
  }
}