import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is missing");

      return NextResponse.json(
        {
          success: false,
          error: "Razorpay secret is not configured on the server.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Razorpay payment details.",
        },
        { status: 400 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf8"),
      Buffer.from(razorpay_signature, "utf8")
    );

    if (!isValid) {
      console.warn("Invalid Razorpay signature");

      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Payment verified successfully.",
      payment: {
        razorpay_order_id,
        razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);

    return NextResponse.json(
      {
        success: false,
        verified: false,
        error: "Unable to verify Razorpay payment.",
      },
      { status: 500 }
    );
  }
}