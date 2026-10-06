"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  User,
  WalletCards,
  XCircle,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

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
  payment_id?: string | null;
  razorpay_order_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  items?: OrderItem[] | null;
  created_at: string;
  updated_at?: string | null;
};

type Props = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export default function OrderDetailsPage({
  params,
}: Props) {
  const [orderNumber, setOrderNumber] =
    useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const resolvedParams = await params;

        if (!active) {
          return;
        }

        const number = decodeURIComponent(
          resolvedParams.orderNumber
        );

        setOrderNumber(number);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Session error:",
            sessionError
          );

          setError(
            "Your login session could not be loaded."
          );

          setLoading(false);
          return;
        }

        const user = session?.user;

        if (!user) {
          setError(
            "Please login to view this order."
          );

          setLoading(false);
          return;
        }

        const { data, error: orderError } =
          await supabase
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .eq(
              "order_number",
              number
            )
            .single();

        if (orderError) {
          console.error(
            "Order details error:",
            orderError
          );

          setError(
            "This order could not be found."
          );

          setLoading(false);
          return;
        }

        if (!active) {
          return;
        }

        setOrder(data as Order);
        setLoading(false);
      } catch (err) {
        console.error(
          "Order details loading error:",
          err
        );

        if (!active) {
          return;
        }

        setError(
          "Unable to load this order."
        );

        setLoading(false);
      }
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [params]);

  if (loading) {
    return (
      <>
        <main className="page">
          <Header />

          <section className="center">
            <div className="state-icon">
              <RefreshCw
                size={27}
                className="spin"
              />
            </div>

            <h1>
              Loading order...
            </h1>

            <p>
              Please wait while we load your
              order details.
            </p>
          </section>
        </main>

        <Styles />
      </>
    );
  }

  if (error || !order) {
    const needsLogin =
      error
        .toLowerCase()
        .includes("login");

    return (
      <>
        <main className="page">
          <Header />

          <section className="center">
            <div className="state-icon error">
              <XCircle size={27} />
            </div>

            <h1>
              {needsLogin
                ? "Login required"
                : "Order not found"}
            </h1>

            <p>
              {error ||
                "We could not find this order."}
            </p>

            <div className="center-actions">
              {needsLogin ? (
                <Link
                  href="/account"
                  className="primary-button"
                >
                  Login
                </Link>
              ) : (
                <Link
                  href="/orders"
                  className="primary-button"
                >
                  Back to Orders
                </Link>
              )}

              <Link
                href="/"
                className="secondary-button"
              >
                <Home size={16} />
                Home
              </Link>
            </div>
          </section>
        </main>

        <Styles />
      </>
    );
  }

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const status =
    String(
      order.order_status || "placed"
    ).toLowerCase();

  const paymentStatus =
    String(
      order.payment_status || "pending"
    ).toLowerCase();

  const isCancelled =
    status === "cancelled" ||
    status === "canceled";

  const isDelivered =
    status === "delivered";

  const isShipped =
    status === "shipped";

  const isProcessing =
    status === "processing";

  return (
    <>
      <main className="page">
        <Header />

        <section className="container">
          <div className="breadcrumb">
            <Link href="/orders">
              <ArrowLeft size={15} />
              Back to My Orders
            </Link>
          </div>

          <div className="heading">
            <div>
              <div className="eyebrow">
                SMARTBUY ORDER
              </div>

              <h1>
                Order <span>Details.</span>
              </h1>

              <p>
                Order #{orderNumber}
              </p>
            </div>

            <div
              className={`status-badge ${
                isCancelled
                  ? "cancelled"
                  : isDelivered
                    ? "delivered"
                    : isShipped
                      ? "shipped"
                      : isProcessing
                        ? "processing"
                        : "placed"
              }`}
            >
              {isCancelled ? (
                <XCircle size={16} />
              ) : isDelivered ? (
                <CheckCircle2 size={16} />
              ) : isShipped ? (
                <Truck size={16} />
              ) : isProcessing ? (
                <Clock3 size={16} />
              ) : (
                <Package size={16} />
              )}

              {getOrderStatus(
                order.order_status
              )}
            </div>
          </div>

          <div className="layout">
            <div className="main">
              <section className="card">
                <div className="card-title">
                  <div className="card-icon">
                    <Truck size={18} />
                  </div>

                  <div>
                    <span>
                      ORDER TRACKING
                    </span>

                    <h2>
                      Delivery Status
                    </h2>
                  </div>
                </div>

                {isCancelled ? (
                  <div className="cancelled-box">
                    <XCircle size={20} />

                    <div>
                      <strong>
                        Order Cancelled
                      </strong>

                      <p>
                        This order has been
                        cancelled.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="timeline">
                    <TimelineStep
                      active
                      done
                      icon={
                        <Check size={15} />
                      }
                      title="Order Placed"
                      text={formatDateTime(
                        order.created_at
                      )}
                    />

                    <TimelineLine
                      active={
                        isProcessing ||
                        isShipped ||
                        isDelivered
                      }
                    />

                    <TimelineStep
                      active={
                        isProcessing ||
                        isShipped ||
                        isDelivered
                      }
                      done={
                        isShipped ||
                        isDelivered
                      }
                      icon={
                        <Package
                          size={15}
                        />
                      }
                      title="Processing"
                      text={
                        isProcessing ||
                        isShipped ||
                        isDelivered
                          ? "Your order is being prepared"
                          : "Waiting for processing"
                      }
                    />

                    <TimelineLine
                      active={
                        isShipped ||
                        isDelivered
                      }
                    />

                    <TimelineStep
                      active={
                        isShipped ||
                        isDelivered
                      }
                      done={isDelivered}
                      icon={
                        <Truck size={15} />
                      }
                      title="Shipped"
                      text={
                        isShipped ||
                        isDelivered
                          ? "Your order is on the way"
                          : "Awaiting shipment"
                      }
                    />

                    <TimelineLine
                      active={isDelivered}
                    />

                    <TimelineStep
                      active={
                        isDelivered
                      }
                      done={isDelivered}
                      icon={
                        <CheckCircle2
                          size={15}
                        />
                      }
                      title="Delivered"
                      text={
                        isDelivered
                          ? "Order delivered successfully"
                          : "Awaiting delivery"
                      }
                    />
                  </div>
                )}
              </section>

              <section className="card">
                <div className="card-title">
                  <div className="card-icon">
                    <ShoppingBag size={18} />
                  </div>

                  <div>
                    <span>
                      ORDER ITEMS
                    </span>

                    <h2>
                      Products
                    </h2>
                  </div>
                </div>

                <div className="items">
                  {items.length === 0 ? (
                    <div className="no-items">
                      Product details are not
                      available for this order.
                    </div>
                  ) : (
                    items.map(
                      (item, index) => (
                        <div
                          key={`${item.product_id ?? index}-${index}`}
                          className="item"
                        >
                          <div className="product-image">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={
                                  item.name ||
                                  "Product"
                                }
                              />
                            ) : (
                              <Package
                                size={25}
                              />
                            )}

                            <span>
                              {item.quantity ||
                                1}
                            </span>
                          </div>

                          <div className="product-info">
                            <span>
                              {item.category ||
                                "Product"}
                              {item.brand
                                ? ` • ${item.brand}`
                                : ""}
                            </span>

                            <strong>
                              {item.name ||
                                "Product"}
                            </strong>

                            <small>
                              Qty:{" "}
                              {item.quantity ||
                                1}
                            </small>
                          </div>

                          <strong className="product-price">
                            ₹
                            {(
                              Number(
                                item.price || 0
                              ) *
                              Number(
                                item.quantity ||
                                  1
                              )
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>
                      )
                    )
                  )}
                </div>
              </section>

              <section className="card">
                <div className="card-title">
                  <div className="card-icon">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <span>
                      DELIVERY DETAILS
                    </span>

                    <h2>
                      Shipping Address
                    </h2>
                  </div>
                </div>

                <div className="address">
                  <div className="address-name">
                    <User size={16} />

                    <strong>
                      {order.customer_name}
                    </strong>
                  </div>

                  <p>
                    {order.delivery_address}
                  </p>

                  <p>
                    {order.delivery_city},{" "}
                    {order.delivery_state}{" "}
                    -{" "}
                    {order.delivery_pincode}
                  </p>

                  {order.customer_phone && (
                    <span>
                      Phone:{" "}
                      {order.customer_phone}
                    </span>
                  )}

                  {order.customer_email && (
                    <span>
                      Email:{" "}
                      {order.customer_email}
                    </span>
                  )}
                </div>
              </section>
            </div>

            <aside className="sidebar">
              <section className="summary-card">
                <div className="card-title">
                  <div className="card-icon">
                    <WalletCards
                      size={18}
                    />
                  </div>

                  <div>
                    <span>
                      PAYMENT
                    </span>

                    <h2>
                      Order Summary
                    </h2>
                  </div>
                </div>

                <div className="summary-list">
                  <SummaryRow
                    label="Order ID"
                    value={
                      order.order_number
                    }
                  />

                  <SummaryRow
                    label="Payment Method"
                    value={formatPayment(
                      order.payment_method
                    )}
                  />

                  <SummaryRow
                    label="Payment Status"
                    value={formatPaymentStatus(
                      paymentStatus
                    )}
                    green={
                      paymentStatus ===
                        "paid" ||
                      paymentStatus ===
                        "success" ||
                      paymentStatus ===
                        "captured"
                    }
                  />

                  <div className="summary-divider" />

                  <SummaryRow
                    label="Total Amount"
                    value={`₹${Number(
                      order.total_amount
                    ).toLocaleString(
                      "en-IN"
                    )}`}
                    large
                  />
                </div>

                {order.payment_method ===
                  "cod" && (
                  <div className="cod-box">
                    <Truck size={16} />

                    <span>
                      Cash on Delivery
                      <small>
                        Payment will be
                        collected at
                        delivery.
                      </small>
                    </span>
                  </div>
                )}
              </section>

              <section className="help-card">
                <Package size={21} />

                <div className="eyebrow">
                  SMARTBUY SUPPORT
                </div>

                <h3>
                  Need help with this order?
                </h3>

                <p>
                  Keep your order ID ready for
                  any delivery or payment
                  assistance.
                </p>

                <Link
                  href="/products"
                  className="help-button"
                >
                  Continue Shopping
                </Link>
              </section>
            </aside>
          </div>
        </section>
      </main>

      <Styles />
    </>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link
          href="/"
          className="logo"
        >
          <span className="logo-mark">
            S
          </span>

          <strong>
            SmartBuy
          </strong>
        </Link>

        <div className="nav">
          <Link href="/products">
            <ShoppingBag size={15} />
            Products
          </Link>

          <Link href="/account">
            <User size={15} />
            Account
          </Link>
        </div>
      </div>
    </header>
  );
}

