import { useNavigate } from 'react-router'
import { Plus, ArrowDownLeft, ArrowRight, QrCode } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { AssetIcon } from '@/components/AssetIcon'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { CryptoActivityList } from '@/components/CryptoActivityList'
import { DataTable } from '@/components/DataTable'
import { IconCircleButton } from '@/components/IconCircleButton'
import { SegmentedToggle } from '@/components/SegmentedToggle'
import { TestAccountFlag } from '@/components/TestAccountFlag'
import { formatCrypto, formatUsd } from '@/lib/formatters'
import { cryptoToUsd } from '@/lib/crypto/rates'
import { useAuth } from '@/context/AuthProvider'
import { useCryptoHydration } from '@/hooks/useCryptoHydration'
import { useAppStore } from '@/stores/appStore'
import { useCryptoStore } from '@/stores/cryptoStore'

export function AccountsPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { accountsMode, setAccountsMode, banks } = useAppStore()
  const {
    wallets,
    transactions,
    selectedAsset,
    setSelectedAsset,
    getSelectedWallet,
    loading,
  } = useCryptoStore()

  useCryptoHydration()

  const totalCredit = banks.reduce((sum, b) => sum + b.limit, 0)
  const selectedWallet = getSelectedWallet()
  const totalCryptoUsd = wallets.reduce((sum, w) => sum + cryptoToUsd(w.balance, w.asset), 0)

  const openAddBank = () => navigate('/add-bank', { state: { from: '/accounts' } })
  const openAddWallet = () => navigate('/add-wallet', { state: { from: '/accounts' } })
  const openSend = () =>
    navigate('/send', { state: { from: '/accounts', asset: selectedAsset } })
  const openReceive = () =>
    navigate('/crypto/receive', { state: { from: '/accounts', asset: selectedAsset } })
  const openScan = () => navigate('/crypto/scan', { state: { from: '/accounts' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SegmentedToggle
          options={[
            { value: 'fiat' as const, label: 'Fiat' },
            { value: 'crypto' as const, label: 'Crypto' },
          ]}
          value={accountsMode}
          onChange={setAccountsMode}
        />
        <Avatar initials={profile?.avatar_initials ?? '??'} />
      </div>

      {accountsMode === 'fiat' ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-title">Connected Banks</h2>
            {profile?.is_test_account && <TestAccountFlag />}
          </div>

          <DataTable
            rows={banks}
            rowKey={(r) => r.id}
            columns={[
              { key: 'route', header: 'Route', render: (r) => r.route },
              { key: 'account', header: 'Account', render: (r) => `••••${r.accountLast4}` },
              { key: 'bank', header: 'Bank', render: (r) => r.bankName },
              {
                key: 'limit',
                header: 'Limit',
                render: (r) => (
                  <span className="flex items-center gap-2">
                    {formatUsd(r.limit)}
                    <span className="h-2 w-2 rounded-full bg-[var(--success)]" aria-label="Connected" />
                  </span>
                ),
              },
            ]}
          />

          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3">
            <span className="text-body text-[var(--text-muted)]">Total Available Credit</span>
            <span className="text-title text-[var(--accent)]">{formatUsd(totalCredit)}</span>
          </div>

          <Card variant="dashed" className="space-y-3 text-center">
            <p className="text-title">Add Bank</p>
            <p className="text-caption text-[var(--text-muted)]">
              Connect another bank to increase your testing limit.
            </p>
            <Button fullWidth onClick={openAddBank}>
              <Plus className="h-4 w-4 mr-2 inline" aria-hidden />
              Add Bank
            </Button>
          </Card>
        </>
      ) : (
        <>
          {loading && wallets.length === 0 ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            </div>
          ) : (
            <>
              <Card
                variant="elevated"
                className="bg-gradient-to-br from-[var(--accent)] to-[#0B3D3A] text-white border-0 space-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-caption opacity-80">Total Balance</p>
                    {selectedWallet ? (
                      <>
                        <p className="text-display-l">
                          {formatCrypto(
                            selectedWallet.balance,
                            selectedWallet.asset,
                            selectedWallet.asset === 'USDT' ? 2 : 4,
                          )}
                        </p>
                        <p className="text-body opacity-80">
                          ≈ {formatUsd(cryptoToUsd(selectedWallet.balance, selectedWallet.asset))} USD
                        </p>
                      </>
                    ) : (
                      <p className="text-display-l">—</p>
                    )}
                    <p className="text-caption opacity-70 mt-2">
                      Portfolio ≈ {formatUsd(totalCryptoUsd)} USD
                    </p>
                  </div>
                  <AssetIcon asset={selectedAsset} className="text-2xl font-bold" />
                </div>
              </Card>

              <div className="flex justify-around">
                <IconCircleButton label="Send" onClick={openSend}>
                  <ArrowRight className="h-6 w-6" />
                </IconCircleButton>
                <IconCircleButton label="Receive" onClick={openReceive}>
                  <ArrowDownLeft className="h-6 w-6" />
                </IconCircleButton>
                <IconCircleButton label="Scan QR" onClick={openScan}>
                  <QrCode className="h-6 w-6" />
                </IconCircleButton>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-body"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.asset}>
                      {w.asset} — {w.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openAddWallet}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--accent)]"
                  aria-label="Add wallet"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-title">Recent Activity</h3>
                  <button type="button" className="text-caption text-[var(--accent)]">
                    View All
                  </button>
                </div>
                <CryptoActivityList
                  transactions={transactions.filter((tx) => tx.asset === selectedAsset)}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
