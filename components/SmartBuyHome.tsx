"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "motion/react";

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
  Truck,
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
  type LucideIcon,
} from "lucide-react";

import Link from "next/link";

import {
  products,
  type Product,
} from "../lib/products";

import { useCart } from "./CartProvider";

import AccountMenu from "./AccountMenu";

/* =====================================================
   CATEGORIES
===================================================== */

const categories: Array<
  [string, LucideIcon]
> = [
  ["Fashion", Shirt],
  ["Footwear", Footprints],
  ["Electronics", Zap],
  ["Accessories", Watch],
  ["Beauty", Palette],
  ["Home & Living", HomeIcon],
  ["Gaming", Gamepad2],
  ["Sports", Dumbbell],
  ["Gifts", Gift],
];

/* =====================================================
   HOME PAGE
===================================================== */

export default function SmartBuyHome() {
  const {
    itemCount,
    addToCart,
  } = useCart();

  const [likes, setLikes] =
    useState<number[]>([]);

  const [ai, setAi] =
    useState(true);

  const [search, setSearch] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [budget, setBudget] =
    useState("5000");

  const [style, setStyle] =
    useState("Casual");

  const [stage, setStage] =
    useState(0);

  const [mouseX, setMouseX] =
    useState(0);

  const [mouseY, setMouseY] =
    useState(0);

  /* =================================================
     MOUSE + KEYBOARD
  ================================================= */

  useEffect(() => {
    const handleMouseMove = (
      event: MouseEvent
    ) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    const handleKeyboard = (
      event: KeyboardEvent
    ) => {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setSearch(true);
      }

      if (event.key === "Escape") {
        setSearch(false);
      }
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, []);

  /* =================================================
     SEARCH
  ================================================= */

  const filteredProducts =
    useMemo(() => {
      const value =
        query.trim().toLowerCase();

      if (!value) {
        return products;
      }

      return products.filter(
        (product) =>
          `${product.name} ${product.cat}`
            .toLowerCase()
            .includes(value)
      );
    }, [query]);

  /* =================================================
     CART
  ================================================= */

  const addProduct = (
    id: number = products[0].id
  ) => {
    addToCart(id);
  };

  /* =================================================
     WISHLIST
  ================================================= */

  const toggleLike = (
    id: number
  ) => {
    setLikes((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  };

  /* =================================================
     AI GENERATOR
  ================================================= */

  const generateCollection =
    () => {
      setStage(1);

      setTimeout(
        () => setStage(2),
        700
      );

      setTimeout(
        () => setStage(3),
        1400
      );

      setTimeout(
        () => setStage(4),
        2100
      );
    };

  /* =================================================
     PARALLAX
  ================================================= */

  const moveX =
    (mouseX /
      Math.max(
        typeof window !==
          "undefined"
          ? window.innerWidth
          : 1,
        1
      ) -
      0.5) *
    18;

  const moveY =
    (mouseY /
      Math.max(
        typeof window !==
          "undefined"
          ? window.innerHeight
          : 1,
        1
      ) -
      0.5) *
    10;

  return (
    <main className="app">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div
        className="spotlight"
        style={{
          transform:
            `translate3d(` +
            `${mouseX - 250}px,` +
            `${mouseY - 250}px,0)`,
        }}
      />

      <div className="noise" />

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">
        <div className="nav-wrap">

          {/* BRAND */}

          <button
            className="brand"
            type="button"
            onClick={() =>
              window.scrollTo({
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

          {/* NAVIGATION */}

          <nav>
            <a
              className="active"
              href="#top"
            >
              Home
            </a>

            <Link href="/products">
              Products
            </Link>

            <a href="#categories">
              Categories
            </a>

            <a href="#deals">
              Deals
            </a>

            <button
              className="smart-pill"
              type="button"
              onClick={() =>
                setAi(true)
              }
            >
              <Sparkles size={14} />

              SmartBuy

              <span>AI</span>
            </button>
          </nav>

          {/* SEARCH */}

          <button
            className="searchbar"
            type="button"
            onClick={() =>
              setSearch(true)
            }
          >
            <Search size={18} />

            <span>
              Search for products,
              brands or ask AI...
            </span>

            <kbd>Ctrl K</kbd>
          </button>

          {/* ACTIONS */}

          <div className="actions">

            {/* Wishlist */}
            <button
              type="button"
              aria-label="Wishlist"
              onClick={() =>
                document
                  .getElementById(
                    "trending"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  })
              }
            >
              <Heart size={19} />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="cart"
              aria-label="Shopping cart"
            >
              <ShoppingBag
                size={19}
              />

              <i>{itemCount}</i>
            </Link>

            {/* Account */}
            <AccountMenu />

            {/* Mobile menu */}
            <button
              className="mobile-menu"
              type="button"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>

          </div>
        </div>
      </header>

      {/* =================================================
          HERO
      ================================================= */}

      <section
        id="top"
        className="hero"
      >
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
              Live{" "}
              <em>Better</em>
            </motion.h1>

            <p>
              AI-powered recommendations,
              trending products, and a
              whole new shopping experience
              built around you.
            </p>

            <div className="hero-buttons">

              <Link
                href="/products"
                className="primary"
              >
                Explore Products

                <ArrowRight size={17} />
              </Link>

              <button
                className="secondary"
                type="button"
                onClick={() =>
                  setAi(true)
                }
              >
                <span>▶</span>

                Ask SmartBuy
              </button>

            </div>

            {/* TRUST */}

            <div className="trust-row">

              <div>
                <span>
                  <Truck size={15} />
                </span>

                <div>
                  <b>
                    Free Delivery
                  </b>

                  <small>
                    Orders above ₹499
                  </small>
                </div>
              </div>

              <div>
                <span>
                  <CircleDollarSign
                    size={15}
                  />
                </span>

                <div>
                  <b>
                    Easy Returns
                  </b>

                  <small>
                    7 day return policy
                  </small>
                </div>
              </div>

              <div>
                <span>
                  <Check size={15} />
                </span>

                <div>
                  <b>
                    Secure Payments
                  </b>

                  <small>
                    100% safe & secure
                  </small>
                </div>
              </div>

            </div>
          </div>

          {/* HERO STAGE */}

          <div className="hero-stage">

            <div className="orbit a" />
            <div className="orbit b" />

            <motion.img
              className="hero-shoe"
              src={products[0]?.img}
              alt={
                products[0]?.name ??
                "SmartBuy product"
              }
              style={{
                x: moveX,
                y: moveY,
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
              onAdd={() =>
                addProduct(2)
              }
            />

            <FloatCard
              cls="three"
              title="Noise Headphones"
              price="₹1,999"
              button
              onAdd={() =>
                addProduct(7)
              }
            />

            <span className="hero-chip">
              <i />
              360° product view
            </span>

          </div>

          {/* =================================================
              AI PANEL
          ================================================= */}

          {ai && (
            <aside className="ai-panel">

              <div className="ai-head">

                <div className="ai-title">

                  <span className="ai-orb">
                    <Sparkles size={15} />
                  </span>

                  <div>
                    <b>
                      SmartBuy AI
                    </b>

                    <small>
                      Beta • Your shopping
                      co-pilot
                    </small>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAi(false)
                  }
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

                {/* Search */}
                <label>
                  <span>⌕</span>

                  <input
                    placeholder="What are you looking for?"
                    value={query}
                    onChange={(event) =>
                      setQuery(
                        event.target.value
                      )
                    }
                  />
                </label>

                {/* Budget */}
                <label>
                  <span>₹</span>

                  <input
                    value={budget}
                    onChange={(event) =>
                      setBudget(
                        event.target.value
                      )
                    }
                    placeholder="Budget"
                  />

                  <small>
                    Budget
                  </small>
                </label>

                {/* Purpose */}
                <label>
                  <span>⌾</span>

                  <select defaultValue="College">
                    <option>
                      College
                    </option>

                    <option>
                      Office
                    </option>

                    <option>
                      Gym
                    </option>

                    <option>
                      Travel
                    </option>

                    <option>
                      Party
                    </option>
                  </select>

                  <small>
                    Purpose
                  </small>
                </label>

                {/* Style */}
                <label>
                  <span>✦</span>

                  <select
                    value={style}
                    onChange={(event) =>
                      setStyle(
                        event.target.value
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

                  <small>
                    Style
                  </small>
                </label>

              </div>

              <button
                className="generate"
                type="button"
                onClick={
                  generateCollection
                }
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
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setQuery(item)
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>

            </aside>
          )}

        </div>

        {/* CATEGORY ROW */}

        <div className="category-row">
          {categories.map(
            ([name, Icon]) => (
              <button
                key={name}
                type="button"
              >
                <span>
                  <Icon size={18} />
                </span>

                {name}
              </button>
            )
          )}
        </div>
      </section>

      {/* =================================================
          CAMPAIGNS
      ================================================= */}

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
              <b>
                Reimagined
              </b>
            </h2>

            <p>
              Trendy. Comfortable.
              Unstoppable.
            </p>

            <Link href="/products">
              Shop Collection
              <ArrowRight size={14} />
            </Link>
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

            <Link href="/products">
              View Collection
              <ArrowRight size={14} />
            </Link>

            <div className="look-images">
              <img
                src={products[2]?.img}
                alt="T-shirt"
              />

              <img
                src={products[0]?.img}
                alt="Sneaker"
              />
            </div>
          </div>

          <div
            id="deals"
            className="campaign story"
          >
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

            <Link href="/products">
              Explore
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* =================================================
          PRODUCTS
      ================================================= */}

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

          <Link href="/products">
            View All
            <ArrowRight size={15} />
          </Link>

        </div>

        <div
          id="trending"
          className="product-grid"
        >
          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
                liked={likes.includes(
                  product.id
                )}
                onLike={() =>
                  toggleLike(
                    product.id
                  )
                }
                onAdd={() =>
                  addToCart(
                    product.id
                  )
                }
              />
            )
          )}
        </div>

        {/* RECOMMENDED */}

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
            .map((product) => (
              <div
                className="mini-product"
                key={product.id}
              >
                <div className="mini-img">

                  <img
                    src={product.img}
                    alt={
                      product.name
                    }
                  />

                  <b>
                    {product.badge}
                  </b>

                  <button
                    type="button"
                    onClick={() =>
                      toggleLike(
                        product.id
                      )
                    }
                  >
                    {likes.includes(
                      product.id
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
                  {product.name}
                </strong>

                <div>
                  <b>
                    ₹
                    {product.price.toLocaleString(
                      "en-IN"
                    )}
                  </b>

                  <span>
                    ★{" "}
                    {product.rating}
                  </span>
                </div>

              </div>
            ))}

        </div>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>
        <div className="footer-inner">

          <div className="brand">
            <span className="brand-mark">
              S
            </span>

            <b>
              SmartBuy
            </b>
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

      {/* =================================================
          SEARCH MODAL
      ================================================= */}

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
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="search-input">

                <Search size={20} />

                <input
                  autoFocus
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search products, brands, categories…"
                />

                <button
                  type="button"
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
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setQuery(item)
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {query && (
                  <div className="results">

                    {filteredProducts
                      .slice(0, 5)
                      .map((product) => (
                        <Link
                          key={
                            product.id
                          }
                          href={`/products/${product.id}`}
                          onClick={() =>
                            setSearch(
                              false
                            )
                          }
                        >
                          <img
                            src={
                              product.img
                            }
                            alt={
                              product.name
                            }
                          />

                          <span>
                            <b>
                              {
                                product.name
                              }
                            </b>

                            <small>
                              {
                                product.cat
                              }{" "}
                              · ₹
                              {product.price.toLocaleString(
                                "en-IN"
                              )}
                            </small>
                          </span>

                          <ChevronRight
                            size={17}
                          />
                        </Link>
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
          type="button"
          onClick={() =>
            setAi(true)
          }
        >
          <Sparkles size={17} />
          SmartBuy AI
        </button>
      )}
    </main>
  );
}

/* =====================================================
   FLOAT CARD
===================================================== */

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
          type="button"
          onClick={onAdd}
        >
          +
        </button>
      ) : null}
    </motion.div>
  );
}

/* =====================================================
   PRODUCT CARD
===================================================== */

function ProductCard({
  product,
  liked,
  onLike,
  onAdd,
}: {
  product: Product;
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

        <span>
          {product.badge}
        </span>

        <button
          type="button"
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
          src={product.img}
          alt={product.name}
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
              type="button"
              onClick={onAdd}
            >
              Quick Add
            </button>

            <Link
              href={`/products/${product.id}`}
            >
              Quick View
            </Link>
          </motion.div>
        )}

      </div>

      <div className="p-info">

        <div className="p-title">

          <b>
            {product.name}
          </b>

          <span>
            ★ {product.rating}
          </span>

        </div>

        <div className="price">

          <strong>
            ₹
            {product.price.toLocaleString(
              "en-IN"
            )}
          </strong>

          <del>
            ₹
            {product.old.toLocaleString(
              "en-IN"
            )}
          </del>

        </div>

        <div className="p-actions">

          <button
            type="button"
            onClick={onAdd}
          >
            <ShoppingBag
              size={15}
            />

            Add to Cart
          </button>

          <button
            type="button"
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