function TimelineStep({
  active,
  done,
  icon,
  title,
  text,
}: {
  active: boolean;
  done: boolean;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className={`timeline-step ${
        active ? "active" : ""
      }`}
    >
      <div
        className={`timeline-icon ${
          done ? "done" : ""
        }`}
      >
        {done ? (
          <Check size={15} />
        ) : (
          icon
        )}
      </div>

      <div>
        <strong>{title}</strong>

        <span>{text}</span>
      </div>
    </div>
  );
}

function TimelineLine({
  active,
}: {
  active: boolean;
}) {
  return (
    <div
      className={`timeline-line ${
        active ? "active" : ""
      }`}
    />
  );
}

function SummaryRow({
  label,
  value,
  green = false,
  large = false,
}: {
  label: string;
  value: string;
  green?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`summary-row ${
        large ? "large" : ""
      }`}
    >
      <span>{label}</span>

      <strong
        className={green ? "green" : ""}
      >
        {value}
      </strong>
    </div>
  );
}

function getOrderStatus(
  value: string
) {
  const status =
    String(value || "").toLowerCase();

  if (status === "delivered") {
    return "Delivered";
  }

  if (status === "shipped") {
    return "Shipped";
  }

  if (status === "processing") {
    return "Processing";
  }

  if (
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "Cancelled";
  }

  return "Order Placed";
}

