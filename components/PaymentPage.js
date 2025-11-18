"use client";
import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { fetchUser, fetchPayments, initiate } from "@/actions/useractions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
const PaymentPage = ({ username }) => {
  const { data: session, status } = useSession();
  const [paymentForm, setPaymentForm] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [payments, setPayments] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (searchParams.get("paymentdone") == "true") {
      toast("thanks for donation!", {
        position: "top-right",
        autoClose: 1000,
        limit: 1,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: "bounce",
        draggable: true,
      });
    }
    router.push(`/${username}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleChange = (e) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };
  const getData = async () => {
    let u = await fetchUser(username);
    setCurrentUser(u);
    const dbPayments = await fetchPayments(username);
    setPayments(dbPayments);
  };
  const pay = async (amount) => {
    const a = await initiate(amount, username, paymentForm);
    const orderId = a.id;
    var options = {
      // options here
      key: currentUser.razorpayid || process.env.RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
      // key: process.env.NEXTPUBLIC_API_KEY, // Enter the Key ID generated from the Dashboard
      amount: amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "Get Me A Chai", //your business name
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: orderId, //This is a sample Order ID. Pass the `id` obtained in the "response of Step 1
      callback_url: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/razorpay`,
      prefill: {
        //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
        name: "Gaurav Kumar", //your customer's name
        email: "gaurav.kumar@example.com",
        contact: "9000090000",
        //Provide the customer's phone number for better conversion rates
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
  };

  return (
    <>
      <ToastContainer limit={1} draggable />
      <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>

      <div>
        {username}
        <div className="relative">
          <Image
            className="mx-auto "
            src={currentUser.coverpic}
            // width={1200}
            // height={1}
            alt="Background-image"
          ></Image>
        </div>
        <div className=" profile text-center">
          <div className="profile absolute top-[17rem] left-[39rem] md:top-[14rem] md:left-[39rem] lg:left-[39rem] lg:top-[21rem] text-gray-500 text-sm text-wrap">
            <Image
              className=" border border-spacing-3 rounded-full"
              src={currentUser.profilepic}
              // width={100}
              // height={120}
              alt="profile-image"
            ></Image>
          </div>
          <div className="mt-10 text-gray-500 text-sm">
            <p className="font-bold ">lets help {username} to get a chai</p>
            <p>
              {payments.length} Payments. ₹
              {payments.reduce((a, b) => a + b.amount, 0)} raised
            </p>
          </div>
        </div>
        <div className="bg-blue-700 supporters-payment w-[80%] grid gap-2 mt-5  grid-cols-none mx-auto md:grid-cols-2">
          <div className="supporters text-white p-10 bg-slate-900 text-center">
            <h2 className="mb-4 font-semibold"> Supporters</h2>
            <ul>
              {payments.map((p, i) => {
                return (
                  <li key={i} className="mb-2">
                    <span>
                      {p.name} donated{" "}
                      <span className="font-bold">{p.amount}</span> with a
                      message {p.message}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="payment p-10 bg-slate-900 text-center">
            <h2> Make a Payment</h2>

            <div>
              <input
                onChange={handleChange}
                value={paymentForm.name}
                name="name"
                type="text"
                id="name"
                className="w-full p-3 mb-1 rounded-lg bg-slate-800"
                placeholder="Enter Name"
                required
              />

              <input
                onChange={handleChange}
                value={paymentForm.message}
                name="message"
                type="text"
                id="message"
                className="w-full p-3 mb-1 rounded-lg bg-slate-800"
                placeholder="Enter Message"
                required
              />
              <input
                onChange={handleChange}
                value={paymentForm.amount}
                name="amount"
                type="number"
                id="amount"
                className="w-full p-3 mb-3 rounded-lg bg-slate-800"
                placeholder="Enter Amount"
                required
              />
            </div>
            <button
              onClick={() => pay(Number.parseInt(paymentForm.amount) * 100)}
              className={`w-full p-3 rounded-lg ${
                paymentForm?.amount < 9
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-cyan-400"
              }`}
              disabled={paymentForm?.amount < 9}
            >
              Pay
            </button>
            <div className="flex mt-4 ">
              <button
                className="bg-slate-800 py-2 px-1 text-sm  mr-4"
                onClick={() => pay(1000)}
              >
                pay ₹10
              </button>
              <button
                className="bg-slate-800 py-2 px-1  text-sm mr-4"
                onClick={() => pay(2000)}
              >
                pay ₹20
              </button>
              <button
                className="bg-slate-800 py-2 px-1  text-sm mr-4"
                onClick={() => pay(3000)}
              >
                pay ₹50
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
