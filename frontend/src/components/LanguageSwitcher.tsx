'use client';

import React from 'react';
import {useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale});
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">Language:</span>
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="bg-background border border-border rounded-md px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc === 'en' ? 'English' : 'नेपाली'}
          </option>
        ))}
      </select>
    </div>
  );
} 