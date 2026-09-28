# SmartBuy V3 — Cart Module

This version adds a shared cart system on top of the SmartBuy V2 UI.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## New cart flow

- Add products from `/products`.
- Add products from `/products/[id]`.
- The cart count is shared across Home, Products, and Product Details.
- Cart data is persisted in browser localStorage.
- Open the cart at `/cart`.
- Quantity controls, remove, coupon UI, free-delivery progress, totals, and checkout button are included.

## Important

The Checkout button is prepared for the next stage. Razorpay integration and server-side payment verification are not connected yet.
