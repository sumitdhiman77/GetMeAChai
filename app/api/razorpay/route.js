import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import Payment from "@/app/models/Payment";
import connectDB from "@/db/connectDb";
import User from "@/app/models/User";
export const POST = async (req) => {
  await connectDB();
  let body = await req.formData();
  body = Object.fromEntries(body);
  // check if razorpayOrderId id is present on the server
  let p = await Payment.findOne({ oid: body.razorpay_order_id });
  if (!p) {
    return NextResponse.json({ success: false, message: "Order id not found" });
  }
  // fetch the secret of user who is getting Payment
  let user = await User.findOne({ username: p.to_user });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  // verify Payment
  let xx = validatePaymentVerification(
    { order_id: body.razorpay_order_id, payment_id: body.razorpay_payment_id },
    body.razorpay_signature,
    secret
  );

  if (xx) {
    // update payment status
    const updatedPayment = await Payment.findOneAndUpdate(
      { oid: body.razorpay_order_id },
      { done: true },
      { new: true }
    );
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/${updatedPayment.to_user}?paymentdone=true`
    );
  } else {
    return NextResponse.json({
      success: false,
      message: "Payment Verification Failed",
    });
  }
};
