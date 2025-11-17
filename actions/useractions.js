"use server";
import Razorpay from "razorpay";
import Payment from "@/app/models/Payment";
import connectDB, { getConnectionState } from "@/db/connectDb";
import User from "@/app/models/User";

export const initiate = async (amount, to_username, paymentForm) => {
  try {
    await connectDB();
    // fetch the secret of user who is getting Payment
    const user = await User.findOne({ username: to_username }).lean();
    const secret = process.env.RAZORPAY_KEY_SECRET;
    var instance = new Razorpay({
      key_id: user.razorpayid,
      key_secret: secret,
    });
    // instance.orders.create({
    //   amount: 50000,
    //   currency: "INR",
    //   receipt: "receipt#1",
    //   notes: {
    //     key1: "value3",
    //     key2: "value2",
    //   },
    // });
  } catch (error) {
    throw new Error("Database connection failed");
  }

  let options = {
    amount: Number.parseInt(amount),
    currency: "INR",
  };
  let x = await instance.orders.create(options);
  // create a payment object which shows a pending payment in the database
  await Payment.create({
    oid: x.id,
    amount: amount / 100,
    to_user: to_username,
    name: paymentForm.name,
    message: paymentForm.message,
  });
  return x;
};
export const fetchUser = async (username) => {
  try {
    await connectDB();
    let user = User.findOne({ username: username }).lean();
    if (!user) {
      return null; // or throw an error if you prefer
    }
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user");
  }
};
export const fetchPayments = async (username) => {
  await connectDB();
  let p = await Payment.find({ to_user: username, done: true })
    .sort({ amount: -1 })
    .limit(10)
    .lean();
  return p;
};

export const updateProfile = async (data, oldUsername) => {
  await connectDB();
  const ndata = Object.fromEntries(data);
  // ? if the username is being updated check if username is available
  if (oldUsername !== ndata.username) {
    let u = await User.findOne({ username: ndata.username }).lean();
    if (u) {
      return { error: "username is already exist" };
    }
    await User.updateOne({ email: ndata.email }, ndata);
    // now update all username in payments table
    await Payment.updateMany(
      { to_user: oldUsername },
      { to_user: ndata.username }
    );
  }
  let a = await User.updateOne({ email: ndata.email }, ndata);
  return a;
};
