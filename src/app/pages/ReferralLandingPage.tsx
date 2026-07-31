import { Navigate, useParams } from 'react-router'

/** Referral deep link → signup with ref query param */
export function ReferralLandingPage() {
  const { code } = useParams<{ code: string }>()
  const ref = encodeURIComponent(code ?? '')
  return <Navigate to={`/signup?ref=${ref}`} replace />
}
