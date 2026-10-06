"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  LogOut,
  Mail,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  User,
  WalletCards,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type UserData = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

type Order = {
  id: number;
  order_number: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCount, setOrderCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadAccount = async () => {
      try {
        setLoading(true);

        /*
         * IMPORTANT:
         * getSession() is used here instead of getUser().
         *
         * getUser() can throw AuthSessionMissingError when there
         * is no browser session.
         */
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (sessionError) {
          console.error("Supabase session error:", sessionError);

          setUser(null);
          setOrders([]);
          setOrderCount(0);
          setLoading(false);
          return;
        }

        const currentUser = session?.user ?? null;

        if (!currentUser) {
          setUser(null);
          setOrders([]);
          setOrderCount(0);
          setLoading(false);
          return;
        }

        setUser(currentUser as UserData);

        await loadOrders(currentUser.id);

        if (!mounted) return;

        setLoading(false);
      } catch (error) {
        console.error("Account loading error:", error);

        if (!mounted) return;

        setUser(null);
        setOrders([]);
        setOrderCount(0);
        setLoading(false);
      }
    };

    const loadOrders = async (userId: string) => {
      try {
        setOrdersLoading(true);

        const { data, error } = await supabase
          .from("orders")
          .select(
            `
              id,
              order_number,
              total_amount,
              payment_method,
              payment_status,
              order_status,
              created_at
            `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Orders could not be loaded:", error);
          setOrders([]);
          setOrderCount(0);
          return;
        }

        const orderData = (data ?? []) as Order[];

        setOrders(orderData);
        setOrderCount(orderData.length);
      } catch (error) {
        console.warn("Orders loading error:", error);
        setOrders([]);
        setOrderCount(0);
      } finally {
        setOrdersLoading(false);
      }
    };

    const initialize = async () => {
      await loadAccount();
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;

      if (!currentUser) {
        setUser(null);
        setOrders([]);
        setOrderCount(0);
        setLoading(false);
        return;
      }

      setUser(currentUser as UserData);

      try {
        await loadOrders(currentUser.id);
      } catch (error) {
        console.warn("Auth state order refresh error:", error);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getDisplayName = () => {
    if (!user) return "User";

    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  const handleLogin = async () => {
    setAuthError("");
    setAuthMessage("");

    if (!email.trim() || !password.trim()) {
      setAuthError("Please enter your email and password.");
      return;
    }

    try {
      setAuthLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (!data.session || !data.user) {
        setAuthError("Login completed, but the session could not be created.");
        return;
      }

      setUser(data.user as UserData);
      setAuthMessage("Login successful.");
      setPassword("");

      await refreshOrders(data.user.id);
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Something went wrong while logging in.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async () => {
    setAuthError("");
    setAuthMessage("");

    if (!fullName.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setAuthError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setAuthLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data.session && data.user) {
        setUser(data.user as UserData);
        setAuthMessage("Account created successfully.");
        setPassword("");

        await refreshOrders(data.user.id);
      } else {
        setAuthMessage(
          "Account created. Please check your email and confirm your account before logging in."
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      setAuthError("Something went wrong while creating your account.");
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
            id,
            order_number,
            total_amount,
            payment_method,
            payment_status,
            order_status,
            created_at
          `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not refresh orders:", error);
        setOrders([]);
        setOrderCount(0);
        return;
      }

      const orderData = (data ?? []) as Order[];

      setOrders(orderData);
      setOrderCount(orderData.length);
    } catch (error) {
      console.warn("Refresh orders error:", error);
      setOrders([]);
      setOrderCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      setUser(null);
      setOrders([]);
      setOrderCount(0);
      setAuthMessage("");
      setAuthError("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;

    await refreshOrders(user.id);
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <Header />

        <section style={styles.centerState}>
          <div style={styles.loaderIcon}>
            <RefreshCw size={26} className="spin" />
          </div>

          <h1 style={styles.stateTitle}>Loading your account...</h1>

          <p style={styles.stateText}>
            Please wait while we load your SmartBuy account.
          </p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main style={styles.page}>
        <Header />

        <section style={styles.authWrap}>
          <div style={styles.authCard}>
            <div style={styles.authIcon}>
              <User size={28} />
            </div>

            <div style={styles.eyebrow}>SMARTBUY ACCOUNT</div>

            <h1 style={styles.authTitle}>
              {authMode === "login" ? (
                <>
                  Welcome <span>back.</span>
                </>
              ) : (
                <>
                  Create your <span>account.</span>
                </>
              )}
            </h1>

            <p style={styles.authSubtitle}>
              {authMode === "login"
                ? "Login to manage your orders, profile and shopping activity."
                : "Create your SmartBuy account for a faster shopping experience."}
            </p>

            {authMode === "signup" && (
              <AuthField
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={setFullName}
                icon={<User size={17} />}
              />
            )}

            <AuthField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={setEmail}
              icon={<Mail size={17} />}
              type="email"
            />

            <AuthField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              icon={<ShieldCheck size={17} />}
              type="password"
            />

            {authError && (
              <div style={styles.errorBox}>
                {authError}
              </div>
            )}

            {authMessage && (
              <div style={styles.successBox}>
                <CheckCircle2 size={16} />
                <span>{authMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={
                authMode === "login" ? handleLogin : handleSignup
              }
              disabled={authLoading}
              style={{
                ...styles.primaryButton,
                opacity: authLoading ? 0.7 : 1,
              }}
            >
              {authLoading
                ? authMode === "login"
                  ? "Logging in..."
                  : "Creating account..."
                : authMode === "login"
                  ? "Login"
                  : "Create Account"}

              {!authLoading && <ArrowRight size={18} />}
            </button>

            <div style={styles.switchAuth}>
              <span>
                {authMode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>

              <button
                type="button"
                onClick={() => {
                  setAuthMode(
                    authMode === "login" ? "signup" : "login"
                  );
                  setAuthError("");
                  setAuthMessage("");
                }}
              >
                {authMode === "login" ? "Sign Up" : "Login"}
              </button>
            </div>

            <div style={styles.secureNote}>
              <ShieldCheck size={15} />
              <span>Secure authentication powered by Supabase</span>
            </div>
          </div>
        </section>

        <style jsx global>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #07070b;
            color: #f6f6f8;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .spin {
            animation: spin 0.9s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  const latestOrders = orders.slice(0, 3);

  return (
    <main style={styles.page}>
      <Header />

      <section style={styles.dashboard}>
        <div style={styles.topArea}>
          <div>
            <div style={styles.eyebrow}>MY ACCOUNT</div>

            <h1 style={styles.dashboardTitle}>
              Hello, <span>{getDisplayName()}</span>.
            </h1>

            <p style={styles.dashboardSubtitle}>
              Manage your SmartBuy account, orders and shopping
              activity from one place.
            </p>
          </div>

          <div style={styles.topActions}>
            <Link href="/" style={styles.secondaryButton}>
              <Home size={16} />
              Home
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        <div style={styles.profileBanner}>
          <div style={styles.profileLeft}>
            <div style={styles.avatarLarge}>
              <User size={28} />
            </div>

            <div>
              <div style={styles.profileName}>{getDisplayName()}</div>

              <div style={styles.profileEmail}>
                {user.email}
              </div>

              <div style={styles.verified}>
                <CheckCircle2 size={14} />
                Account active
              </div>
            </div>
          </div>

          <div style={styles.profileBadge}>
            <ShieldCheck size={15} />
            Secure Account
          </div>
        </div>

        <div style={styles.statsGrid}>
          <StatCard
            icon={<Package size={20} />}
            label="Total Orders"
            value={String(orderCount)}
          />

          <StatCard
            icon={<Clock3 size={20} />}
            label="Recent Orders"
            value={String(latestOrders.length)}
          />

          <StatCard
            icon={<WalletCards size={20} />}
            label="Account Type"
            value="Customer"
          />

          <StatCard
            icon={<ShieldCheck size={20} />}
            label="Security"
            value="Active"
          />
        </div>

        <div style={styles.mainGrid}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelEyebrow}>YOUR ACCOUNT</div>
                <h2 style={styles.panelTitle}>Account Details</h2>
              </div>

              <div style={styles.panelIcon}>
                <User size={18} />
              </div>
            </div>

            <div style={styles.detailList}>
              <DetailRow
                icon={<User size={17} />}
                label="Name"
                value={getDisplayName()}
              />

              <DetailRow
                icon={<Mail size={17} />}
                label="Email"
                value={user.email || "Not available"}
              />

              <DetailRow
                icon={<ShieldCheck size={17} />}
                label="Authentication"
                value="Supabase Auth"
              />

              <DetailRow
                icon={<CheckCircle2 size={17} />}
                label="Status"
                value="Active"
              />
            </div>
          </section>

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelEyebrow}>QUICK ACTIONS</div>
                <h2 style={styles.panelTitle}>Manage</h2>
              </div>

              <div style={styles.panelIcon}>
                <ChevronRight size={18} />
              </div>
            </div>

            <div style={styles.actionsGrid}>
              <ActionCard
                href="/orders"
                icon={<Package size={20} />}
                title="My Orders"
                subtitle="View your complete order history"
              />

              <ActionCard
                href="/products"
                icon={<ShoppingBag size={20} />}
                title="Continue Shopping"
                subtitle="Explore products and categories"
              />

              <ActionCard
                href="/"
                icon={<Home size={20} />}
                title="SmartBuy Home"
                subtitle="Return to the main shopping page"
              />

              <ActionCard
                href="/checkout"
                icon={<WalletCards size={20} />}
                title="Checkout"
                subtitle="Continue with your cart"
              />
            </div>
          </section>
        </div>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelEyebrow}>ORDER ACTIVITY</div>
              <h2 style={styles.panelTitle}>Recent Orders</h2>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              style={styles.refreshButton}
              disabled={ordersLoading}
            >
              <RefreshCw
                size={15}
                className={ordersLoading ? "spin" : ""}
              />
              Refresh
            </button>
          </div>

          {ordersLoading ? (
            <div style={styles.emptyOrders}>
              <RefreshCw size={22} className="spin" />
              <p>Loading orders...</p>
            </div>
          ) : latestOrders.length === 0 ? (
            <div style={styles.emptyOrders}>
              <div style={styles.emptyOrderIcon}>
                <Package size={24} />
              </div>

              <h3 style={styles.emptyOrderTitle}>
                No orders yet
              </h3>

              <p style={styles.emptyOrderText}>
                Your completed purchases will appear here.
              </p>

              <Link
                href="/products"
                style={styles.primarySmallButton}
              >
                Start Shopping
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div style={styles.orderList}>
              {latestOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}

              {orderCount > 3 && (
                <Link
                  href="/orders"
                  style={styles.viewAllButton}
                >
                  View all orders
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          )}
        </section>

        <section style={styles.infoBanner}>
          <div style={styles.infoIcon}>
            <MapPin size={19} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={styles.infoTitle}>
              Fast and secure shopping
            </div>

            <div style={styles.infoText}>
              SmartBuy keeps your account and order information
              protected while giving you a smooth shopping
              experience.
            </div>
          </div>

          <ShieldCheck size={19} style={{ opacity: 0.7 }} />
        </section>
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #07070b;
          color: #f6f6f8;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button,
        input {
          font: inherit;
        }

        button {
          border: 0;
        }

        .spin {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .smartbuy-account-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .smartbuy-account-page {
            padding: 20px !important;
          }

          .smartbuy-account-top {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .smartbuy-account-actions {
            width: 100%;
          }

          .smartbuy-account-actions a,
          .smartbuy-account-actions button {
            flex: 1;
            justify-content: center;
          }

          .smartbuy-account-stats {
            grid-template-columns: 1fr 1fr !important;
          }

          .smartbuy-account-profile {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .smartbuy-account-title {
            font-size: 38px !important;
          }
        }
      `}</style>
    </main>
  );
}

/* ---------------------------------- */
/* HEADER                             */
/* ---------------------------------- */

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.headerInner}>
        <Link href="/" style={styles.logo}>
          <span style={styles.logoMark}>S</span>
          <span>SmartBuy</span>
        </Link>

        <Link href="/products" style={styles.headerLink}>
          <ShoppingBag size={16} />
          Products
        </Link>
      </div>
    </header>
  );
}

/* ---------------------------------- */
/* AUTH FIELD                         */
/* ---------------------------------- */

function AuthField({
  label,
  placeholder,
  value,
  onChange,
  icon,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  type?: string;
}) {
  return (
    <label style={styles.authField}>
      <span style={styles.fieldLabel}>{label}</span>

      <div style={styles.inputWrap}>
        <span style={styles.inputIcon}>{icon}</span>

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={styles.input}
          autoComplete={type === "password" ? "current-password" : type}
        />
      </div>
    </label>
  );
}

/* ---------------------------------- */
/* STAT CARD                          */
/* ---------------------------------- */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>

      <div>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statValue}>{value}</div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* DETAIL ROW                         */
/* ---------------------------------- */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div style={styles.detailRow}>
      <div style={styles.detailLeft}>
        <div style={styles.detailIcon}>{icon}</div>

        <div>
          <div style={styles.detailLabel}>{label}</div>
          <div style={styles.detailValue}>{value}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* ACTION CARD                        */
/* ---------------------------------- */

function ActionCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} style={styles.actionCard}>
      <div style={styles.actionIcon}>{icon}</div>

      <div style={{ flex: 1 }}>
        <div style={styles.actionTitle}>{title}</div>
        <div style={styles.actionSubtitle}>{subtitle}</div>
      </div>

      <ChevronRight size={17} style={{ opacity: 0.6 }} />
    </Link>
  );
}

