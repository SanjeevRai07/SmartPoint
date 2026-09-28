"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronDown, Filter, Heart, Search, ShoppingBag, SlidersHorizontal, Sparkles, Star, X } from "lucide-react";
import { brands, categories, products } from "../../lib/products";
import { useCart } from "../../components/CartProvider";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [brand, setBrand] = useState<(typeof brands)[number]>("All");
  const [maxPrice, setMaxPrice] = useState(7000);
  const [sort, setSort] = useState("popular");
  const [liked, setLiked] = useState<number[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { itemCount, addToCart } = useCart();

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const matchesQuery = `${p.name} ${p.brand} ${p.cat}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || p.cat === category;
      const matchesBrand = brand === "All" || p.brand === brand;
      const matchesPrice = p.price <= maxPrice;
      return matchesQuery && matchesCategory && matchesBrand && matchesPrice;
    });
    return [...result].sort((a,b) => sort === "price-low" ? a.price-b.price : sort === "price-high" ? b.price-a.price : sort === "rating" ? b.rating-a.rating : b.rating-a.rating);
  }, [query, category, brand, maxPrice, sort]);

  const toggleLike = (id:number) => setLiked(v => v.includes(id) ? v.filter(x=>x!==id) : [...v,id]);

  return <main className="products-page">
    <header className="products-header">
      <div className="products-nav">
        <Link href="/" className="brand-link"><span className="brand-mark">S</span><b>SmartBuy</b></Link>
        <Link href="/" className="back-link"><ArrowLeft size={15}/> Home</Link>
        <div className="listing-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, brands, categories..."/><kbd>⌘ K</kbd></div>
        <div className="listing-actions"><button><Heart size={18}/></button><Link href="/cart" className="bag"><ShoppingBag size={18}/><i>{itemCount}</i></Link></div>
      </div>
    </header>

    <section className="listing-hero">
      <div><span className="listing-kicker"><Sparkles size={13}/> SMARTBUY COLLECTION</span><h1>Find your <em>next favorite.</em></h1><p>Curated products, intelligent filters and a faster way to discover what fits your style.</p></div>
      <div className="listing-ai"><Sparkles size={17}/><div><b>SmartBuy AI</b><span>Tell us your budget + purpose and we'll build a collection.</span></div><Link href="/#top">Ask AI <ArrowRight size={14}/></Link></div>
    </section>

    <section className="listing-wrap">
      <div className="listing-toolbar"><button className="mobile-filter" onClick={()=>setFiltersOpen(true)}><SlidersHorizontal size={15}/> Filters</button><div><b>{filtered.length}</b> products</div><label>Sort by <select value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">Popular</option><option value="rating">Top Rated</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option></select><ChevronDown size={13}/></label></div>
      <div className="listing-layout">
        <aside className={`filter-panel ${filtersOpen?"open":""}`}><div className="filter-head"><b>Filters</b><button onClick={()=>setFiltersOpen(false)}><X size={17}/></button></div><div className="filter-group"><span>Category</span>{categories.map(c=><button key={c} className={category===c?"selected":""} onClick={()=>setCategory(c)}>{c}<i>{c==="All"?products.length:products.filter(p=>p.cat===c).length}</i></button>)}</div><div className="filter-group"><span>Brand</span>{brands.map(b=><button key={b} className={brand===b?"selected":""} onClick={()=>setBrand(b)}>{b}</button>)}</div><div className="filter-group"><div className="price-line"><span>Price</span><b>₹{maxPrice.toLocaleString("en-IN")}</b></div><input className="range" type="range" min="500" max="7000" step="100" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))}/><div className="range-labels"><span>₹500</span><span>₹7,000</span></div></div><button className="clear-filters" onClick={()=>{setCategory("All");setBrand("All");setMaxPrice(7000);setQuery("")}}>Clear all filters</button></aside>
        {filtersOpen && <button className="filter-overlay" onClick={()=>setFiltersOpen(false)} aria-label="Close filters"/>}
        <div className="listing-grid">{filtered.length ? filtered.map((p,i)=><motion.article key={p.id} className="listing-card" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*.035,.25)}} whileHover={{y:-6}}><Link href={`/products/${p.id}`} className="listing-image"><span>{p.badge}</span><button type="button" onClick={e=>{e.preventDefault();toggleLike(p.id)}}>{liked.includes(p.id)?<Heart size={16} fill="currentColor"/>:<Heart size={16}/>}</button><img src={p.img} alt={p.name}/><div className="listing-quick"><span>Quick view</span><ArrowRight size={14}/></div></Link><div className="listing-info"><div className="listing-cat">{p.cat} · {p.brand}</div><Link href={`/products/${p.id}`} className="listing-name">{p.name}</Link><div className="listing-rating"><span><Star size={12} fill="currentColor"/> {p.rating}</span><small>1.2k reviews</small></div><div className="listing-price"><b>₹{p.price.toLocaleString("en-IN")}</b><del>₹{p.old.toLocaleString("en-IN")}</del><button onClick={()=>addToCart(p.id)}><ShoppingBag size={15}/> Add</button></div></div></motion.article>) : <div className="empty-state"><span><Search size={22}/></span><h3>No products found</h3><p>Try a different search, category or price range.</p><button onClick={()=>{setQuery("");setCategory("All");setBrand("All");setMaxPrice(7000)}}>Reset filters</button></div>}</div>
      </div>
    </section>
  </main>
}
