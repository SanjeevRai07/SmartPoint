"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type OrderItem = {
  product_id?: number;
  name?: string;
  brand?: string;
  category?: string;
  price?: number;
  quantity?: number;
  image?: string;
};

type Order = {
  id: number;
  user_id: string;
  order_number: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  payment_id: string | null;
  razorpay_order_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyles(status: string) {
  const value = status.toLowerCase();

  if (
    value.includes("deliver") ||
    value.includes("complete")
  ) {
    return {
      background: "rgba(34,197,94,.12)",
      border: "1px solid rgba(34,197,94,.25)",
      color: "#86efac",
    };
  }

  if (
    value.includes("ship") ||
    value.includes("process")
  ) {
    return {
      background: "rgba(96,165,250,.12)",
      border: "1px solid rgba(96,165,250,.25)",
      color: "#93c5fd",
    };
  }

  if (value.includes("cancel")) {
    return {
      background: "rgba(239,68,68,.12)",
      border: "1px solid rgba(239,68,68,.25)",
      color: "#fca5a5",
    };
  }

  return {
    background: "rgba(139,92,246,.13)",
    border: "1px solid rgba(139,92,246,.25)",
    color: "#c4b5fd",
  };
}

function OrderCard({ order }: { order: Order }) {
  const statusStyle = getStatusStyles(order.order_status);

  const firstItem =
    Array.isArray(order.items)
      ? order.items[0]
      : undefined;

  const itemCount =
    Array.isArray(order.items)
      ? order.items.reduce(
          (total, item) =>
            total + Number(item.quantity || 0),
          0
        )
      : 0;

  return (
    <article
      style={{
        border: "1px solid rgba(255,255,255,.08)",
        background:
          "linear-gradient(145deg, rgba(20,18,30,.96), rgba(10,10,15,.96))",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 20px 60px rgba(0,0,0,.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "#8f7cff",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              marginBottom: 8,
            }}
          >
            ORDER
          </div>

          <h2
            style={{
              margin: 0,
              color: "#fff",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            #{order.order_number}
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginTop: 8,
              color: "#8f8b99",
              fontSize: 14,
            }}
          >
            <Clock3 size={15} />
            {formatDate(order.created_at)}
          </div>
        </div>

        <span
          style={{
            ...statusStyle,
            borderRadius: 999,
            padding: "9px 14px",
            fontSize: 13,
            fontWeight: 700,
            textTransform: "capitalize",
          }}
        >
          {order.order_status}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto",
          gap: 20,
          marginTop: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: 18,
              overflow: "hidden",
              background: "#181522",
              border: "1px solid rgba(255,255,255,.07)",
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            {firstItem?.image ? (
              <img
                src={firstItem.image}
                alt={firstItem.name || "Product"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Package
                size={28}
                color="#9b86ff"
              />
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: "#fff",
                fontSize: 17,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {firstItem?.name || "SmartBuy Order"}
            </div>

            <div
              style={{
                marginTop: 6,
                color: "#8f8b99",
                fontSize: 14,
              }}
            >
              {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"}
              {order.items?.length > 1
                ? ` • +${order.items.length - 1} more products`
                : ""}
            </div>

            <div
              style={{
                marginTop: 8,
                color: "#b9b4c2",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <CreditCard size={14} />
              {order.payment_method}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#8f8b99",
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            TOTAL
          </div>

          <div
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            {money(order.total_amount)}
          </div>

          <div
            style={{
              marginTop: 6,
              color:
                order.payment_status.toLowerCase() === "paid"
                  ? "#86efac"
                  : "#fbbf24",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "capitalize",
            }}
          >
            {order.payment_status}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          color: "#aaa5b2",
          fontSize: 14,
        }}
      >
        <MapPin
          size={17}
          color="#9b86ff"
          style={{
            marginTop: 2,
            flexShrink: 0,
          }}
        />

        <span>
          {order.delivery_address},{" "}
          {order.delivery_city},{" "}
          {order.delivery_state} -{" "}
          {order.delivery_pincode}
        </span>
      </div>

      <div
        style={{
          marginTop: 22,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Link
          href={`/orders/${encodeURIComponent(
            order.order_number
          )}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            borderRadius: 13,
            background:
              "linear-gradient(135deg,#7c5cff,#9b7cff)",
            color: "#fff",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 800,
            boxShadow:
              "0 10px 30px rgba(124,92,255,.25)",
          }}
        >
          View Details
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(
            sessionError.message
          );
        }

        if (!session?.user) {
          if (mounted) {
            setError(
              "Please login to view your orders."
            );
          }

          return;
        }

        const { data, error: ordersError } =
          await supabase
            .from("orders")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", {
              ascending: false,
            });

        if (ordersError) {
          throw new Error(
            ordersError.message
          );
        }

        if (mounted) {
          setOrders(
            ((data || []) as Order[]).map(
              (order) => ({
                ...order,
                items: Array.isArray(
                  order.items
                )
                  ? order.items
                  : [],
              })
            )
          );
        }
      } catch (err) {
        console.error(
          "Orders page error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load orders."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(124,92,255,.14), transparent 30%), #08080c",
        color: "#fff",
        padding: "32px 20px 70px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 38,
          }}
        >
          <div>
            <Link
              href="/account"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                color: "#9d98a7",
                textDecoration: "none",
                fontSize: 14,
                marginBottom: 18,
              }}
            >
              <ArrowLeft size={16} />
              Back to Account
            </Link>

            <div
              style={{
                color: "#8f7cff",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 2.5,
                marginBottom: 8,
              }}
            >
              SMARTBUY
            </div>

            <h1
              style={{
                margin: 0,
                fontSize:
                  "clamp(38px, 6vw, 62px)",
                lineHeight: 1,
                letterSpacing: -2.5,
                fontWeight: 800,
              }}
            >
              My Orders
              <span
                style={{
                  color: "#9b7cff",
                }}
              >
                .
              </span>
            </h1>

            <p
              style={{
                margin: "14px 0 0",
                color: "#8d8994",
                fontSize: 15,
              }}
            >
              Track and manage all your
              SmartBuy orders.
            </p>
          </div>

          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 17px",
              borderRadius: 13,
              background: "#14121b",
              border:
                "1px solid rgba(255,255,255,.08)",
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            <ShoppingBag size={17} />
            Continue Shopping
          </Link>
        </div>

        {loading && (
          <div
            style={{
              minHeight: 300,
              display: "grid",
              placeItems: "center",
              color: "#aaa5b2",
            }}
          >
            Loading your orders...
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              borderRadius: 22,
              padding: 28,
              background:
                "linear-gradient(145deg,#15131c,#0d0d12)",
              border:
                "1px solid rgba(255,255,255,.08)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                margin: "0 auto 16px",
                borderRadius: 18,
                display: "grid",
                placeItems: "center",
                background:
                  "rgba(124,92,255,.12)",
                color: "#a78bfa",
              }}
            >
              <User size={25} />
            </div>

            <h2
              style={{
                margin: "0 0 9px",
                fontSize: 22,
              }}
            >
              {error}
            </h2>

            <Link
              href="/account"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                marginTop: 10,
                color: "#b09cff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Go to Account
              <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <div
              style={{
                minHeight: 340,
                borderRadius: 24,
                padding: 35,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                background:
                  "linear-gradient(145deg,#15131c,#0d0d12)",
                border:
                  "1px solid rgba(255,255,255,.08)",
              }}
            >
              <div>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    margin: "0 auto 18px",
                    borderRadius: 22,
                    display: "grid",
                    placeItems: "center",
                    background:
                      "rgba(124,92,255,.12)",
                    color: "#a78bfa",
                  }}
                >
                  <Package size={30} />
                </div>

                <h2
                  style={{
                    margin: "0 0 9px",
                    fontSize: 25,
                  }}
                >
                  No orders yet
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: "#8d8994",
                    fontSize: 14,
                  }}
                >
                  Your purchased products
                  will appear here.
                </p>

                <Link
                  href="/products"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 22,
                    padding: "12px 18px",
                    borderRadius: 13,
                    background:
                      "linear-gradient(135deg,#7c5cff,#9b7cff)",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  Start Shopping
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: 18,
              }}
            >
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}
      </div>
    </main>
  );
}