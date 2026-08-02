import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export const deviceAuthService = {
  async getCurrentLocationAndDevice() {
    let location = { city: "Kanpur", region: "Uttar Pradesh" };
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data && data.city) {
        location = { city: data.city, region: data.region };
      }
    } catch (e) {
      console.warn("Geolocation lookup fallback applied.");
    }

    const deviceSignature = `${navigator.platform}_${navigator.userAgent}`;
    return { location, deviceSignature };
  },

  async verifyDeviceAndTriggerOTP(userId, userEmail) {
    const { location, deviceSignature } =
      await this.getCurrentLocationAndDevice();
    const sessionKey = `${location.city}_${deviceSignature}`.replace(
      /[.#$/[\]]/g,
      "_",
    );

    const deviceRef = doc(db, "users", userId, "authorizedDevices", sessionKey);
    const docSnap = await getDoc(deviceRef);

    if (!docSnap.exists()) {
      const generatedOtp = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      await setDoc(deviceRef, {
        city: location.city,
        region: location.region,
        deviceSignature,
        status: "PENDING_OTP",
        otpCode: generatedOtp,
        createdAt: serverTimestamp(),
      });

      console.info(
        `[SECURITY AUDIT] OTP required for new device (${location.city}). Dev Token: ${generatedOtp}`,
      );
      return { required: true, sessionKey, devOtp: generatedOtp };
    }

    const status = docSnap.data().status;
    return { required: status !== "VERIFIED", sessionKey };
  },

  async confirmOTP(userId, sessionKey, userTypedCode) {
    const deviceRef = doc(db, "users", userId, "authorizedDevices", sessionKey);
    const docSnap = await getDoc(deviceRef);

    if (!docSnap.exists()) return false;
    const { otpCode } = docSnap.data();

    if (otpCode === userTypedCode) {
      await updateDoc(deviceRef, {
        status: "VERIFIED",
        verifiedAt: serverTimestamp(),
      });
      return true;
    }
    return false;
  },
};

export default deviceAuthService;
