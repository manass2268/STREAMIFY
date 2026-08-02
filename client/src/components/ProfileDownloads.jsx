import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import downloadService from '../services/downloadService';

export default function ProfileDownloads({ showCustomToast }) {
  const [history, setHistory] = useState([]);
  const [quota, setQuota] = useState({ plan: 'free', limit: 1, todayCount: 0, remaining: 1 });
  const [loading, setLoading] = useState(true);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    async function loadDownloads() {
      try {
        const [stats, records] = await Promise.all([
          downloadService.canUserDownload(userId),
          downloadService.getUserDownloadHistory(userId),
        ]);
        setQuota(stats);
        setHistory(records);
      } catch (err) {
        showCustomToast?.('Failed to load download history', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDownloads();
  }, [userId, showCustomToast]);

  const handleSimulateDownload = async (movie) => {
    try {
      const res = await downloadService.registerDownload(userId, movie);
      showCustomToast?.(`Downloaded "${movie.title}". ${res.remaining} remaining today.`, 'success');
      setQuota((prev) => ({ ...prev, todayCount: prev.todayCount + 1, remaining: res.remaining }));
      setHistory((prev) => [{ id: res.downloadId, ...movie, downloadedAt: new Date(), planAtDownload: quota.plan }, ...prev]);
    } catch (err) {
      showCustomToast?.(err.message, 'error');
    }
  };

  if (loading) return <div className="text-white p-4">Loading your downloads...</div>;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-4xl mx-auto my-8 text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Downloads & Quota</h2>
          <p className="text-sm text-zinc-400">
            Current Plan: <span className="uppercase text-purple-400 font-semibold">{quota.plan}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-green-400">{quota.remaining}</span>
          <span className="text-zinc-400 text-sm"> / {quota.limit} downloads remaining today</span>
        </div>
      </div>

      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-purple-600 h-full transition-all duration-300"
          style={{ width: `${Math.min(100, (quota.todayCount / quota.limit) * 100)}%` }}
        />
      </div>

      <h3 className="text-md font-semibold mb-3 border-b border-zinc-800 pb-2">Download History</h3>
      {history.length === 0 ? (
        <p className="text-zinc-500 text-sm">No downloaded videos found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded border border-zinc-700/50">
              {item.poster && <img src={item.poster} alt={item.title} className="w-12 h-16 object-cover rounded" />}
              <div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-zinc-400">Plan: {item.planAtDownload?.toUpperCase()}</p>
                <p className="text-xs text-zinc-500">
                  {item.downloadedAt?.toDate ? item.downloadedAt.toDate().toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}