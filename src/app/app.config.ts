import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import {
  DeleteOutline,
  EditOutline,
  FormOutline,
  LockOutline,
  MailOutline,
  PlusOutline,
  SearchOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNzI18n(en_US),
    provideNzIcons([
      UserOutline,
      LockOutline,
      MailOutline,
      SearchOutline,
      PlusOutline,
      FormOutline,
      EditOutline,
      DeleteOutline,
    ]),
    provideAnimationsAsync(),
    provideHttpClient()
  ]
};
