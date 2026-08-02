import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

const PLAN_LIMITS = {
  free: 1,
  bronze: 5,
  silver: 15,
  gold: 9999,
};

export const downloadService = {
  async getUserPlan(userId) {
    const userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) return "free";
    return userSnap.data().plan || "free";
  },

  async getTodayDownloadCount(userId) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const downloadsRef = collection(db, "users", userId, "downloadHistory");
    const q = query(downloadsRef, where("downloadedAt", ">=", todayStart));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  },

  async canUserDownload(userId) {
    const plan = await this.getUserPlan(userId);
    const limit = PLAN_LIMITS[plan] || 1;
    const todayCount = await this.getTodayDownloadCount(userId);

    return {
      allowed: todayCount < limit,
      plan,
      limit,
      todayCount,
      remaining: Math.max(0, limit - todayCount),
    };
  },

  async registerDownload(userId, videoDetails) {
    const check = await this.canUserDownload(userId);
    if (!check.allowed) {
      throw new Error(
        `Daily download limit reached for your ${check.plan.toUpperCase()} plan (${check.limit}/day). Upgrade to download more.`,
      );
    }

    const downloadsRef = collection(db, "users", userId, "downloadHistory");
    const newDoc = await addDoc(downloadsRef, {
      videoId: videoDetails.id,
      title: videoDetails.title,
      poster: videoDetails.poster_path || videoDetails.poster || "",
      downloadedAt: serverTimestamp(),
      planAtDownload: check.plan,
    });

    return {
      success: true,
      downloadId: newDoc.id,
      remaining: check.remaining - 1,
    };
  },

  async getUserDownloadHistory(userId) {
    const downloadsRef = collection(db, "users", userId, "downloadHistory");
    const querySnapshot = await getDocs(downloadsRef);
    const history = [];
    querySnapshot.forEach((docSnap) => {
      history.push({ id: docSnap.id, ...docSnap.data() });
    });
    return history;
  },
};

export default downloadService;
