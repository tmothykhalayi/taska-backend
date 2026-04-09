import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { join } from 'path';
import { resolve4 } from 'node:dns/promises';
import { isIP } from 'node:net';
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mailHost = configService.get<string>('MAIL_HOST', 'smtp.gmail.com');
        const mailPort = Number(configService.get('MAIL_PORT', 465));
        const secureByPort = mailPort === 465;
        const mailSecure =
          configService.get<string>('MAIL_SECURE', secureByPort ? 'true' : 'false') ===
          'true';
        const mailEnabled = configService.get<string>('MAIL_ENABLED', 'true') === 'true';
        const forceIpv4 = configService.get<string>('MAIL_FORCE_IPV4', 'true') === 'true';

        let smtpHost = mailHost;
        if (mailEnabled && forceIpv4 && isIP(mailHost) !== 4) {
          try {
            const ipv4Addresses = await resolve4(mailHost);
            if (ipv4Addresses.length > 0) {
              smtpHost = ipv4Addresses[0];
            }
          } catch {
            smtpHost = mailHost;
          }
        }

        return {
          transport: mailEnabled
            ? {
                host: smtpHost,
                port: mailPort,
                secure: mailSecure,
                family: 4,
                requireTLS: !mailSecure,
                connectionTimeout: Number(
                  configService.get('MAIL_CONNECTION_TIMEOUT', 10000),
                ),
                greetingTimeout: Number(
                  configService.get('MAIL_GREETING_TIMEOUT', 10000),
                ),
                socketTimeout: Number(configService.get('MAIL_SOCKET_TIMEOUT', 15000)),
                tls: {
                  servername: mailHost,
                },
                auth: {
                  user: configService.get('MAIL_USER'),
                  pass: configService.get('MAIL_PASSWORD'),
                },
              }
            : {
                jsonTransport: true,
              },
          defaults: {
            from: `"Taska" <${configService.get('MAIL_USER')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}