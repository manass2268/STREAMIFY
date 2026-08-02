import React, { useState } from 'react';
import { auth } from '../firebase';
import razorpayService, { PLANS } from '../services/razorpayService';

export default function SubscriptionModal({ isOpen, onClose, currentPlan = 'free', showCustomToast, onPlanUpdated }) {
  const [loadingPlan, setLoadingPlan] = useState(null);

  if (!isOpen) return null;

  const handleSelectPlan = (planKey) => {
    if (planKey === currentPlan) {
      showCustomToast?.('You are already on this plan', 'success');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoadingPlan(planKey);
    razorpayService.initiateUpgrade({
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      targetPlan: planKey,
      onSuccess: (newPlan, paymentId) => {
        setLoadingPlan(null);
        showCustomToast?.(`Successfully upgraded to ${newPlan.toUpperCase()}! Receipt: ${paymentId}`, 'success');
        onPlanUpdated?.(newPlan);
        onClose();
      },
      onFailure: (errMsg) => {
        setLoadingPlan(null);
        showCustomToast?.(errMsg, 'error');
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full p-6 text-white relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg">✕</button>
        <h2 className="text-2xl font-bold mb-1 text-center">Upgrade Your Cinematic Experience</h2>
        <p className="text-sm text-zinc-400 text-center mb-6">Unlock 4K streaming, unlimited downloads, and ad-free entertainment.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = key === currentPlan;
            return (
              <div key={key} className={`border rounded-lg p-4 flex flex-col justify-between ${isCurrent ? 'border-purple-500 bg-purple-950/20' : 'border-zinc-800 bg-zinc-800/40'}`}>
                <div>
                  <h3 className="text-lg font-bold uppercase text-purple-400">{plan.name}</h3>
                  <p className="text-2xl font-extrabold my-2">₹{plan.price}<span className="text-xs text-zinc-400 font-normal"> /mo</span></p>
                  <ul className="text-xs space-y-2 my-4 text-zinc-300">
                    {plan.benefits.map((b, i) => <li key={i}>✓ {b}</li>)}
                  </ul>
                </div>
                <button
                  disabled={isCurrent || loadingPlan === key || plan.price === 0}
                  onClick={() => handleSelectPlan(key)}
                  className={`w-full py-2 rounded text-sm font-semibold transition ${isCurrent ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
                >
                  {isCurrent ? 'Current Plan' : loadingPlan === key ? 'Processing...' : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}