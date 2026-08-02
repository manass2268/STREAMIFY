import { db } from "../firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const RAZORPAY_TEST_KEY =
  import.meta.env.VITE_RAZORPAY_TEST_KEY_ID || "rzp_test_YourTestKeyHere";

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    benefits: ["Standard SD quality", "1 download/day", "Ad-supported"],
  },
  bronze: {
    name: "Bronze",
    price: 199,
    benefits: ["HD 720p quality", "5 downloads/day", "Ad-free viewing"],
  },
  silver: {
    name: "Silver",
    price: 499,
    benefits: ["Full HD 1080p", "15 downloads/day", "2 concurrent screens"],
  },
  gold: {
    name: "Gold",
    price: 799,
    benefits: [
      "4K Ultra HD + HDR",
      "Unlimited downloads",
      "4 concurrent screens",
      "VIP Support",
    ],
  },
};

export const razorpayService = {
  loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  async initiateUpgrade({
    userId,
    userEmail,
    userName,
    targetPlan,
    onSuccess,
    onFailure,
  }) {
    const isLoaded = await this.loadRazorpayScript();
    if (!isLoaded) {
      onFailure?.("Failed to load Razorpay SDK. Check internet connection.");
      return;
    }

    const planDetails = PLANS[targetPlan];
    if (!planDetails || planDetails.price === 0) {
      onFailure?.("Invalid plan upgrade request.");
      return;
    }

    const options = {
      key: RAZORPAY_TEST_KEY,
      amount: planDetails.price * 100, // Amount in paise
      currency: "INR",
      name: "STREAMIFY OTT",
      description: `Upgrade to ${planDetails.name} Plan`,
      handler: async (response) => {
        try {
          await this.verifyAndSaveSubscription({
            userId,
            userEmail,
            targetPlan,
            paymentId: response.razorpay_payment_id,
            amount: planDetails.price,
          });
          onSuccess?.(targetPlan, response.razorpay_payment_id);
        } catch (error) {
          onFailure?.("Payment verification failed after checkout.");
        }
      },
      prefill: {
        name: userName || "Streamify User",
        email: userEmail || "",
      },
      theme: {
        color: "#8B5CF6",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      onFailure?.(response.error.description || "Payment Failed");
    });
    rzp.open();
  },

  async verifyAndSaveSubscription({
    userId,
    userEmail,
    targetPlan,
    paymentId,
    amount,
  }) {
    const userDocRef = doc(db, "users", userId);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30-day billing cycle

    await updateDoc(userDocRef, {
      plan: targetPlan,
      subscriptionExpiry: expiryDate.toISOString(),
      lastPaymentId: paymentId,
      updatedAt: serverTimestamp(),
    });

    const invoicesRef = collection(db, "users", userId, "invoices");
    await addDoc(invoicesRef, {
      paymentId,
      plan: targetPlan,
      amountINR: amount,
      status: "PAID",
      createdAt: serverTimestamp(),
      userEmail,
    });
  },
};

export default razorpayService;
