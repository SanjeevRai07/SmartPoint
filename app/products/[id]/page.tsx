"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Heart, Minus, Plus, ShoppingBag, Sparkles, Star, Truck } from "lucide-react";
import { products } from "../../../lib/products";
import { useCart } from "../../../components/CartProvider";
import { useRouter } from "next/navigation";

export default function ProductPage(){
  const params=useParams();
  const product=products.find(p=>p.id===Number(params.id)) ?? products[0];
  const router=useRouter();
  const { addToCart, itemCount } = useCart();
  const [qty,setQty]=useState(1); const [liked,setLiked]=useState(false); const [added,setAdded]=useState(false);
  return <main className="detail-page">
    <header className="detail-header"><div className="detail-nav"><Link href="/" className="brand-link"><span className="brand-mark">S</span><b>SmartBuy</b></Link><Link href="/products" className="back-link"><ArrowLeft size={15}/> All Products</Link><div className="detail-spacer"/><button><Heart size={18}/></button><Link href="/cart" className="detail-cart-link"><ShoppingBag size={18}/><i>{itemCount}</i></Link></div></header>
    <div className="detail-wrap"><div className="crumbs"><Link href="/">Home</Link><ChevronRight size={13}/><Link href="/products">Products</Link><ChevronRight size={13}/><span>{product.name}</span></div><section className="detail-grid"><div className="detail-visual"><div className="detail-badge">{product.badge}</div><img src={product.img} alt={product.name}/><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/></div><div className="detail-copy"><div className="detail-cat">{product.cat} · {product.brand}</div><h1>{product.name}</h1><div className="detail-rating"><span><Star size={15} fill="currentColor"/> {product.rating}</span><b>4.8/5</b><small>1,240 verified reviews</small></div><div className="detail-price"><b>₹{product.price.toLocaleString("en-IN")}</b><del>₹{product.old.toLocaleString("en-IN")}</del><span>Save ₹{(product.old-product.price).toLocaleString("en-IN")}</span></div><p className="detail-description">{product.description}</p><div className="ai-note"><span><Sparkles size={16}/></span><div><b>SmartBuy AI says</b><p>This product fits a casual college setup and pairs well with your saved preferences.</p></div></div><div className="detail-row"><span>Quantity</span><div className="qty"><button onClick={()=>setQty(Math.max(1,qty-1))}><Minus size={14}/></button><b>{qty}</b><button onClick={()=>setQty(qty+1)}><Plus size={14}/></button></div></div><div className="detail-actions"><button className={`add-btn ${added?"added":""}`} onClick={()=>{addToCart(product.id, qty);setAdded(true)}}>{added?<><Check size={17}/> Added to Cart</>:<><ShoppingBag size={17}/> Add to Cart</>}</button><button className={`heart-btn ${liked?"liked":""}`} onClick={()=>setLiked(!liked)}><Heart size={18} fill={liked?"currentColor":"none"}/></button></div><button className="buy-btn" onClick={()=>{addToCart(product.id, qty);router.push("/cart")}}>Buy Now <ArrowRightIcon/></button><div className="detail-trust"><div><Truck size={17}/><span><b>Free delivery</b><small>Orders above ₹499</small></span></div><div><Check size={17}/><span><b>Easy returns</b><small>7 day return policy</small></span></div></div></div></section><section className="complete-look"><div><span>SMARTBUY AI PICKS</span><h2>Complete Your Look</h2><p>Pairs perfectly with {product.name}.</p></div><Link href="/products">Explore matching products <ArrowRight size={14}/></Link></section></div>
  </main>
}
function ArrowRightIcon(){return <span style={{fontSize:16}}>→</span>}
