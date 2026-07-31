import { Link } from 'react-router'
import {
  Button,
  Card,
  SegmentedToggle,
  BalanceHeader,
  ReferralBanner,
  FAQAccordion,
  Avatar,
} from '@/components'
import { useTheme } from '@/context/ThemeProvider'
import { useDevSeedStore } from '@/stores/devSeedStore'
import { getPresetSwatch, type AppearancePreset } from '@/lib/themes'

const FAQ_ITEMS = [
  {
    question: 'What is DUBL?',
    answer:
      'Pay, send, and optionally flip eligible purchases for up to 2× back in Balance.',
  },
  {
    question: 'How does Available Credit work?',
    answer:
      'Connect a bank to unlock $500 starting Double Credit in test mode.',
  },
  {
    question: 'What does Double do?',
    answer:
      'After you pay, flip for a chance at bonus Balance. Losses may debit credit or linked bank per your agreement.',
  },
  {
    question: 'Is my money safe?',
    answer:
      'Demo environment; production uses bank-grade encryption and compliance controls.',
  },
  {
    question: 'How do referrals work?',
    answer:
      'Share your link; when a friend qualifies, you each receive $50 bonus (mock credit in test).',
  },
]

const SWATCH_PRESETS = ['dark', 'light', 'brown', 'pink', 'teal-light'] as const

export function FoundationPage() {
  const { preset, setPreset, presetLabels } = useTheme()
  const { mockBalance, mockCredit, isTestAccount } = useDevSeedStore()

  return (
    <div className="mx-auto min-h-full max-w-lg px-4 pb-8 pt-6 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-label text-[var(--accent)]">Phase 0 Foundation</p>
          <h1 className="text-heading">DUBL</h1>
        </div>
        <Avatar initials="JD" />
      </header>

      <Card variant="elevated">
        <BalanceHeader
          totalBalance={mockBalance}
          availableCredit={mockCredit}
          isTestAccount={isTestAccount}
        />
      </Card>

      <section className="space-y-3">
        <h2 className="text-title">Appearance</h2>
        <SegmentedToggle
          options={[
            ...SWATCH_PRESETS.map((p) => ({ value: p as AppearancePreset, label: presetLabels[p] })),
            { value: 'system' as AppearancePreset, label: 'System' },
          ]}
          value={preset}
          onChange={setPreset}
          className="flex flex-wrap gap-1 w-full"
        />
        <div className="flex gap-2 pt-2">
          {SWATCH_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              aria-label={`Preview ${presetLabels[p]} theme`}
              onClick={() => setPreset(p)}
              className="h-8 w-8 rounded-full border-2 border-[var(--border)]"
              style={{ backgroundColor: getPresetSwatch(p) }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-title">UI Primitives</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <ReferralBanner onShare={() => navigator.clipboard.writeText('https://dubl.app/r/TEST')} />

      <FAQAccordion items={FAQ_ITEMS} />

      <Card className="space-y-3">
        <p className="text-body text-[var(--text-muted)]">
          Phase 0 complete: migrations, theme tokens, primitives, docs. Next: Auth & Shell (Phase 1).
        </p>
        <div className="flex gap-2">
          <Link to="/">
            <Button variant="outline" size="sm">
              Login (Phase 1)
            </Button>
          </Link>
        </div>
      </Card>

      <footer className="text-center text-caption text-[var(--text-muted)] pb-4">
        DUBL · Author: spidersw3b3 · Help · Terms · Privacy
      </footer>
    </div>
  )
}