function formatPayment(
  value: string
) {
  const payment =
    String(value || "").toLowerCase();

  if (payment === "cod") {
    return "Cash on Delivery";
  }

  if (payment === "razorpay") {
    return "Razorpay";
  }

  if (payment === "upi") {
    return "UPI";
  }

  if (payment === "card") {
    return "Card";
  }

  return value || "Payment";
}

function formatPaymentStatus(
  value: string
) {
  if (
    value === "paid" ||
    value === "success" ||
    value === "captured"
  ) {
    return "Paid";
  }

  if (value === "failed") {
    return "Failed";
  }

  return "Pending";
}

function formatDateTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Styles() {
  return (
    <style jsx global>{`
      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: #07070b;
        color: #f7f7fb;
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

      .page {
        min-height: 100vh;
        background:
          radial-gradient(
            circle at 87% 0%,
            rgba(111, 77, 255, 0.15),
            transparent 33%
          ),
          #07070b;
      }

      .header {
        position: sticky;
        top: 0;
        z-index: 20;
        border-bottom: 1px solid
          rgba(255, 255, 255, 0.07);
        background: rgba(7, 7, 11, 0.82);
        backdrop-filter: blur(18px);
      }

      .header-inner {
        width: min(
          1180px,
          calc(100% - 40px)
        );
        min-height: 76px;
        margin: 0 auto;

        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .logo {
        display: inline-flex;
        align-items: center;
        gap: 11px;
        font-size: 20px;
        letter-spacing: -0.04em;
      }

      .logo-mark {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;

        border-radius: 13px;

        background: linear-gradient(
          135deg,
          #6942f2,
          #8a65ff
        );

        font-weight: 900;
        font-size: 21px;

        box-shadow:
          0 13px 35px
          rgba(111, 76, 255, 0.28);
      }

      .nav {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .nav a {
        display: inline-flex;
        align-items: center;
        gap: 7px;

        padding: 10px 13px;

        border-radius: 11px;

        background: rgba(
          255,
          255,
          255,
          0.035
        );

        border: 1px solid
          rgba(
            255,
            255,
            255,
            0.06
          );

        color: #c9c9d2;

        font-size: 12px;
      }

      .container {
        width: min(
          1180px,
          calc(100% - 40px)
        );
        margin: 0 auto;

        padding: 40px 0 90px;
      }

      .breadcrumb {
        margin-bottom: 24px;
      }

      .breadcrumb a {
        display: inline-flex;
        align-items: center;
        gap: 7px;

        color: #93939f;
        font-size: 12px;
      }

      .heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        gap: 25px;

        margin-bottom: 28px;
      }

      .eyebrow {
        margin-bottom: 8px;

        color: #927eff;

        font-size: 10px;
        font-weight: 900;

        letter-spacing: 0.18em;
      }

      .heading h1 {
        margin: 0;

        font-size: clamp(
          42px,
          5vw,
          60px
        );

        line-height: 0.97;

        letter-spacing: -0.06em;
      }

      .heading h1 span {
        color: #9f8dff;
      }

      .heading p {
        margin: 14px 0 0;

        color: #858591;
        font-size: 13px;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 7px;

        padding: 10px 12px;

        border-radius: 10px;

        font-size: 11px;
        font-weight: 800;
      }

      .status-badge.placed {
        color: #bdadff;
        background: rgba(
          110,
          78,
          255,
          0.1
        );
      }

      .status-badge.processing {
        color: #ffd47d;
        background: rgba(
          255,
          188,
          73,
          0.09
        );
      }

      .status-badge.shipped {
        color: #7ccaff;
        background: rgba(
          55,
          173,
          255,
          0.08
        );
      }

      .status-badge.delivered {
        color: #7de1a2;
        background: rgba(
          70,
          211,
          124,
          0.08
        );
      }

      .status-badge.cancelled {
        color: #ff929d;
        background: rgba(
          255,
          78,
          96,
          0.08
        );
      }

      .layout {
        display: grid;

        grid-template-columns:
          minmax(0, 1fr)
          310px;

        gap: 18px;

        align-items: start;
      }

      .main {
        display: grid;
        gap: 18px;
      }

      .card,
      .summary-card,
      .help-card {
        padding: 23px;

        border-radius: 21px;

        background: rgba(
          255,
          255,
          255,
          0.032
        );

        border: 1px solid
          rgba(
            255,
            255,
            255,
            0.07
          );
      }

      .card-title {
        display: flex;
        align-items: center;

        gap: 12px;

        margin-bottom: 22px;
      }

      .card-icon {
        width: 40px;
        height: 40px;

        display: grid;
        place-items: center;

        border-radius: 12px;

        color: #a394ff;

        background: rgba(
          109,
          77,
          255,
          0.09
        );
      }

      .card-title span {
        display: block;

        margin-bottom: 4px;

        color: #686873;

        font-size: 9px;
        font-weight: 800;

        letter-spacing: 0.12em;
      }

      .card-title h2 {
        margin: 0;

        font-size: 19px;

        letter-spacing: -0.035em;
      }

      .timeline {
        display: grid;
      }

      .timeline-step {
        display: flex;
        align-items: center;

        gap: 13px;

        opacity: 0.38;
      }

      .timeline-step.active {
        opacity: 1;
      }

      .timeline-icon {
        width: 39px;
        height: 39px;

        flex-shrink: 0;

        display: grid;
        place-items: center;

        border-radius: 12px;

        color: #7a7986;

        background: rgba(
          255,
          255,
          255,
          0.045
        );

        border: 1px solid
          rgba(
            255,
            255,
            255,
            0.06
          );
      }

      .timeline-icon.done {
        color: #fff;

        background: linear-gradient(
          135deg,
          #6941f2,
          #8460ff
        );

        border-color: transparent;
      }

      .timeline-step strong {
        display: block;

        margin-bottom: 3px;

        font-size: 12px;
      }

      .timeline-step span {
        display: block;

        color: #777783;

        font-size: 10px;
      }

      .timeline-line {
        width: 1px;
        height: 26px;

        margin-left: 19px;

        background: rgba(
          255,
          255,
          255,
          0.07
        );
      }

      .timeline-line.active {
        background: #7655ff;
      }

      .cancelled-box {
        display: flex;
        align-items: flex-start;

        gap: 11px;

        padding: 15px;

        border-radius: 13px;

        color: #ff969f;

        background: rgba(
          255,
          78,
          96,
          0.07
        );

        border: 1px solid
          rgba(
            255,
            78,
            96,
            0.12
          );
      }

      .cancelled-box strong {
        display: block;

        margin-bottom: 4px;

        font-size: 12px;
      }

      .cancelled-box p {
        margin: 0;

        color: #9c7277;

        font-size: 10px;
      }

      .items {
        display: grid;
        gap: 10px;
      }

      .item {
        display: flex;

        align-items: center;

        gap: 12px;

        padding: 12px;

        border-radius: 14px;

        background: rgba(
          255,
          255,
          255,
          0.025
        );

        border: 1px solid
          rgba(
            255,
            255,
            255,
            0.045
          );
      }

      .product-image {
        position: relative;

        width: 58px;
        height: 58px;

        flex-shrink: 0;

        display: grid;
        place-items: center;

        border-radius: 13px;

        overflow: hidden;

        background: rgba(
          255,
          255,
          255,
          0.045
        );
      }

      .product-image img {
        width: 100%;
        height: 100%;

        object-fit: cover;
      }

      .product-image > svg {
        color: #827899;
      }

      .product-image span {
        position: absolute;

        top: 5px;
        right: 5px;

        min-width: 19px;
        height: 19px;

        display: grid;
        place-items: center;

        padding: 0 5px;

        border-radius: 7px;

        background: #6c47f3;
        color: white;

        font-size: 9px;
        font-weight: 800;
      }

      .product-info {
        flex: 1;

        min-width: 0;
      }

      .product-info > span {
        display: block;

        margin-bottom: 4px;

        overflow: hidden;

        text-overflow: ellipsis;

        white-space: nowrap;

        color: #686875;

        font-size: 9px;
      }

      .product-info strong {
        display: block;

        overflow: hidden;

        text-overflow: ellipsis;

        white-space: nowrap;

        font-size: 12px;
      }

      .product-info small {
        display: block;

        margin-top: 5px;

        color: #747480;

        font-size: 9px;
      }

      .product-price {
        flex-shrink: 0;

        font-size: 13px;
      }

      .no-items {
        padding: 20px;

        border-radius: 12px;

        color: #777783;

        background: rgba(
          255,
          255,
          255,
          0.025
        );

        font-size: 11px;
        text-align: center;
      }

      .address {
        padding: 17px;

        border-radius: 15px;

        background: rgba(
          255,
          255,
          255,
          0.025
        );

        border: 1px solid
          rgba(
            255,
            255,
            255,
            0.05
          );
      }

      .address-name {
        display: flex;
        align-items: center;
        gap: 7px;

        margin-bottom: 10px;

        color: #ececf2;

        font-size: 12px;
      }

      .address-name svg {
        color: #a08eff;
      }

      .address p {
        margin: 4px 0;

        color: #888894;

        font-size: 11px;

        line-height: 1.5;
      }

      .address > span {
        display: block;

        margin-top: 7px;

        color: #696974;

        font-size: 9px;
      }

      .sidebar {
        position: sticky;

        top: 96px;

        display: grid;

        gap: 18px;
      }

      .summary-list {
        display: grid;
        gap: 13px;
      }

      .summary-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 20px;
      }

      .summary-row span {
        color: #777783;

        font-size: 10px;
      }

      .summary-row strong {
        color: #e4e4eb;

        font-size: 11px;

        text-align: right;
      }

      .summary-row strong.green {
        color: #7de1a1;
      }

      .summary-row.large span {
        color: #9898a3;

        font-size: 11px;
      }

      .summary-row.large strong {
        color: #fff;

        font-size: 22px;

        letter-spacing: -0.04em;
      }

      .summary-divider {
        height: 1px;

        background: rgba(
          255,
          255,
          255,
          0.06
        );

        margin: 2px 0;
      }

      .cod-box {
        display: flex;
        align-items: flex-start;

        gap: 8px;

        margin-top: 18px;

        padding: 11px;

        border-radius: 11px;

        color: #aaa2cf;

        background: rgba(
          109,
          78,
          255,
          0.055
        );

        border: 1px solid
          rgba(
            109,
            78,
            255,
            0.09
          );

        font-size: 10px;
      }

      .cod-box > svg {
        flex-shrink: 0;
      }

      .cod-box small {
        display: block;

        margin-top: 4px;

        color: #777286;

        line-height: 1.4;
      }

      .help-card {
        background:
          linear-gradient(
            145deg,
            rgba(
              110,
              79,
              255,
              0.12
            ),
            rgba(
              255,
              255,
              255,
              0.025
            )
          );
      }

      .help-card > svg {
        width: 42px;
        height: 42px;

        padding: 10px;

        margin-bottom: 14px;

        border-radius: 12px;

        color: #aa98ff;

        background: rgba(
          111,
          78,
          255,
          0.1
        );
      }

      .help-card h3 {
        margin: 0 0 9px;

        font-size: 18px;

        line-height: 1.2;
      }

      .help-card p {
        margin: 0;

        color: #858590;

        font-size: 11px;

        line-height: 1.6;
      }

      .help-button {
        display: flex;

        align-items: center;
        justify-content: center;

        margin-top: 18px;

        padding: 12px;

        border-radius: 11px;

        background: linear-gradient(
          135deg,
          #6840f2,
          #8560ff
        );

        font-size: 11px;
        font-weight: 800;
      }

      .center {
        min-height: calc(
          100vh - 76px
        );

        display: flex;

        align-items: center;

        justify-content: center;

        flex-direction: column;

        text-align: center;

        padding: 30px;
      }

      .state-icon {
        width: 64px;
        height: 64px;

        display: grid;
        place-items: center;

        margin-bottom: 18px;

        border-radius: 18px;

        color: #a392ff;

        background: rgba(
          110,
          78,
          255,
          0.1
        );
      }

      .state-icon.error {
        color: #ff949e;

        background: rgba(
          255,
          78,
          96,
          0.08
        );
      }

      .center h1 {
        margin: 0;

        font-size: 28px;
      }

      .center p {
        max-width: 500px;

        margin: 10px 0 20px;

        color: #81818c;

        font-size: 13px;

        line-height: 1.6;
      }

      .center-actions {
        display: flex;

        gap: 9px;

        flex-wrap: wrap;

        justify-content: center;
      }

      .primary-button,
      .secondary-button {
        display: inline-flex;

        align-items: center;

        justify-content: center;

        gap: 7px;

        padding: 12px 16px;

        border-radius: 11px;

        font-size: 11px;

        font-weight: 800;
      }

      .primary-button {
        color: #fff;

        background: linear-gradient(
          135deg,
          #6941f2,
          #8561ff
        );
      }

      .secondary-button {
        color: #dddde5;

        background: rgba(
          255,
          255,
          255,
          0.04
        );

        border: 1px solid
          rgba(
            255,
            255,
            255,
            0.07
          );
      }

      .spin {
        animation: spin 0.85s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(
            0deg
          );
        }

        to {
          transform: rotate(
            360deg
          );
        }
      }

      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }

        .sidebar {
          position: static;
        }
      }

      @media (max-width: 650px) {
        .header-inner,
        .container {
          width: calc(
            100% - 28px
          );
        }

        .heading {
          flex-direction: column;
          align-items: flex-start;
        }

        .order-header {
          flex-direction: column;
        }

        .bottom {
          flex-direction: column;
        }

        .total {
          text-align: left;
        }
      }

      @media (max-width: 460px) {
        .nav a:first-child {
          display: none;
        }

        .item {
          align-items: flex-start;
        }

        .product-price {
          font-size: 12px;
        }

        .heading h1 {
          font-size: 43px;
        }
      }
    `}</style>
  );
}