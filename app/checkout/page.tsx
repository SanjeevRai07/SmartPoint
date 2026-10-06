"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  User,
  Wallet,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { useCart } from "../../components/CartProvider";
import { products } from "../../lib/products";
import styles from "./Checkout.module.css";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type PaymentMethod =
  | "razorpay"
  | "upi"
  | "card"
  | "cod";

type OrderSuccess = {
  orderNumber: string;
  paymentMethod: PaymentMethod;
  total: number;
};

type RazorpayOrderResponse = {
  success: boolean;
  key_id?: string;
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  error?: string;
};

type RazorpayVerificationResponse = {
  success: boolean;
  verified?: boolean;
  error?: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: string,
    handler: (response: unknown) => void
  ) => void;
};

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function CheckoutPage() {
  const { lines, itemCount } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("razorpay");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);

  const [orderSuccess, setOrderSuccess] =
    useState<OrderSuccess | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const items = useMemo(() => {
    return lines
      .map((line) => {
        const product = products.find(
          (product) => product.id === line.productId
        );

        if (!product) {
          return null;
        }

        return {
          product,
          qty: line.qty,
        };
      })
      .filter(Boolean) as {
      product: (typeof products)[number];
      qty: number;
    }[];
  }, [lines]);

  const subtotal = items.reduce(
    (total, item) =>
      total + item.product.price * item.qty,
    0
  );

  const delivery =
    subtotal >= 499 || subtotal === 0 ? 0 : 79;

  const discount =
    subtotal >= 3000
      ? Math.min(500, Math.round(subtotal * 0.1))
      : 0;

  const total = subtotal + delivery - discount;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (!user) {
          return;
        }

        setForm((current) => ({
          ...current,

          email:
            current.email ||
            user.email ||
            "",

          name:
            current.name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "",
        }));
      } catch (error) {
        console.error(
          "Could not load checkout user:",
          error
        );
      }
    };

    loadUser();
  }, []);

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addressValid =
    form.name.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.pincode.trim();

  const validateAddress = () => {
    setErrorMessage("");

    if (!form.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setErrorMessage(
        "Please enter a valid 10-digit phone number."
      );
      return false;
    }

    if (!form.address.trim()) {
      setErrorMessage("Please enter your delivery address.");
      return false;
    }

    if (!form.city.trim()) {
      setErrorMessage("Please enter your city.");
      return false;
    }

    if (!form.state.trim()) {
      setErrorMessage("Please enter your state.");
      return false;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setErrorMessage(
        "Please enter a valid 6-digit PIN code."
      );
      return false;
    }

    return true;
  };

  const createOrderInDatabase = async ({
    paymentStatus,
    paymentId = null,
    razorpayOrderId = null,
  }: {
    paymentStatus: string;
    paymentId?: string | null;
    razorpayOrderId?: string | null;
  }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      throw new Error(
        "Please login before placing your order."
      );
    }

    const orderNumber = `SB-${Date.now()
      .toString()
      .slice(-8)}`;

    const orderItems = items.map(
      ({ product, qty }) => ({
        product_id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.cat,
        price: product.price,
        quantity: qty,
        image: product.img,
      })
    );

    const { error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,

        order_number: orderNumber,

        total_amount: total,

        payment_method: paymentMethod,

        payment_status: paymentStatus,

        order_status: "placed",

        payment_id: paymentId,

        razorpay_order_id:
          razorpayOrderId,

        customer_name: form.name.trim(),

        customer_email:
          form.email.trim() ||
          user.email ||
          null,

        customer_phone:
          form.phone.trim(),

        delivery_address:
          form.address.trim(),

        delivery_city:
          form.city.trim(),

        delivery_state:
          form.state.trim(),

        delivery_pincode:
          form.pincode.trim(),

        items: orderItems,
      });

    if (error) {
      console.error(
        "Supabase order insert error:",
        error
      );

      throw new Error(
        `Order could not be saved: ${error.message}`
      );
    }

    return orderNumber;
  };

  const handleCODOrder = async () => {
    if (!validateAddress()) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const orderNumber =
        await createOrderInDatabase({
          paymentStatus: "pending",
        });

      setOrderSuccess({
        orderNumber,
        paymentMethod: "cod",
        total,
      });
    } catch (error) {
      console.error(
        "COD order error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to place your order."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (
        typeof window !== "undefined" &&
        window.Razorpay
      ) {
        resolve(true);
        return;
      }

      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true)
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false)
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!validateAddress()) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Razorpay checkout could not be loaded. Please check your internet connection."
        );
      }

      const orderResponse =
        await fetch(
          "/api/razorpay/order",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              amount: total,
            }),
          }
        );

      const orderData =
        (await orderResponse.json()) as RazorpayOrderResponse;

      if (
        !orderResponse.ok ||
        !orderData.success ||
        !orderData.order ||
        !orderData.key_id
      ) {
        throw new Error(
          orderData.error ||
            "Unable to create Razorpay order."
        );
      }

      if (
        typeof window === "undefined" ||
        !window.Razorpay
      ) {
        throw new Error(
          "Razorpay checkout is not available."
        );
      }

      const options: RazorpayOptions = {
        key: orderData.key_id,

        amount:
          orderData.order.amount,

        currency:
          orderData.order.currency || "INR",

        name: "SmartBuy",

        description:
          "SmartBuy secure checkout",

        order_id:
          orderData.order.id,

        prefill: {
          name:
            form.name.trim(),

          email:
            form.email.trim(),

          contact:
            form.phone.trim(),
        },

        theme: {
          color: "#6d4cff",
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        handler: async (
          response
        ) => {
          try {
            setLoading(true);
            setErrorMessage("");

            const verifyResponse =
              await fetch(
                "/api/razorpay/verify",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  }),
                }
              );

            const verifyData =
              (await verifyResponse.json()) as RazorpayVerificationResponse;

            if (
              !verifyResponse.ok ||
              !verifyData.success ||
              !verifyData.verified
            ) {
              throw new Error(
                verifyData.error ||
                  "Payment verification failed."
              );
            }

            const orderNumber =
              await createOrderInDatabase({
                paymentStatus: "paid",

                paymentId:
                  response.razorpay_payment_id,

                razorpayOrderId:
                  response.razorpay_order_id,
              });

            setOrderSuccess({
              orderNumber,

              paymentMethod:
                paymentMethod,

              total,
            });
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(
        "Razorpay payment error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );

      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setErrorMessage("");

    if (!addressValid) {
      validateAddress();
      return;
    }

    if (paymentMethod === "cod") {
      await handleCODOrder();
      return;
    }

    await handleRazorpayPayment();
  };

  if (!items.length && !orderSuccess) {
    return (
      <main className={styles.emptyPage}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <ShoppingBag size={30} />
          </div>

          <span className={styles.eyebrow}>
            SMARTBUY CHECKOUT
          </span>

          <h1>
            Your cart is
            <em> empty.</em>
          </h1>

          <p>
            Add products to your cart before
            continuing to checkout.
          </p>

          <Link
            href="/products"
            className={styles.primaryButton}
          >
            Explore Products
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  if (orderSuccess) {
    return (
      <>
        <main className="success-page">
          <div className="success-glow glow-one" />
          <div className="success-glow glow-two" />

          <header className="success-header">
            <Link
              href="/"
              className="success-logo"
            >
              <span>S</span>
              <strong>SmartBuy</strong>
            </Link>

            <div className="success-secure">
              <ShieldCheck size={14} />
              Secure Order
            </div>
          </header>

          <section className="success-wrap">
            <div className="success-card">
              <div className="success-icon">
                <CheckCircle2 size={39} />
              </div>

              <span className="success-eyebrow">
                SMARTBUY ORDER
              </span>

              <h1>
                Order
                <span> Confirmed!</span>
              </h1>

              <p className="success-message">
                Thank you,{" "}
                <strong>
                  {form.name || "Customer"}
                </strong>
                . Your order has been
                successfully placed.
              </p>

              <div className="success-order-card">
                <div>
                  <span>ORDER ID</span>

                  <strong>
                    #{orderSuccess.orderNumber}
                  </strong>
                </div>

                <div className="success-row">
                  <span>Payment</span>

                  <strong>
                    {orderSuccess.paymentMethod ===
                    "cod"
                      ? "Cash on Delivery"
                      : orderSuccess.paymentMethod ===
                          "razorpay"
                        ? "Razorpay"
                        : orderSuccess.paymentMethod ===
                            "upi"
                          ? "UPI"
                          : "Card"}
                  </strong>
                </div>

                <div className="success-row">
                  <span>Total</span>

                  <strong>
                    {money(
                      orderSuccess.total
                    )}
                  </strong>
                </div>
              </div>

              {orderSuccess.paymentMethod ===
                "cod" && (
                <div className="success-note">
                  <Truck size={16} />

                  <span>
                    Your order is placed. Payment
                    will be collected when the order
                    is delivered.
                  </span>
                </div>
              )}

              <div className="success-actions">
                <Link
                  href="/orders"
                  className="success-primary"
                >
                  View My Orders
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/products"
                  className="success-secondary"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="success-footer">
                <ShieldCheck size={14} />

                <span>
                  Your order information is securely
                  stored in your SmartBuy account.
                </span>
              </div>
            </div>
          </section>
        </main>

        <style jsx global>{`
          .success-page {
            position: relative;
            min-height: 100vh;
            overflow: hidden;
            background:
              radial-gradient(
                circle at 50% 20%,
                rgba(105, 72, 255, 0.12),
                transparent 35%
              ),
              #07070b;
            color: #f7f7fb;
          }

          .success-glow {
            position: fixed;
            width: 320px;
            height: 320px;
            border-radius: 50%;
            filter: blur(100px);
            pointer-events: none;
            opacity: 0.16;
          }

          .glow-one {
            top: -130px;
            right: -90px;
            background: #6844ff;
          }

          .glow-two {
            bottom: -160px;
            left: -100px;
            background: #6741ef;
          }

          .success-header {
            position: relative;
            z-index: 2;
            width: min(1120px, calc(100% - 40px));
            min-height: 76px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid
              rgba(255, 255, 255, 0.07);
          }

          .success-logo {
            display: inline-flex;
            align-items: center;
            gap: 11px;
            color: #fff;
            text-decoration: none;
            font-size: 20px;
            letter-spacing: -0.04em;
          }

          .success-logo span {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            border-radius: 13px;
            background: linear-gradient(
              135deg,
              #6941f3,
              #8d68ff
            );
            font-size: 21px;
            font-weight: 900;
            box-shadow:
              0 14px 35px
              rgba(111, 76, 255, 0.28);
          }

          .success-secure {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #858590;
            font-size: 11px;
          }

          .success-wrap {
            position: relative;
            z-index: 2;
            min-height: calc(100vh - 77px);
            display: grid;
            place-items: center;
            padding: 55px 20px 75px;
          }

          .success-card {
            width: min(580px, 100%);
            padding: 44px;
            border-radius: 27px;
            text-align: center;
            background:
              linear-gradient(
                180deg,
                rgba(20, 20, 29, 0.97),
                rgba(11, 11, 17, 0.98)
              );
            border: 1px solid
              rgba(255, 255, 255, 0.08);
            box-shadow:
              0 40px 100px
              rgba(0, 0, 0, 0.48);
          }

          .success-icon {
            width: 78px;
            height: 78px;
            margin: 0 auto 22px;
            display: grid;
            place-items: center;
            border-radius: 23px;
            color: #fff;
            background: linear-gradient(
              135deg,
              #6840f3,
              #8966ff
            );
            box-shadow:
              0 18px 45px
              rgba(111, 76, 255, 0.28);
          }

          .success-eyebrow {
            display: block;
            margin-bottom: 10px;
            color: #8e7aff;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.2em;
          }

          .success-card h1 {
            margin: 0;
            font-size: clamp(42px, 7vw, 65px);
            line-height: 0.95;
            letter-spacing: -0.07em;
          }

          .success-card h1 span {
            display: block;
            color: #9d8aff;
          }

          .success-message {
            max-width: 430px;
            margin: 18px auto 26px;
            color: #91919d;
            font-size: 13px;
            line-height: 1.65;
          }

          .success-message strong {
            color: #e8e8ee;
          }

          .success-order-card {
            text-align: left;
            padding: 20px;
            border-radius: 17px;
            background:
              linear-gradient(
                135deg,
                rgba(110, 78, 255, 0.11),
                rgba(255, 255, 255, 0.025)
              );
            border: 1px solid
              rgba(125, 95, 255, 0.17);
          }

          .success-order-card > div:first-child {
            padding-bottom: 15px;
            margin-bottom: 14px;
            border-bottom: 1px solid
              rgba(255, 255, 255, 0.07);
          }

          .success-order-card span {
            display: block;
            margin-bottom: 6px;
            color: #706f7c;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.13em;
            text-transform: uppercase;
          }

          .success-order-card > div:first-child strong {
            display: block;
            color: #fff;
            font-size: 21px;
            letter-spacing: -0.03em;
          }

          .success-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-top: 12px;
          }

          .success-row span {
            margin: 0;
            color: #767582;
            font-size: 11px;
            letter-spacing: 0;
            text-transform: none;
          }

          .success-row strong {
            color: #e9e9ef;
            font-size: 12px;
          }

          .success-note {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            text-align: left;
            margin-top: 13px;
            padding: 11px 12px;
            border-radius: 11px;
            background: rgba(107, 78, 255, 0.07);
            border: 1px solid
              rgba(107, 78, 255, 0.1);
            color: #aaa3ce;
            font-size: 10px;
            line-height: 1.5;
          }

          .success-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 23px;
          }

          .success-primary,
          .success-secondary {
            min-height: 49px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 13px;
            padding: 12px 15px;
            font-size: 11px;
            font-weight: 800;
            text-decoration: none;
          }

          .success-primary {
            color: #fff;
            background: linear-gradient(
              135deg,
              #6840f3,
              #8561ff
            );
            box-shadow:
              0 15px 35px
              rgba(105, 67, 243, 0.2);
          }

          .success-secondary {
            color: #dddde5;
            border: 1px solid
              rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.035);
          }

          .success-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            margin-top: 21px;
            padding-top: 17px;
            border-top: 1px solid
              rgba(255, 255, 255, 0.06);
            color: #64646f;
            font-size: 9px;
            line-height: 1.4;
          }

          @media (max-width: 600px) {
            .success-card {
              padding: 28px 20px;
            }

            .success-actions {
              grid-template-columns: 1fr;
            }

            .success-header {
              width: calc(100% - 28px);
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            href="/"
            className={styles.logo}
          >
            <span>S</span>
            <b>SmartBuy</b>
          </Link>

          <Link
            href="/cart"
            className={styles.backLink}
          >
            <ArrowLeft size={15} />
            Back to Cart
          </Link>

          <div className={styles.secureBadge}>
            <Lock size={13} />
            Secure Checkout
          </div>
        </div>
      </header>

      <div className={styles.pageWrap}>
        <div className={styles.titleArea}>
          <div>
            <span className={styles.eyebrow}>
              SMARTBUY CHECKOUT
            </span>

            <h1>
              Complete your
              <em> order.</em>
            </h1>

            <p>
              Secure checkout with a smooth,
              simple shopping experience.
            </p>
          </div>

          <div className={styles.orderBadge}>
            <ShoppingBag size={16} />

            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}
          </div>
        </div>

        <div className={styles.steps}>
          <Step
            number="01"
            title="Delivery"
            active={step >= 1}
            current={step === 1}
          />

          <div className={styles.stepLine} />

          <Step
            number="02"
            title="Review"
            active={step >= 2}
            current={step === 2}
          />

          <div className={styles.stepLine} />

          <Step
            number="03"
            title="Payment"
            active={step >= 3}
            current={step === 3}
          />
        </div>

        {errorMessage && (
          <div className="checkout-error">
            <span>
              {errorMessage}
            </span>

            <button
              type="button"
              onClick={() =>
                setErrorMessage("")
              }
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.layout}>
          <section
            className={styles.mainColumn}
          >
            {step === 1 && (
              <section className={styles.card}>
                <div
                  className={styles.cardHeader}
                >
                  <div
                    className={
                      styles.sectionIcon
                    }
                  >
                    <MapPin size={18} />
                  </div>

                  <div>
                    <span>STEP 01</span>

                    <h2>
                      Delivery details
                    </h2>

                    <p>
                      Where should we deliver
                      your order?
                    </p>
                  </div>
                </div>

                <div
                  className={styles.formGrid}
                >
                  <Field
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(value) =>
                      updateField(
                        "name",
                        value
                      )
                    }
                  />

                  <Field
                    label="Phone Number"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(value) =>
                      updateField(
                        "phone",
                        value
                      )
                    }
                  />

                  <Field
                    label="Email Address"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(value) =>
                      updateField(
                        "email",
                        value
                      )
                    }
                  />

                  <div />

                  <div
                    className={styles.full}
                  >
                    <Field
                      label="Address"
                      placeholder="House no., street, area"
                      value={form.address}
                      onChange={(value) =>
                        updateField(
                          "address",
                          value
                        )
                      }
                    />
                  </div>

                  <Field
                    label="City"
                    placeholder="Your city"
                    value={form.city}
                    onChange={(value) =>
                      updateField(
                        "city",
                        value
                      )
                    }
                  />

                  <Field
                    label="State"
                    placeholder="Your state"
                    value={form.state}
                    onChange={(value) =>
                      updateField(
                        "state",
                        value
                      )
                    }
                  />

                  <Field
                    label="PIN Code"
                    placeholder="6-digit PIN"
                    value={form.pincode}
                    onChange={(value) =>
                      updateField(
                        "pincode",
                        value
                      )
                    }
                  />
                </div>

                <div
                  className={
                    styles.deliveryNote
                  }
                >
                  <Truck size={17} />

                  <div>
                    <strong>
                      Fast delivery
                    </strong>

                    <span>
                      Free delivery on
                      orders above ₹499
                    </span>
                  </div>
                </div>

                <button
                  className={
                    styles.continueButton
                  }
                  type="button"
                  onClick={() => {
                    if (
                      !validateAddress()
                    ) {
                      return;
                    }

                    setStep(2);
                  }}
                >
                  Continue to Review

                  <ArrowRight size={17} />
                </button>
              </section>
            )}

            {step === 2 && (
              <section className={styles.card}>
                <div
                  className={
                    styles.cardHeader
                  }
                >
                  <div
                    className={
                      styles.sectionIcon
                    }
                  >
                    <Package size={18} />
                  </div>

                  <div>
                    <span>STEP 02</span>

                    <h2>
                      Review your order
                    </h2>

                    <p>
                      Check your delivery
                      details and products.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.addressCard
                  }
                >
                  <div>
                    <User size={16} />

                    <strong>
                      {form.name}
                    </strong>
                  </div>

                  <p>
                    {form.address},{" "}
                    {form.city},{" "}
                    {form.state} -{" "}
                    {form.pincode}
                  </p>

                  <span>
                    {form.phone}

                    {form.email
                      ? ` • ${form.email}`
                      : ""}
                  </span>
                </div>

                <div
                  className={
                    styles.reviewProducts
                  }
                >
                  {items.map(
                    ({
                      product,
                      qty,
                    }) => (
                      <div
                        key={product.id}
                        className={
                          styles.reviewProduct
                        }
                      >
                        <img
                          src={product.img}
                          alt={product.name}
                        />

                        <div>
                          <span>
                            {product.cat}{" "}
                            ·{" "}
                            {product.brand}
                          </span>

                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <small>
                            Qty: {qty}
                          </small>
                        </div>

                        <b>
                          {money(
                            product.price *
                              qty
                          )}
                        </b>
                      </div>
                    )
                  )}
                </div>

                <div
                  className={
                    styles.actionRow
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.secondaryButton
                    }
                    onClick={() =>
                      setStep(1)
                    }
                  >
                    <ArrowLeft
                      size={15}
                    />
                    Edit Delivery
                  </button>

                  <button
                    type="button"
                    className={
                      styles.continueButton
                    }
                    onClick={() =>
                      setStep(3)
                    }
                  >
                    Continue to Payment
                    <ArrowRight
                      size={17}
                    />
                  </button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className={styles.card}>
                <div
                  className={
                    styles.cardHeader
                  }
                >
                  <div
                    className={
                      styles.sectionIcon
                    }
                  >
                    <CreditCard
                      size={18}
                    />
                  </div>

                  <div>
                    <span>STEP 03</span>

                    <h2>
                      Choose payment
                    </h2>

                    <p>
                      Select your preferred
                      payment method.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.paymentGrid
                  }
                >
                  <PaymentCard
                    active={
                      paymentMethod ===
                      "razorpay"
                    }
                    icon={
                      <ShieldCheck
                        size={20}
                      />
                    }
                    title="Razorpay"
                    subtitle="Secure online payment"
                    onClick={() =>
                      setPaymentMethod(
                        "razorpay"
                      )
                    }
                  />

                  <PaymentCard
                    active={
                      paymentMethod === "upi"
                    }
                    icon={
                      <Smartphone
                        size={20}
                      />
                    }
                    title="UPI"
                    subtitle="Google Pay, PhonePe, Paytm"
                    onClick={() =>
                      setPaymentMethod(
                        "upi"
                      )
                    }
                  />

                  <PaymentCard
                    active={
                      paymentMethod === "card"
                    }
                    icon={
                      <CreditCard
                        size={20}
                      />
                    }
                    title="Cards"
                    subtitle="Credit / Debit cards"
                    onClick={() =>
                      setPaymentMethod(
                        "card"
                      )
                    }
                  />

                  <PaymentCard
                    active={
                      paymentMethod === "cod"
                    }
                    icon={
                      <Wallet size={20} />
                    }
                    title="Cash on Delivery"
                    subtitle="Pay when delivered"
                    onClick={() =>
                      setPaymentMethod(
                        "cod"
                      )
                    }
                  />
                </div>

                <div
                  className={
                    styles.paymentInfo
                  }
                >
                  <ShieldCheck
                    size={18}
                  />

                  <div>
                    <strong>
                      {paymentMethod ===
                      "cod"
                        ? "Cash on Delivery"
                        : "Secure online payment"}
                    </strong>

                    <span>
                      {paymentMethod ===
                      "cod"
                        ? "Pay when your order is delivered."
                        : "Your payment is securely processed through Razorpay."}
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.actionRow
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.secondaryButton
                    }
                    onClick={() =>
                      setStep(2)
                    }
                    disabled={loading}
                  >
                    <ArrowLeft
                      size={15}
                    />
                    Back
                  </button>

                  <button
                    type="button"
                    className={
                      styles.payButton
                    }
                    onClick={
                      handlePayment
                    }
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : paymentMethod ===
                          "cod"
                        ? `Place Order ${money(
                            total
                          )}`
                        : `Pay ${money(
                            total
                          )}`}

                    {!loading && (
                      <ArrowRight
                        size={17}
                      />
                    )}
                  </button>
                </div>
              </section>
            )}
          </section>

          <aside className={styles.summary}>
            <div
              className={
                styles.summaryHeader
              }
            >
              <span>
                ORDER SUMMARY
              </span>

              <b>
                {itemCount} items
              </b>
            </div>

            <div
              className={
                styles.summaryItems
              }
            >
              {items.map(
                ({
                  product,
                  qty,
                }) => (
                  <div
                    key={product.id}
                    className={
                      styles.summaryItem
                    }
                  >
                    <div
                      className={
                        styles.summaryImage
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
                        {qty}
                      </span>
                    </div>

                    <div>
                      <strong>
                        {
                          product.name
                        }
                      </strong>

                      <small>
                        {
                          product.brand
                        }
                      </small>
                    </div>

                    <b>
                      {money(
                        product.price *
                          qty
                      )}
                    </b>
                  </div>
                )
              )}
            </div>

            <div
              className={
                styles.summaryDivider
              }
            />

            <Row
              label="Subtotal"
              value={money(
                subtotal
              )}
            />

            <Row
              label="Delivery"
              value={
                delivery === 0
                  ? "FREE"
                  : money(
                      delivery
                    )
              }
            />

            {discount > 0 && (
              <Row
                label="SmartBuy Discount"
                value={`-${money(
                  discount
                )}`}
                green
              />
            )}

            <div
              className={
                styles.totalRow
              }
            >
              <span>Total</span>

              <strong>
                {money(total)}
              </strong>
            </div>

            <div
              className={
                styles.trust
              }
            >
              <ShieldCheck
                size={16}
              />

              <span>
                Secure checkout

                <small>
                  Your information
                  is encrypted.
                </small>
              </span>
            </div>

            <div
              className={
                styles.trust
              }
            >
              <Truck size={16} />

              <span>
                Fast delivery

                <small>
                  Track your order
                  after payment.
                </small>
              </span>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .checkout-error {
          width: min(
            1120px,
            calc(100% - 40px)
          );
          margin: 0 auto 18px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;

          padding: 12px 14px;

          border-radius: 12px;

          background: rgba(
            255,
            74,
            91,
            0.08
          );

          border: 1px solid
            rgba(
              255,
              74,
              91,
              0.18
            );

          color: #ff9aa4;

          font-size: 12px;
        }

        .checkout-error button {
          width: 24px;
          height: 24px;
          border: 0;
          border-radius: 8px;

          display: grid;
          place-items: center;

          background: rgba(
            255,
            255,
            255,
            0.05
          );

          color: #ff9aa4;

          cursor: pointer;

          font-size: 16px;
        }

        .payButton:disabled,
        .continueButton:disabled,
        .secondaryButton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}

function Step({
  number,
  title,
  active,
  current,
}: {
  number: string;
  title: string;
  active: boolean;
  current: boolean;
}) {
  return (
    <div
      className={`${styles.step} ${
        active
          ? styles.stepActive
          : ""
      } ${
        current
          ? styles.stepCurrent
          : ""
      }`}
    >
      <span>{number}</span>
      <b>{title}</b>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label
      className={
        styles.field
      }
    >
      <span>{label}</span>

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
      />
    </label>
  );
}

function PaymentCard({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.paymentCard} ${
        active
          ? styles.paymentActive
          : ""
      }`}
      onClick={onClick}
    >
      <div
        className={
          styles.paymentIcon
        }
      >
        {icon}
      </div>

      <div>
        <strong>
          {title}
        </strong>

        <span>
          {subtitle}
        </span>
      </div>

      <div
        className={
          styles.radio
        }
      >
        {active && (
          <Check size={11} />
        )}
      </div>
    </button>
  );
}

function Row({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div
      className={`${styles.row} ${
        green
          ? styles.greenRow
          : ""
      }`}
    >
      <span>{label}</span>

      <b>{value}</b>
    </div>
  );
}