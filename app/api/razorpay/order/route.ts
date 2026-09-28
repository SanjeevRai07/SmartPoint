import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `smartbuy_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,

      // Public Key ID — safe to send to browser
      key_id: process.env.RAZORPAY_KEY_ID,

      order,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create Razorpay order",
      },
      { status: 500 }
    );
  }
}