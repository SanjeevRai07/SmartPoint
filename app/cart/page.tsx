"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, Minus, Plus, ShoppingBag, Sparkles, Tag, Trash2, Truck } from "lucide-react";
import { useCart } from "../../components/CartProvider";
import { products } from "../../lib/products";

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function CartPage() {
  const { lines, itemCount, updateQty, removeFromCart } = useCart();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const items = useMemo(
    () => lines
      .map((line) => {
        const product = products.find((p) => p.id === line.productId);
        return product ? { product, qty: line.qty } : null;
      })
      .filter(Boolean) as { product: (typeof products)[number]; qty: number }[],
    [lines],
  );

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discount = couponApplied ? Math.min(500, Math.round(subtotal * 0.1)) : 0;
  const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 79;
  const total = subtotal - discount + delivery;
  const freeDeliveryProgress = Math.min(subtotal / 499, 1);
  const remaining = Math.max(499 - subtotal, 0);

  if (!items.length) {
    return (
      <main className="cart-page">
        <header className="cart-header">
          <div className="cart-nav">
            <Link href="/" className="brand-link"><span className="brand-mark">S</span><b>SmartBuy</b></Link>
            <Link href="/products" className="back-link"><ArrowLeft size={15}/> Continue Shopping</Link>
          </div>
        </header>
        <section className="cart-empty">
          <div className="cart-empty-icon"><ShoppingBag size={28}/></div>
          <span className="listing-kicker"><Sparkles size={13}/> YOUR CART</span>
          <h1>Your collection is <em>empty.</em></h1>
          <p>Add a few favorites and we'll take care of the rest.</p>
          <Link href="/products" className="cart-primary">Explore Products <ArrowRight size={16}/></Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <header className="cart-header">
        <div className="cart-nav">
          <Link href="/" className="brand-link"><span className="brand-mark">S</span><b>SmartBuy</b></Link>
          <Link href="/products" className="back-link"><ArrowLeft size={15}/> Continue Shopping</Link>
          <div className="cart-nav-count"><ShoppingBag size={16}/> {itemCount} {itemCount === 1 ? "item" : "items"}</div>
        </div>
      </header>

      <section className="cart-wrap">
        <div className="cart-headline">
          <div><span className="listing-kicker"><Sparkles size={13}/> YOUR COLLECTION</span><h1>Review your <em>cart.</em></h1><p>Everything you've picked, in one clean place.</p></div>
          <div className="cart-ai-note"><span><Sparkles size={15}/></span><div><b>SmartBuy AI</b><small>{remaining > 0 ? `Add ${money(remaining)} more for free delivery.` : "Free delivery unlocked."}</small></div></div>
        </div>

        <div className="cart-grid">
          <div className="cart-items">
            {items.map(({ product, qty }) => (
              <article key={product.id} className="cart-item">
                <Link href={`/products/${product.id}`} className="cart-item-image"><img src={product.img} alt={product.name}/><span>{product.badge}</span></Link>
                <div className="cart-item-main">
                  <div>
                    <div className="cart-item-cat">{product.cat} · {product.brand}</div>
                    <Link href={`/products/${product.id}`} className="cart-item-name">{product.name}</Link>
                    <div className="cart-item-rating">★ {product.rating} <small>1.2k reviews</small></div>
                  </div>
                  <button className="cart-remove" onClick={() => removeFromCart(product.id)}><Trash2 size={14}/> Remove</button>
                </div>
                <div className="cart-item-side">
                  <b>{money(product.price * qty)}</b>
                  <del>{money(product.old * qty)}</del>
                  <div className="cart-qty"><button onClick={() => updateQty(product.id, qty - 1)}><Minus size={13}/></button><span>{qty}</span><button onClick={() => updateQty(product.id, qty + 1)}><Plus size={13}/></button></div>
                </div>
              </article>
            ))}

            <div className="delivery-progress">
              <div className="delivery-copy"><div><Truck size={17}/><b>{remaining > 0 ? `Add ${money(remaining)} more for FREE delivery` : "You unlocked FREE delivery"}</b></div><span>{money(Math.min(subtotal, 499))} / ₹499</span></div>
              <div className="delivery-bar"><span style={{ width: `${freeDeliveryProgress * 100}%` }}/></div>
            </div>

            <div className="cart-recommend"><div><span>SMARTBUY AI PICKS</span><h2>Complete your cart</h2><p>Small additions, better bundles.</p></div><Link href="/products">Browse Products <ArrowRight size={14}/></Link></div>
          </div>

          <aside className="cart-summary">
            <div className="summary-top"><span>ORDER SUMMARY</span><b>{itemCount} items</b></div>
            <div className="summary-row"><span>Subtotal</span><b>{money(subtotal)}</b></div>
            <div className="summary-row"><span>Delivery</span><b>{delivery === 0 ? "FREE" : money(delivery)}</b></div>
            {couponApplied && <div className="summary-row discount"><span>Coupon discount</span><b>-{money(discount)}</b></div>}
            <div className="coupon-box"><Tag size={15}/><input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code"/><button onClick={() => setCouponApplied(coupon.trim().length > 0)}>Apply</button></div>
            {couponApplied && <div className="coupon-success"><Check size={13}/> Coupon applied successfully</div>}
            <div className="summary-total"><span>Total</span><b>{money(total)}</b></div>
            <Link href="/checkout" className="checkout-btn">Proceed to Checkout <ArrowRight size={16}/></Link>
            <div className="secure-note"><Check size={14}/> Secure checkout • Razorpay supported</div>
            <div className="summary-trust"><div><Truck size={16}/><span><b>Fast delivery</b><small>Free above ₹499</small></span></div><div><Heart size={16}/><span><b>Easy returns</b><small>7 day return policy</small></span></div></div>
          </aside>
        </div>
      </section>
    </main>
  );
}
