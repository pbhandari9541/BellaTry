import React from 'react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Link } from '@/components/ui/Link'

export default function DemoPage() {
  const t = useTranslations('TestPage')

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex justify-end mb-8">
          <LanguageSwitcher />
        </div>
        <h1 className="text-4xl font-bold text-center mb-8">
          {t('title')}
        </h1>
        <p className="text-center mb-4">
          {t('description')}
        </p>
      </div>
      {/* Button Variant Showcase */}
      <div className="flex flex-wrap gap-4 justify-center items-center my-8">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
      {/* Link Variant Showcase */}
      <div className="flex flex-wrap gap-4 justify-center items-center my-8">
        <Link href="#" variant="primary">Primary Link</Link>
        <Link href="#" variant="secondary">Secondary Link</Link>
        <Link href="#" variant="destructive">Destructive Link</Link>
        <Link href="#" variant="muted">Muted Link</Link>
        <Link href="#" variant="primary" underline>Primary Underline</Link>
        <Link href="#" variant="button">Button Link</Link>
      </div>
    </main>
  )
} 