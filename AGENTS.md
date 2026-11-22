# ShopLedger agent notes

## Stack

Node.js CommonJS application using Express 4 and body-parser; static browser UI in `public/`; JSON persistence in `data/db.json`.

## Module map

- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order listing, lookup, placement, and cancellation endpoints.
- `routes/products.js` — product and active-coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, lookup, validation, discount calculation, and listing.
- `lib/dates.js` — current date, date-key normalization, and fiscal-year helpers.
- `lib/inventory.js` — product lookup, sellable-stock checks, stock deduction, release, and summaries.
- `lib/invoice.js` — printable invoice figures and HTML rendering.
- `lib/ledger.js` — customer lookup/listing, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — subtotal, coupon discount, GST-aware totals, and line breakdowns.
- `lib/reports.js` — dashboard summary and GST reconciliation.
- `lib/store.js` — read, write, structure initialization, and audit-log persistence.
- `lib/tax.js` — item GST-rate resolution, slab percentage, and CGST/SGST split.

## Commands

- Start the app: `node server.js` (equivalent to the `npm start` script).
- Run tests: `node --test`.
- The repository currently has no test files, and its package `test` script is not a test runner.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Cannot sell the last sellable unit in stock, and cancelling an order never restores stock.

Allowed files: `lib/inventory.js`, and `lib/orders.js` (cancel only).