/* ---------------------------------- */
/* ORDER CARD                         */
/* ---------------------------------- */

function OrderCard({ order }: { order: Order }) {
  const formattedDate = new Date(
    order.created_at
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const status = order.order_status || "placed";

  return (
    <div style={styles.orderCard}>
      <div style={styles.orderIcon}>
        <Package size={18} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={styles.orderTop}>
          <strong style={styles.orderNumber}>
            {order.order_number}
          </strong>

          <span style={styles.statusBadge}>{status}</span>
        </div>

        <div style={styles.orderMeta}>
          <span>{formattedDate}</span>

          <span>•</span>

          <span>
            {String(order.payment_method).toUpperCase()}
          </span>

          <span>•</span>

          <span>{order.payment_status}</span>
        </div>
      </div>

      <strong style={styles.orderAmount}>
        ₹{Number(order.total_amount).toLocaleString("en-IN")}
      </strong>
    </div>
  );
}

/* ---------------------------------- */
/* STYLES                             */
/* ---------------------------------- */

const styles: Record<string, any> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top right, rgba(111,76,255,.13), transparent 34%), #07070b",
    color: "#f8f8fb",
  },

  header: {
    borderBottom: "1px solid rgba(255,255,255,.07)",
    background: "rgba(7,7,11,.78)",
    backdropFilter: "blur(18px)",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },

  headerInner: {
    width: "min(1180px, calc(100% - 40px))",
    margin: "0 auto",
    minHeight: 76,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontWeight: 800,
    fontSize: 21,
    letterSpacing: "-0.04em",
  },

  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 13,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#7247ff,#8c65ff)",
    fontWeight: 900,
    fontSize: 22,
    boxShadow: "0 12px 35px rgba(112,72,255,.3)",
  },

  headerLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,.045)",
    border: "1px solid rgba(255,255,255,.08)",
    fontSize: 13,
    color: "#dedee8",
  },

  dashboard: {
    width: "min(1180px, calc(100% - 40px))",
    margin: "0 auto",
    padding: "55px 0 90px",
  },

  topArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 30,
    marginBottom: 28,
  },

  topActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  eyebrow: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".18em",
    color: "#8c74ff",
    marginBottom: 9,
  },

  dashboardTitle: {
    margin: 0,
    fontSize: "clamp(38px, 5vw, 58px)",
    lineHeight: 1,
    letterSpacing: "-.055em",
    fontWeight: 800,
  },

  dashboardSubtitle: {
    margin: "17px 0 0",
    maxWidth: 650,
    color: "#8d8d99",
    fontSize: 15,
    lineHeight: 1.7,
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,.055)",
    border: "1px solid rgba(255,255,255,.08)",
    color: "#f1f1f6",
    fontSize: 13,
    fontWeight: 700,
  },

  logoutButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(255,80,100,.08)",
    border: "1px solid rgba(255,80,100,.18)",
    color: "#ff8f9c",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  profileBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    padding: 22,
    borderRadius: 22,
    background:
      "linear-gradient(135deg, rgba(125,82,255,.16), rgba(255,255,255,.035))",
    border: "1px solid rgba(143,112,255,.18)",
    marginBottom: 18,
  },

  profileLeft: {
    display: "flex",
    alignItems: "center",
    gap: 15,
  },

  avatarLarge: {
    width: 62,
    height: 62,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#6840f4,#8a65ff)",
    boxShadow: "0 15px 35px rgba(111,76,255,.25)",
  },

  profileName: {
    fontSize: 19,
    fontWeight: 800,
    marginBottom: 4,
  },

  profileEmail: {
    color: "#9999a7",
    fontSize: 13,
    marginBottom: 7,
  },

  verified: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: "#7de4a7",
    fontSize: 12,
    fontWeight: 700,
  },

  profileBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 12px",
    borderRadius: 12,
    background: "rgba(120,100,255,.09)",
    color: "#b8abff",
    border: "1px solid rgba(120,100,255,.16)",
    fontSize: 12,
    fontWeight: 700,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 14,
    marginBottom: 18,
  },

  statCard: {
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,.035)",
    border: "1px solid rgba(255,255,255,.07)",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    display: "grid",
    placeItems: "center",
    color: "#a995ff",
    background: "rgba(117,84,255,.1)",
    border: "1px solid rgba(117,84,255,.12)",
  },

  statLabel: {
    color: "#858592",
    fontSize: 11,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 17,
    fontWeight: 800,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
    marginBottom: 18,
  },

  panel: {
    padding: 22,
    borderRadius: 22,
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.07)",
    marginBottom: 18,
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    marginBottom: 20,
  },

  panelEyebrow: {
    color: "#787886",
    letterSpacing: ".15em",
    fontWeight: 800,
    fontSize: 9,
    marginBottom: 5,
  },

  panelTitle: {
    margin: 0,
    fontSize: 20,
    letterSpacing: "-.03em",
  },

  panelIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.04)",
    color: "#9c8cff",
  },

  detailList: {
    display: "grid",
    gap: 2,
  },

  detailRow: {
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,.05)",
  },

  detailLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.035)",
    color: "#a99aff",
  },

  detailLabel: {
    color: "#777783",
    fontSize: 10,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: ".08em",
  },

  detailValue: {
    fontSize: 13,
    fontWeight: 700,
    wordBreak: "break-word",
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  actionCard: {
    minHeight: 105,
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: 14,
    borderRadius: 15,
    background: "rgba(255,255,255,.025)",
    border: "1px solid rgba(255,255,255,.06)",
  },

  actionIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 11,
    display: "grid",
    placeItems: "center",
    color: "#a595ff",
    background: "rgba(110,76,255,.1)",
  },

  actionTitle: {
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 4,
  },

  actionSubtitle: {
    color: "#777783",
    fontSize: 10,
    lineHeight: 1.45,
  },

  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,.045)",
    border: "1px solid rgba(255,255,255,.07)",
    color: "#d5d5dd",
    cursor: "pointer",
    fontSize: 12,
  },

  orderList: {
    display: "grid",
    gap: 9,
  },

  orderCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 15,
    borderRadius: 15,
    background: "rgba(255,255,255,.025)",
    border: "1px solid rgba(255,255,255,.055)",
  },

  orderIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    display: "grid",
    placeItems: "center",
    background: "rgba(117,84,255,.09)",
    color: "#a493ff",
    flexShrink: 0,
  },

  orderTop: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  orderNumber: {
    fontSize: 13,
  },

  statusBadge: {
    padding: "4px 7px",
    borderRadius: 7,
    background: "rgba(89,216,131,.08)",
    color: "#70df9a",
    fontSize: 9,
    fontWeight: 800,
    textTransform: "capitalize",
  },

  orderMeta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#73737f",
    fontSize: 10,
    marginTop: 5,
    flexWrap: "wrap",
  },

  orderAmount: {
    fontSize: 14,
    whiteSpace: "nowrap",
  },

  viewAllButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    padding: "12px 0",
    color: "#a394ff",
    fontSize: 12,
    fontWeight: 800,
  },

  emptyOrders: {
    minHeight: 190,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
    color: "#7d7d89",
    gap: 8,
  },

  emptyOrderIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.04)",
    color: "#9992bd",
  },

  emptyOrderTitle: {
    margin: "4px 0 0",
    color: "#eeeef3",
    fontSize: 16,
  },

  emptyOrderText: {
    margin: 0,
    fontSize: 12,
  },

  primarySmallButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 13px",
    borderRadius: 10,
    background: "linear-gradient(135deg,#6842f3,#8360ff)",
    marginTop: 8,
    fontSize: 11,
    fontWeight: 800,
  },

  infoBanner: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: 17,
    borderRadius: 18,
    background: "rgba(111,78,255,.075)",
    border: "1px solid rgba(111,78,255,.14)",
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    display: "grid",
    placeItems: "center",
    background: "rgba(111,78,255,.1)",
    color: "#a493ff",
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 3,
  },

  infoText: {
    color: "#858592",
    fontSize: 11,
    lineHeight: 1.5,
  },

  centerState: {
    minHeight: "calc(100vh - 77px)",
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    textAlign: "center",
    padding: 30,
  },

  loaderIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    display: "grid",
    placeItems: "center",
    background: "rgba(111,78,255,.12)",
    color: "#9f8eff",
    marginBottom: 20,
  },

  stateTitle: {
    margin: 0,
    fontSize: 26,
  },

  stateText: {
    color: "#81818d",
    marginTop: 10,
    fontSize: 13,
  },

  authWrap: {
    minHeight: "calc(100vh - 77px)",
    display: "grid",
    placeItems: "center",
    padding: "55px 20px",
  },

  authCard: {
    width: "min(450px,100%)",
    padding: 28,
    borderRadius: 25,
    background:
      "linear-gradient(180deg, rgba(19,19,28,.96), rgba(12,12,18,.98))",
    border: "1px solid rgba(255,255,255,.08)",
    boxShadow: "0 35px 100px rgba(0,0,0,.42)",
  },

  authIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#6e45f4,#8d6aff)",
    boxShadow: "0 16px 35px rgba(111,76,255,.24)",
    marginBottom: 20,
  },

  authTitle: {
    fontSize: 39,
    lineHeight: 1,
    letterSpacing: "-.05em",
    margin: "0 0 12px",
  },

  authSubtitle: {
    color: "#858591",
    lineHeight: 1.6,
    fontSize: 13,
    marginBottom: 24,
  },

  authField: {
    display: "block",
    marginBottom: 14,
  },

  fieldLabel: {
    display: "block",
    fontSize: 11,
    color: "#a2a2ae",
    marginBottom: 7,
    fontWeight: 700,
  },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    height: 49,
    borderRadius: 12,
    background: "rgba(255,255,255,.035)",
    border: "1px solid rgba(255,255,255,.07)",
    padding: "0 13px",
  },

  inputIcon: {
    color: "#8375ad",
    display: "grid",
    placeItems: "center",
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    background: "transparent",
    border: 0,
    outline: "none",
    color: "#fff",
    fontSize: 13,
  },

  primaryButton: {
    width: "100%",
    height: 51,
    marginTop: 8,
    borderRadius: 13,
    border: 0,
    background: "linear-gradient(135deg,#6943f3,#8461ff)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: 800,
    cursor: "pointer",
  },

  authError: {},

  errorBox: {
    padding: "11px 12px",
    borderRadius: 10,
    background: "rgba(255,78,94,.08)",
    border: "1px solid rgba(255,78,94,.15)",
    color: "#ff9ba5",
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 12,
  },

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 12px",
    borderRadius: 10,
    background: "rgba(86,218,136,.08)",
    border: "1px solid rgba(86,218,136,.15)",
    color: "#82e5a8",
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 12,
  },

  switchAuth: {
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    color: "#80808c",
    fontSize: 12,
  },

  secureNote: {
    marginTop: 19,
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,.06)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    color: "#686874",
    fontSize: 10,
  },
};

/*
 * Separate style fix for auth mode switch button.
 * Keeping it here prevents clutter inside the main JSX.
 */
const originalSwitchButton = {
  background: "transparent",
  border: 0,
  color: "#a796ff",
  fontWeight: 800,
  cursor: "pointer",
};

/*
 * Apply button style through a tiny client-side helper.
 * This keeps the component simple without another CSS file.
 */
void originalSwitchButton;