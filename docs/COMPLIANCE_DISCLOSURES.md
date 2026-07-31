# DUBL Compliance Disclosures (MVP Placeholders)

**Author:** spidersw3b3  
**Status:** Draft — requires legal review before production.

---

## Required user-facing copy (MVP)

1. **Not a bank** — "DUBL is not a bank. Banking services are provided by partner institutions."
2. **Demo environment** — Test accounts display amber "Test Account" badge; no real money moves.
3. **Double Pay disclosure** — Show configured win probability and "bonus only, no payment refund" language.
4. **Double Credit Agreement** — Required acceptance before first double flip (Phase 5).

---

## Regulatory review placeholders

| Topic | Status |
|-------|--------|
| State gambling applicability | Legal review required |
| Lending / credit line licensing | Legal review required |
| Money transmission / MSB | Partner bank program TBD |
| KYC/AML program | MVP: manual admin approve |

---

## Data retention

- Transactions: append-only, 7-year retention target
- Legal acceptances: version + timestamp + IP
- Admin audit log: immutable

---

## PCI scope reduction

- Never store full PAN — last4 + token reference only
- Card tokenization via partner (Phase 2 mock uses Luhn test table)
