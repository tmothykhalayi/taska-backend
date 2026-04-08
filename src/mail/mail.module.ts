import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { join } from 'path';
import { existsSync } from 'fs';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Determine correct template directory for both dev and prod
        let templateDir = join(__dirname, 'templates');

        // In development, templates are in src/mail/templates
        const devTemplateDir = join(process.cwd(), 'src', 'mail', 'templates');
        if (existsSync(devTemplateDir)) {
          templateDir = devTemplateDir;
        }

        console.log(`Using template directory: ${templateDir}`);
        console.log(
          `Template directory exists: ${existsSync(templateDir)}`,
        );

        return {
          transport: {
            host: configService.get('MAIL_HOST', 'smtp.gmail.com'),
            port: configService.get('MAIL_PORT', 465),
            secure: true,
            auth: {
              user: configService.get('MAIL_USER'),
              pass: configService.get('MAIL_PASSWORD'),
            },
          },
          defaults: {
            from: `"Taska" <${configService.get('MAIL_USER')}>`,
          },
          template: {
            dir: templateDir,
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
