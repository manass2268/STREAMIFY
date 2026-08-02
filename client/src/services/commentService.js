import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const FORBIDDEN_WORDS = ["spam", "abuse", "hack", "scam"];

export const commentService = {
  moderateContent(text) {
    // 1. Check abusive words
    const containsAbuse = FORBIDDEN_WORDS.some((word) =>
      text.toLowerCase().includes(word),
    );
    // 2. Check character repetition spam (e.g., "aaaaaaa")
    const isSpamRepeat = /(.)\1{5,}/.test(text);
    // 3. Check excessive special characters
    const isSpecialCharSpam = /[^a-zA-Z0-9\s]{8,}/.test(text);

    if (containsAbuse || isSpamRepeat || isSpecialCharSpam) {
      throw new Error(
        "Comment rejected: Content violates STREAMIFY community guidelines.",
      );
    }
    return true;
  },

  async postComment({
    videoId,
    userId,
    userName,
    text,
    showLocation = false,
    parentId = null,
  }) {
    this.moderateContent(text);

    let locationStr = "Private Location";
    if (showLocation) {
      locationStr = "Kanpur, India";
    }

    const commentsRef = collection(db, "videos", videoId, "comments");
    const newDoc = await addDoc(commentsRef, {
      videoId,
      userId,
      userName: userName || "Anonymous User",
      text,
      location: locationStr,
      likes: 0,
      dislikes: 0,
      isFlagged: false,
      isPinned: false,
      parentId,
      createdAt: serverTimestamp(),
    });

    return newDoc.id;
  },

  async getComments(videoId) {
    const commentsRef = collection(db, "videos", videoId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const results = [];
    snap.forEach((docSnap) =>
      results.push({ id: docSnap.id, ...docSnap.data() }),
    );
    return results;
  },

  async rateComment(videoId, commentId, isLike) {
    const commentRef = doc(db, "videos", videoId, "comments", commentId);
    const snap = await getDocs(
      query(collection(db, "videos", videoId, "comments")),
    );
    const current = snap.docs.find((d) => d.id === commentId)?.data();
    if (!current) return;

    const updatedLikes = isLike ? current.likes + 1 : current.likes;
    const updatedDislikes = !isLike ? current.dislikes + 1 : current.dislikes;
    const shouldFlag = updatedDislikes >= 5; // Flag automatically after 5 dislikes

    await updateDoc(commentRef, {
      likes: updatedLikes,
      dislikes: updatedDislikes,
      isFlagged: shouldFlag,
    });
  },

  async translateComment(text, targetLang = "en") {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0][0][0];
    } catch (e) {
      return text; // Fallback to original if translation service fails
    }
  },
};

export default commentService;
