import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CaptchaService {
  constructor(private readonly config: ConfigService) {}

  async verificar(token: string): Promise<void> {
    const secret = this.config.get<string>('RECAPTCHA_SECRET_KEY');

    const respuesta = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: secret as string, response: token }),
      },
    );

    const data = (await respuesta.json()) as { success: boolean };

    if (!data.success) {
      throw new BadRequestException('CAPTCHA inválido, intenta de nuevo');
    }
  }
}