"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
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

import { useCart } from "../../components/CartProvider";
import { products } from "../../lib/products";
import styles from "./Checkout.module.css";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

type PaymentMethod =
  | "razorpay"
  | "upi"
  | "card"
  | "cod";

export default function CheckoutPage() {
  const { lines, itemCount } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("razorpay");

  const [isPaying, setIsPaying] =
    useState(false);

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [orderId, setOrderId] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // ==========================================
  // CART ITEMS
  // ==========================================

  const items = useMemo(() => {
    return lines
      .map((line) => {
        const product = products.find(
          (product) =>
            product.id === line.productId
        );

        if (!product) return null;

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

  // ==========================================
  // PRICE CALCULATION
  // ==========================================

  const subtotal = items.reduce(
    (total, item) =>
      total +
      item.product.price * item.qty,
    0
  );

  const delivery =
    subtotal >= 499 || subtotal === 0
      ? 0
      : 79;

  const discount =
    subtotal >= 3000
      ? Math.min(
          500,
          Math.round(subtotal * 0.1)
        )
      : 0;

  const total =
    subtotal + delivery - discount;

  // ==========================================
  // FORM
  // ==========================================

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

  // ==========================================
  // RAZORPAY SCRIPT
  // ==========================================

  const loadRazorpay = async () => {
    if (window.Razorpay) {
      return true;
    }

    return new Promise<boolean>(
      (resolve, reject) => {
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
            () => reject(false)
          );

          return;
        }

        const script =
          document.createElement("script");

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        script.onload = () =>
          resolve(true);

        script.onerror = () =>
          reject(false);

        document.body.appendChild(script);
      }
    );
  };

  // ==========================================
  // RAZORPAY PAYMENT
  // ==========================================

  const handleRazorpayPayment =
    async () => {
      if (isPaying) return;

      try {
        setIsPaying(true);

        // Load Razorpay
        await loadRazorpay();

        if (!window.Razorpay) {
          throw new Error(
            "Razorpay failed to load."
          );
        }

        // Create order on server
        const response = await fetch(
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

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Unable to create Razorpay order."
          );
        }

        // Key comes from server
        const razorpayKey =
          data.key_id;

        if (!razorpayKey) {
          throw new Error(
            "Razorpay Key ID is missing."
          );
        }

        if (!data.order?.id) {
          throw new Error(
            "Razorpay Order ID is missing."
          );
        }

        const razorpayOptions = {
          key: razorpayKey,

          amount:
            data.order.amount,

          currency:
            data.order.currency ||
            "INR",

          name: "SmartBuy",

          description:
            `SmartBuy ${
              paymentMethod === "upi"
                ? "UPI"
                : paymentMethod ===
                  "card"
                ? "Card"
                : "Online"
            } Payment`,

          order_id:
            data.order.id,

          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },

          notes: {
            customer_name:
              form.name,

            phone: form.phone,

            email: form.email,

            address:
              form.address,

            city: form.city,

            state: form.state,

            pincode:
              form.pincode,

            selected_method:
              paymentMethod,
          },

          theme: {
            color: "#6d4aff",
          },

          handler:
            function (
              paymentResponse: any
            ) {
              console.log(
                "Payment successful:",
                paymentResponse
              );

              const generatedOrderId =
                `SB${Date.now()
                  .toString()
                  .slice(-8)}`;

              setOrderId(
                generatedOrderId
              );

              setOrderPlaced(true);
              setIsPaying(false);
            },

          modal: {
            ondismiss:
              function () {
                setIsPaying(false);
              },
          },
        };

        const razorpay =
          new window.Razorpay(
            razorpayOptions
          );

        razorpay.on(
          "payment.failed",
          function (
            response: any
          ) {
            console.error(
              "Payment failed:",
              response
            );

            alert(
              response?.error
                ?.description ||
                "Payment failed. Please try again."
            );

            setIsPaying(false);
          }
        );

        razorpay.open();
      } catch (error) {
        console.error(
          "Razorpay error:",
          error
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to open payment."
        );

        setIsPaying(false);
      }
    };

  // ==========================================
  // COD ORDER
  // ==========================================

  const handleCODOrder = () => {
    if (!addressValid) {
      alert(
        "Please complete your delivery details first."
      );

      setStep(1);

      return;
    }

    setIsPaying(true);

    // Small delay for better UX
    setTimeout(() => {
      const generatedOrderId =
        `SB${Date.now()
          .toString()
          .slice(-8)}`;

      setOrderId(
        generatedOrderId
      );

      setOrderPlaced(true);
      setIsPaying(false);
    }, 700);
  };

  // ==========================================
  // MAIN PAY BUTTON
  // ==========================================

  const handlePayment = () => {
    if (paymentMethod === "cod") {
      handleCODOrder();
      return;
    }

    handleRazorpayPayment();
  };

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (!items.length) {
    return (
      <main className={styles.emptyPage}>
        <div className={styles.emptyCard}>
          <div
            className={
              styles.emptyIcon
            }
          >
            <ShoppingBag
              size={30}
            />
          </div>

          <span
            className={
              styles.eyebrow
            }
          >
            SMARTBUY CHECKOUT
          </span>

          <h1>
            Your cart is
            <em> empty.</em>
          </h1>

          <p>
            Add products to your cart
            before continuing to
            checkout.
          </p>

          <Link
            href="/products"
            className={
              styles.primaryButton
            }
          >
            Explore Products
            <ArrowRight
              size={16}
            />
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // ORDER SUCCESS
  // ==========================================

  if (orderPlaced) {
    return (
      <main
        className={
          styles.emptyPage
        }
      >
        <div
          className={
            styles.emptyCard
          }
        >
          <div
            className={
              styles.emptyIcon
            }
          >
            <Check size={34} />
          </div>

          <span
            className={
              styles.eyebrow
            }
          >
            SMARTBUY ORDER
          </span>

          <h1>
            Order
            <em>
              {" "}
              confirmed!
            </em>
          </h1>

          <p>
            Thank you,{" "}
            <strong>
              {form.name}
            </strong>
            . Your order has been
            successfully placed.
          </p>

          <div
            style={{
              marginTop:
                "24px",
              padding:
                "18px",
              border:
                "1px solid rgba(109,74,255,.18)",
              borderRadius:
                "16px",
              background:
                "rgba(109,74,255,.05)",
              textAlign:
                "left",
            }}
          >
            <p
              style={{
                margin:
                  "0 0 8px",
                fontSize:
                  "13px",
              }}
            >
              Order ID
            </p>

            <strong
              style={{
                fontSize:
                  "20px",
                letterSpacing:
                  "1px",
              }}
            >
              #{orderId}
            </strong>

            <div
              style={{
                marginTop:
                  "16px",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                gap:
                  "20px",
              }}
            >
              <span>
                Payment
              </span>

              <strong>
                {paymentMethod ===
                "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </strong>
            </div>

            <div
              style={{
                marginTop:
                  "10px",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                gap:
                  "20px",
              }}
            >
              <span>
                Total
              </span>

              <strong>
                {money(total)}
              </strong>
            </div>
          </div>

          <div
            style={{
              display:
                "flex",
              gap:
                "12px",
              marginTop:
                "24px",
              flexWrap:
                "wrap",
            }}
          >
            <Link
              href="/products"
              className={
                styles.primaryButton
              }
            >
              Continue Shopping
              <ArrowRight
                size={16}
              />
            </Link>

            <Link
              href="/"
              className={
                styles.secondaryButton
              }
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // CHECKOUT PAGE
  // ==========================================

  return (
    <main
      className={styles.page}
    >
      {/* HEADER */}

      <header
        className={
          styles.header
        }
      >
        <div
          className={
            styles.headerInner
          }
        >
          <Link
            href="/"
            className={
              styles.logo
            }
          >
            <span>S</span>
            <b>
              SmartBuy
            </b>
          </Link>

          <Link
            href="/cart"
            className={
              styles.backLink
            }
          >
            <ArrowLeft
              size={15}
            />
            Back to Cart
          </Link>

          <div
            className={
              styles.secureBadge
            }
          >
            <Lock
              size={13}
            />
            Secure Checkout
          </div>
        </div>
      </header>

      <div
        className={
          styles.pageWrap
        }
      >
        {/* TITLE */}

        <div
          className={
            styles.titleArea
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              SMARTBUY CHECKOUT
            </span>

            <h1>
              Complete your
              <em>
                {" "}
                order.
              </em>
            </h1>

            <p>
              Secure checkout with a
              smooth, simple shopping
              experience.
            </p>
          </div>

          <div
            className={
              styles.orderBadge
            }
          >
            <ShoppingBag
              size={16}
            />

            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}
          </div>
        </div>

        {/* STEPS */}

        <div
          className={
            styles.steps
          }
        >
          <Step
            number="01"
            title="Delivery"
            active={
              step >= 1
            }
            current={
              step === 1
            }
          />

          <div
            className={
              styles.stepLine
            }
          />

          <Step
            number="02"
            title="Review"
            active={
              step >= 2
            }
            current={
              step === 2
            }
          />

          <div
            className={
              styles.stepLine
            }
          />

          <Step
            number="03"
            title="Payment"
            active={
              step >= 3
            }
            current={
              step === 3
            }
          />
        </div>

        <div
          className={
            styles.layout
          }
        >
          <section
            className={
              styles.mainColumn
            }
          >
            {/* ==================================
                STEP 1
            ================================== */}

            {step === 1 && (
              <section
                className={
                  styles.card
                }
              >
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
                    <MapPin
                      size={18}
                    />
                  </div>

                  <div>
                    <span>
                      STEP 01
                    </span>

                    <h2>
                      Delivery
                      details
                    </h2>

                    <p>
                      Where should we
                      deliver your
                      order?
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.formGrid
                  }
                >
                  <Field
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={
                      form.name
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "name",
                        value
                      )
                    }
                  />

                  <Field
                    label="Phone Number"
                    placeholder="10-digit mobile number"
                    value={
                      form.phone
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "phone",
                        value
                      )
                    }
                  />

                  <Field
                    label="Email Address"
                    placeholder="you@example.com"
                    value={
                      form.email
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "email",
                        value
                      )
                    }
                  />

                  <div />

                  <div
                    className={
                      styles.full
                    }
                  >
                    <Field
                      label="Address"
                      placeholder="House no., street, area"
                      value={
                        form.address
                      }
                      onChange={(
                        value
                      ) =>
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
                    value={
                      form.city
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "city",
                        value
                      )
                    }
                  />

                  <Field
                    label="State"
                    placeholder="Your state"
                    value={
                      form.state
                    }
                    onChange={(
                      value
                    ) =>
                      updateField(
                        "state",
                        value
                      )
                    }
                  />

                  <Field
                    label="PIN Code"
                    placeholder="6-digit PIN"
                    value={
                      form.pincode
                    }
                    onChange={(
                      value
                    ) =>
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
                  <Truck
                    size={17}
                  />

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
                  onClick={() => {
                    if (
                      !addressValid
                    ) {
                      alert(
                        "Please fill in all required delivery details."
                      );

                      return;
                    }

                    setStep(2);
                  }}
                >
                  Continue to
                  Review

                  <ArrowRight
                    size={17}
                  />
                </button>
              </section>
            )}

            {/* ==================================
                STEP 2
            ================================== */}

            {step === 2 && (
              <section
                className={
                  styles.card
                }
              >
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
                    <Package
                      size={18}
                    />
                  </div>

                  <div>
                    <span>
                      STEP 02
                    </span>

                    <h2>
                      Review your
                      order
                    </h2>

                    <p>
                      Check your delivery
                      details and
                      products.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.addressCard
                  }
                >
                  <div>
                    <User
                      size={16}
                    />

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
                        key={
                          product.id
                        }
                        className={
                          styles.reviewProduct
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

                        <div>
                          <span>
                            {
                              product.cat
                            }{" "}
                            ·{" "}
                            {
                              product.brand
                            }
                          </span>

                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <small>
                            Qty:{" "}
                            {
                              qty
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
                    styles.actionRow
                  }
                >
                  <button
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
                    className={
                      styles.continueButton
                    }
                    onClick={() =>
                      setStep(3)
                    }
                  >
                    Continue to
                    Payment

                    <ArrowRight
                      size={17}
                    />
                  </button>
                </div>
              </section>
            )}

            {/* ==================================
                STEP 3
            ================================== */}

            {step === 3 && (
              <section
                className={
                  styles.card
                }
              >
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
                    <span>
                      STEP 03
                    </span>

                    <h2>
                      Choose payment
                    </h2>

                    <p>
                      Select your
                      preferred payment
                      method.
                    </p>
                  </div>
                </div>

                {/* PAYMENT METHODS */}

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
                      paymentMethod ===
                      "upi"
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
                      paymentMethod ===
                      "card"
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
                      paymentMethod ===
                      "cod"
                    }
                    icon={
                      <Wallet
                        size={20}
                      />
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

                {/* PAYMENT INFO */}

                <div
                  className={
                    styles.paymentInfo
                  }
                >
                  {paymentMethod ===
                  "cod" ? (
                    <Truck
                      size={18}
                    />
                  ) : (
                    <ShieldCheck
                      size={18}
                    />
                  )}

                  <div>
                    <strong>
                      {paymentMethod ===
                      "cod"
                        ? "Cash on Delivery"
                        : paymentMethod ===
                          "upi"
                        ? "UPI payment via Razorpay"
                        : paymentMethod ===
                          "card"
                        ? "Card payment via Razorpay"
                        : "Secure Razorpay checkout"}
                    </strong>

                    <span>
                      {paymentMethod ===
                      "cod"
                        ? "Pay safely when your order is delivered to your address."
                        : "Your payment information is protected with industry-standard security."}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}

                <div
                  className={
                    styles.actionRow
                  }
                >
                  <button
                    className={
                      styles.secondaryButton
                    }
                    onClick={() =>
                      setStep(2)
                    }
                    disabled={
                      isPaying
                    }
                  >
                    <ArrowLeft
                      size={15}
                    />
                    Back
                  </button>

                  <button
                    className={
                      styles.payButton
                    }
                    onClick={
                      handlePayment
                    }
                    disabled={
                      isPaying
                    }
                  >
                    {isPaying ? (
                      "Processing..."
                    ) : paymentMethod ===
                      "cod" ? (
                      "Place COD Order"
                    ) : (
                      <>
                        Pay{" "}
                        {money(
                          total
                        )}
                      </>
                    )}

                    {!isPaying && (
                      <ArrowRight
                        size={17}
                      />
                    )}
                  </button>
                </div>
              </section>
            )}
          </section>

          {/* ==================================
              ORDER SUMMARY
          ================================== */}

          <aside
            className={
              styles.summary
            }
          >
            <div
              className={
                styles.summaryHeader
              }
            >
              <span>
                ORDER SUMMARY
              </span>

              <b>
                {itemCount}{" "}
                {itemCount === 1
                  ? "item"
                  : "items"}
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
                    key={
                      product.id
                    }
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
              <span>
                Total
              </span>

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
              <Truck
                size={16}
              />

              <span>
                Fast delivery

                <small>
                  Track your
                  order after
                  payment.
                </small>
              </span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// ==========================================
// STEP COMPONENT
// ==========================================

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
      <span>
        {number}
      </span>

      <b>
        {title}
      </b>
    </div>
  );
}

// ==========================================
// INPUT FIELD
// ==========================================

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
      <span>
        {label}
      </span>

      <input
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
      />
    </label>
  );
}

// ==========================================
// PAYMENT CARD
// ==========================================

function PaymentCard({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: any;
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
          <Check
            size={11}
          />
        )}
      </div>
    </button>
  );
}

// ==========================================
// SUMMARY ROW
// ==========================================

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
      <span>
        {label}
      </span>

      <b>
        {value}
      </b>
    </div>
  );
}