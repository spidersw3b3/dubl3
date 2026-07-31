# DUBL Economics

**Author:** spidersw3b3

This document expands the executive math from the master build prompt. Read before implementing Double Pay.

---

## The naive 50/50 problem

If a user pays **$X** for a real purchase and **always receives the item**, a "win" that returns their **$X payment + $X bonus balance** creates ~**3× perceived value** (item + refund + bonus).

On the **gamble slice alone** (ignoring item utility):

| Outcome | Net to user (gamble only) |
|---------|---------------------------|
| Win (+$X refund + $X bonus) | **+$2X** |
| Lose (−$X debit) | **−$X** |

**EV at 50/50 = +$0.50X per dollar staked** → structurally **player-positive / platform-negative**.

### Platform bleed per $X transaction (simplified)

- **Win (~50%):** merchant settlement **$X** + refund **$X** + bonus **$X** ≈ **−$2X to −$3X** net
- **Loss (~50%):** recover **$X** from credit line / linked bank ≈ **$0 net** if collection succeeds

**Blended platform EV ≈ −$1.00 to −$1.50 per $X** at true 50/50 with full refund+bonus wins. **Not viable without subsidy.**

---

## Strategic workarounds (admin-configurable)

All strategies ship as parameters in `dubl_odds_config`:

| Strategy | Consumer feel | Platform math |
|----------|---------------|---------------|
| **A. Split payment from double** | Pay normally, flip for bonus | Payment settles; double is bonus-only flip |
| **B. Bonus-only win (no refund)** | Win 2× back as DUBL Balance | Win = +X only. Fair 50/50: EV = 0 |
| **C. Adjusted win probability** | Up to 2× back — odds vary | If win pays +2X, need **p ≈ 33%** for zero EV |
| **D. Partial win tiers** | 1.25× / 1.5× / 2× tiers | Variable reward schedule |
| **E. Partner-subsidized boosts** | Nike 40% win rate this week | Brand funds `partner_subsidy_pool` |
| **F. Credit line + interchange** | $500 Double Credit to start | Revenue from merchant fees, late fees, interest |
| **G. Caps & velocity** | Double up to $25/day | Limits exposure |
| **H. Category gating** | Double only at partner merchants | Margin share funds bonuses |

---

## MVP default (legal copy must match)

**Default mode: `bonus_only`**

1. User pays merchant **$X** (always — item fulfilled via payment intent)
2. Optional **Double Flip** after authorization:
   - **Win (p = 0.40, admin-configurable):** credit **+X** to DUBL Balance ("2× Back — $X earned")
   - **Loss:** no bonus; if insufficient balance/credit, debit **$X** from Double Credit Line → linked bank
3. **Do NOT** refund original payment on win in MVP
4. Marketing: "earn up to 2× back", not "triple your money"
5. Display simulated odds + last outcome in Pay modal

### Zero-EV probability reference

For bonus-only wins paying **+X** on win and **−X** effective cost on loss:

```
p(win) × X − (1 − p) × X = 0  →  p = 0.50
```

For **2× bonus** (+2X win, −X loss):

```
p × 2X − (1 − p) × X = 0  →  p = 1/3 ≈ 33%
```

MVP uses **p = 40%** with **+X bonus only** → slight platform edge on the gamble slice, offset by interchange/credit revenue.

---

## Debt & collections (MVP mock → prod)

- Every double loss creating debt writes `dubl_obligations` row
- User accepts **Double Credit Agreement** at signup
- Waterfall: **DUBL Balance → Double Credit → linked bank ACH (mock) → manual collections (admin)**
- MVP: simulate ACH; mark `MOCK_COLLECTION` in manifest

---

## Admin tuning

Configure via `dubl_odds_config`:

| Column | MVP default |
|--------|-------------|
| `mode` | `bonus_only` |
| `base_win_probability` | `0.40` |
| `max_daily_double_usd` | `25.00` |
| `max_single_double_usd` | `200.00` |

Changes require admin audit log entry with reason note.
