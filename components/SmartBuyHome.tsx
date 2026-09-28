"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  User,
  X,
  Zap,
  Gift,
  Watch,
  Shirt,
  Footprints,
  Gamepad2,
  Dumbbell,
  Home as HomeIcon,
  Palette,
} from "lucide-react";

import Link from "next/link";
import { products, type Product } from "../lib/products";
import { useCart } from "./CartProvider";

const categories = [
  ["Fashion", Shirt],
  ["Footwear", Footprints],
  ["Electronics", Zap],
  ["Accessories", Watch],
  ["Beauty", Palette],
  ["Home & Living", HomeIcon],
  ["Gaming", Gamepad2],
  ["Sports", Dumbbell],
  ["Gifts", Gift],
] as const;

export default function SmartBuyHome() {
  const { itemCount, addToCart } = useCart();

  const [likes, setLikes] = useState<number[]>([]);
  const [ai, setAi] = useState(true);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const [budget, setBudget] = useState("5000");
  const [style, setStyle] = useState("Casual");
  const [stage, setStage] = useState(0);
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMx(e.clientX);
      setMy(e.clientY);
    };

    const key = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        setSearch(true);
      }

      if (e.key === "Escape") {
        setSearch(false);
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("keydown", key);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("keydown", key);
    };
  }, []);

  const filtered = useMemo(
    () =>
      q
        ? products.filter((p) =>
            `${p.name} ${p.cat}`
              .toLowerCase()
              .includes(q.toLowerCase())
          )
        : products,
    [q]
  );

  const add = (id = products[0].id) => addToCart(id);

  const toggleLike = (id: number) =>
    setLikes((v) =>
      v.includes(id)
        ? v.filter((x) => x !== id)
        : [...v, id]
    );

  const generate = () => {
    setStage(1);

    setTimeout(() => setStage(2), 700);
    setTimeout(() => setStage(3), 1400);
    setTimeout(() => setStage(4), 2100);
  };

  const px =
    (mx /
      Math.max(
        typeof window !== "undefined"
          ? window.innerWidth
          : 1,
        1
      ) -
      0.5) *
    18;

  const py =
    (my /
      Math.max(
        typeof window !== "undefined"
          ? window.innerHeight
          : 1,
        1
      ) -
      0.5) *
    10;

  return (
    <main className="app">
      <div
        className="spotlight"
        style={{
          transform: `translate3d(${mx - 250}px, ${
            my - 250
          }px, 0)`,
        }}
      />

      <div className="noise" />

      {/* ================= HEADER ================= */}

      <header className="header">
        <div className="nav-wrap">
          <button
            className="brand"
            onClick={() =>
              scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <span className="brand-mark">
              S
            </span>

            <b>SmartBuy</b>
          </button>

          <nav>
            {[
              "Home",
              "Products",
              "Categories",
              "Deals",
            ].map((x, i) => (
              <a
                key={x}
                className={
                  i === 0 ? "active" : ""
                }
                href={
                  i === 0
                    ? "#top"
                    : x === "Products"
                    ? "/products"
                    : `#${x.toLowerCase()}`
                }
              >
                {x}
              </a>
            ))}

            <button
              className="smart-pill"
              onClick={() => setAi(true)}
            >
              <Sparkles size={14} />

              SmartBuy

              <span>AI</span>
            </button>
          </nav>

          {/* SEARCH */}

          <button
            className="searchbar"
            onClick={() => setSearch(true)}
          >
            <Search size={18} />

            <span>
              Search for products, brands or ask
              AI...
            </span>

            <kbd>Ctrl K</kbd>
          </button>

          {/* ACTIONS */}

          <div className="actions">
            {/* Wishlist */}
            <button
              aria-label="Wishlist"
              onClick={() =>
                document
                  .getElementById("trending")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              <Heart size={19} />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={19} />

              <i>{itemCount}</i>
            </Link>

            {/* USER / ACCOUNT */}

            <Link
              href="/account"
              className="avatar"
              aria-label="My Account"
              title="My Account"
            >
              <User size={17} />
            </Link>

            {/* Mobile menu */}
            <button
              className="mobile-menu"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section id="top" className="hero">
        <div className="hero-grid">
          {/* HERO COPY */}

          <div className="hero-copy">
            <span className="kicker">
              <Sparkles size={13} />

              AI POWERED SHOPPING
            </span>

            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              Shop Smarter
              <br />
              Live <em>Better</em>
            </motion.h1>

            <p>
              AI-powered recommendations,
              trending products, and a whole
              new shopping experience built
              around you.
            </p>

            <div className="hero-buttons">
              <button
                className="primary"
                onClick={() =>
                  (window.location.href =
                    "/products")
                }
              >
                Explore Products

                <ArrowRight size={17} />
              </button>

              <button
                className="secondary"
                onClick={() => setAi(true)}
              >
                <span>▶</span>

                Ask SmartBuy
              </button>
            </div>

            <div className="trust-row">
              {[
                [
                  Truck,
                  "Free Delivery",
                  "Orders above ₹499",
                ],
                [
                  CircleDollarSign,
                  "Easy Returns",
                  "7 day return policy",
                ],
                [
                  Check,
                  "Secure Payments",
                  "100% safe & secure",
                ],
              ].map(
                ([Icon, t, s]) => (
                  <div key={t as string}>
                    <span>
                      <Icon size={15} />
                    </span>

                    <div>
                      <b>{t as string}</b>

                      <small>
                        {s as string}
                      </small>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* HERO PRODUCT */}

          <div className="hero-stage">
            <div className="orbit a" />
            <div className="orbit b" />

            <motion.img
              className="hero-shoe"
              src={products[0].img}
              alt="Air Max 270"
              style={{
                x: px,
                y: py,
              }}
              animate={{
                y: [0, -9, 0],
                rotate: [-1, 1, -1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <FloatCard
              cls="one"
              title="Nike Air Max"
              price="₹4,999"
              rating="4.8"
            />

            <FloatCard
              cls="two"
              title="Smart Watch"
              price="₹2,499"
              button
              onAdd={() => add(2)}
            />

            <FloatCard
              cls="three"
              title="Noise Headphones"
              price="₹1,999"
              button
              onAdd={() => add(7)}
            />

            <span className="hero-chip">
              <i /> 360° product view
            </span>
          </div>

          {/* AI PANEL */}

          <aside className="ai-panel">
            <div className="ai-head">
              <div className="ai-title">
                <span className="ai-orb">
                  <Sparkles size={15} />
                </span>

                <div>
                  <b>SmartBuy AI</b>

                  <small>
                    Beta • Your shopping
                    co-pilot
                  </small>
                </div>
              </div>

              <button
                onClick={() => setAi(false)}
                aria-label="Close AI"
              >
                <X size={17} />
              </button>
            </div>

            <h3>
              Tell us what you need.
              <br />

              <span>
                We'll build the perfect
                cart for you.
              </span>{" "}
              ✨
            </h3>

            <div className="fields">
              <label>
                <span>⌕</span>

                <input
                  placeholder="What are you looking for?"
                />
              </label>

              <label>
                <span>₹</span>

                <input
                  value={budget}
                  onChange={(e) =>
                    setBudget(
                      e.target.value
                    )
                  }
                  placeholder="Budget"
                />

                <small>Budget</small>
              </label>

              <label>
                <span>⌾</span>

                <select defaultValue="College">
                  <option>
                    College
                  </option>

                  <option>
                    Office
                  </option>

                  <option>Gym</option>

                  <option>
                    Travel
                  </option>

                  <option>
                    Party
                  </option>
                </select>

                <small>Purpose</small>
              </label>

              <label>
                <span>✦</span>

                <select
                  value={style}
                  onChange={(e) =>
                    setStyle(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Casual
                  </option>

                  <option>
                    Street
                  </option>

                  <option>
                    Minimal
                  </option>

                  <option>
                    Sporty
                  </option>

                  <option>
                    Premium
                  </option>
                </select>

                <small>Style</small>
              </label>
            </div>

            <button
              className="generate"
              onClick={generate}
            >
              <Sparkles size={16} />

              {stage >= 4
                ? "Your Collection Is Ready"
                : "Generate My Collection"}

              <ArrowRight size={15} />
            </button>

            {stage > 0 &&
              stage < 4 && (
                <div className="ai-progress">
                  <span className="spinner" />

                  {
                    [
                      "",
                      "Analyzing your preferences…",
                      "Finding the best products…",
                      "Optimizing your budget…",
                    ][stage]
                  }
                </div>
              )}

            <div className="suggestions">
              {[
                "College Outfit",
                "Gym Essentials",
                "Party Outfit",
              ].map((x) => (
                <button key={x}>
                  {x}
                </button>
              ))}
            </div>
          </aside>
        </div>

        {/* CATEGORY ROW */}

        <div className="category-row">
          {categories.map(
            ([name, Icon]) => (
              <button key={name}>
                <span>
                  <Icon size={18} />
                </span>

                {name}
              </button>
            )
          )}
        </div>
      </section>

      {/* ================= CAMPAIGNS ================= */}

      <section
        id="categories"
        className="campaigns"
      >
        <div className="campaign-grid">
          <div className="campaign big">
            <span>
              NEW COLLECTION
            </span>

            <h2>
              Street Style
              <br />
              <b>Reimagined</b>
            </h2>

            <p>
              Trendy. Comfortable.
              Unstoppable.
            </p>

            <button>
              Shop Collection{" "}
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="campaign look">
            <span>
              SMARTBUY PICKS
            </span>

            <h2>
              Complete Your Look
            </h2>

            <p>
              AI curated outfits just
              for you.
            </p>

            <button>
              View Collection{" "}
              <ArrowRight size={14} />
            </button>

            <div className="look-images">
              <img
                src={products[2].img}
                alt="T-shirt"
              />

              <img
                src={products[0].img}
                alt="Sneaker"
              />
            </div>
          </div>

          <div className="campaign story">
            <span>
              YOUR STYLE
            </span>

            <h2>
              Your Style
              <br />
              Your Story
            </h2>

            <p>
              Premium fashion for
              every vibe.
            </p>

            <button>
              Explore{" "}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}

      <section
        id="products"
        className="products-section"
      >
        <div className="section-head">
          <div>
            <span>
              MOST LOVED PRODUCTS
            </span>

            <h2>
              Trending Now
            </h2>
          </div>

          <Link
            href="/products"
            style={{
              textDecoration: "none",
            }}
          >
            <button>
              View All{" "}
              <ArrowRight size={15} />
            </button>
          </Link>
        </div>

        <div
          id="trending"
          className="product-grid"
        >
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              liked={likes.includes(
                p.id
              )}
              onLike={() =>
                toggleLike(p.id)
              }
              onAdd={() =>
                addToCart(p.id)
              }
            />
          ))}
        </div>

        <div className="section-head recommended">
          <div>
            <span>
              BASED ON YOUR TRENDS
            </span>

            <h2>
              Recommended For You
            </h2>
          </div>

          <small>
            Curated by SmartBuy AI
          </small>
        </div>

        <div className="mini-strip">
          {products
            .slice(2)
            .map((p) => (
              <div
                className="mini-product"
                key={p.id}
              >
                <div className="mini-img">
                  <img
                    src={p.img}
                    alt={p.name}
                  />

                  <b>{p.badge}</b>

                  <button
                    onClick={() =>
                      toggleLike(p.id)
                    }
                  >
                    {likes.includes(
                      p.id
                    ) ? (
                      <Heart
                        size={14}
                        fill="currentColor"
                      />
                    ) : (
                      <Heart size={14} />
                    )}
                  </button>
                </div>

                <strong>
                  {p.name}
                </strong>

                <div>
                  <b>
                    ₹
                    {p.price.toLocaleString(
                      "en-IN"
                    )}
                  </b>

                  <span>
                    ★ {p.rating}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer>
        <div className="footer-inner">
          <div className="brand">
            <span className="brand-mark">
              S
            </span>

            <b>SmartBuy</b>
          </div>

          <p>
            AI-powered shopping • secure
            payments • premium experience
          </p>

          <span>
            © 2026 SmartBuy
          </span>
        </div>
      </footer>

      {/* ================= SEARCH MODAL ================= */}

      <AnimatePresence>
        {search && (
          <motion.div
            className="backdrop"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setSearch(false)
            }
          >
            <motion.div
              className="search-modal"
              initial={{
                y: -12,
                scale: 0.98,
              }}
              animate={{
                y: 0,
                scale: 1,
              }}
              exit={{
                y: -12,
                scale: 0.98,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="search-input">
                <Search size={20} />

                <input
                  autoFocus
                  value={q}
                  onChange={(e) =>
                    setQ(
                      e.target.value
                    )
                  }
                  placeholder="Search products, brands, categories…"
                />

                <button
                  onClick={() =>
                    setSearch(false)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div className="search-body">
                <div className="search-meta">
                  <b>
                    Popular Searches
                  </b>

                  <span>
                    ESC to close
                  </span>
                </div>

                <div className="chips">
                  {[
                    "Sneakers",
                    "Headphones",
                    "Smart Watches",
                    "Jeans",
                    "Hoodies",
                    "Sunglasses",
                  ].map((x) => (
                    <button
                      key={x}
                      onClick={() =>
                        setQ(x)
                      }
                    >
                      {x}
                    </button>
                  ))}
                </div>

                {q && (
                  <div className="results">
                    {filtered
                      .slice(0, 5)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() =>
                            setSearch(
                              false
                            )
                          }
                        >
                          <img
                            src={p.img}
                            alt=""
                          />

                          <span>
                            <b>
                              {p.name}
                            </b>

                            <small>
                              {p.cat} · ₹
                              {p.price.toLocaleString(
                                "en-IN"
                              )}
                            </small>
                          </span>

                          <ChevronRight
                            size={17}
                          />
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING AI */}

      {!ai && (
        <button
          className="floating-ai"
          onClick={() => setAi(true)}
        >
          <Sparkles size={17} />
          SmartBuy AI
        </button>
      )}
    </main>
  );
}

/* =========================================================
   FLOATING PRODUCT CARD
========================================================= */

function FloatCard({
  cls,
  title,
  price,
  rating,
  button,
  onAdd,
}: {
  cls: string;
  title: string;
  price: string;
  rating?: string;
  button?: boolean;
  onAdd?: () => void;
}) {
  return (
    <motion.div
      className={`float-card ${cls}`}
      animate={{
        y: button
          ? [0, 8, 0]
          : [0, -8, 0],
      }}
      transition={{
        duration: button
          ? 4.7
          : 4,
        repeat: Infinity,
      }}
    >
      <div>
        <b>{title}</b>

        <span>{price}</span>
      </div>

      {rating ? (
        <div className="star">
          ★ {rating}
        </div>
      ) : button ? (
        <button
          onClick={onAdd}
          aria-label={`Add ${title} to cart`}
        >
          +
        </button>
      ) : null}
    </motion.div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  p,
  liked,
  onLike,
  onAdd,
}: {
  p: Product;
  liked: boolean;
  onLike: () => void;
  onAdd: () => void;
}) {
  const [hover, setHover] =
    useState(false);

  return (
    <motion.article
      className="p-card"
      onHoverStart={() =>
        setHover(true)
      }
      onHoverEnd={() =>
        setHover(false)
      }
      whileHover={{
        y: -7,
      }}
    >
      <div className="p-img">
        <span>{p.badge}</span>

        <button
          onClick={onLike}
          aria-label="Add to wishlist"
        >
          {liked ? (
            <Heart
              size={16}
              fill="currentColor"
            />
          ) : (
            <Heart size={16} />
          )}
        </button>

        <motion.img
          src={p.img}
          alt={p.name}
          animate={{
            scale: hover
              ? 1.055
              : 1,
            rotate: hover
              ? -1
              : 0,
          }}
          transition={{
            duration: 0.3,
          }}
        />

        {hover && (
          <motion.div
            className="quick"
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <button
              onClick={onAdd}
            >
              Quick Add
            </button>

            <button
              onClick={() =>
                (window.location.href =
                  `/products/${p.id}`)
              }
            >
              Quick View
            </button>
          </motion.div>
        )}
      </div>

      <div className="p-info">
        <div className="p-title">
          <b>{p.name}</b>

          <span>
            ★ {p.rating}
          </span>
        </div>

        <div className="price">
          <strong>
            ₹
            {p.price.toLocaleString(
              "en-IN"
            )}
          </strong>

          <del>
            ₹
            {p.old.toLocaleString(
              "en-IN"
            )}
          </del>
        </div>

        <div className="p-actions">
          <button onClick={onAdd}>
            <ShoppingBag
              size={15}
            />

            Add to Cart
          </button>

          <button
            onClick={onLike}
            aria-label="Wishlist"
          >
            {liked ? (
              <Heart
                size={16}
                fill="currentColor"
              />
            ) : (
              <Heart size={16} />
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}