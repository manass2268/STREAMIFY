import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const PLAN_HIERARCHY = { free: 0, bronze: 1, silver: 2, gold: 3 };

export default function SubscriptionGuard({ minPlan = 'bronze', children, fallback }) {
  const [userPlan, setUserPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    async function fetchPlan() {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserPlan(snap.data().plan || 'free');
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, []);

  if (loading) return <div className="text-white text-sm p-4">Verifying access rights...</div>;

  const hasAccess = PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[minPlan];

  if (!hasAccess) {
    return fallback || (
      <div className="bg-zinc-900 border border-purple-500/30 rounded-lg p-8 text-center text-white max-w-md mx-auto my-8">
        <h3 className="text-lg font-bold text-purple-400 mb-2">Premium Content Locked</h3>
        <p className="text-sm text-zinc-400 mb-4">
          This title requires the <span className="uppercase font-semibold text-white">{minPlan}</span> plan or higher. You are currently on the <span className="uppercase font-semibold text-zinc-300">{userPlan}</span> plan.
        </p>
      </div>
    );
  }

  return children;
}