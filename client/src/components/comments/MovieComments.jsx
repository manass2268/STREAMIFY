import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import commentService from '../../services/commentService';

export default function MovieComments({ videoId, showCustomToast }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  const [targetLang, setTargetLang] = useState('hi');
  const [translatedTexts, setTranslatedTexts] = useState({});

  const user = auth.currentUser;

  useEffect(() => {
    loadComments();
  }, [videoId]);

  async function loadComments() {
    const list = await commentService.getComments(videoId);
    setComments(list);
  }

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    try {
      await commentService.postComment({
        videoId,
        userId: user.uid,
        userName: user.displayName,
        text,
        showLocation,
      });
      setText('');
      showCustomToast?.('Comment posted!', 'success');
      await loadComments();
    } catch (err) {
      showCustomToast?.(err.message, 'error');
    }
  };

  const handleTranslate = async (id, rawText) => {
    const result = await commentService.translateComment(rawText, targetLang);
    setTranslatedTexts((prev) => ({ ...prev, [id]: result }));
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 my-8 text-white max-w-4xl mx-auto">
      <h3 className="text-lg font-bold mb-4">Community Discussion ({comments.length})</h3>

      {/* Comment Form */}
      <form onSubmit={handlePost} className="mb-6">
        <textarea
          rows="3"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-sm text-white outline-none focus:border-purple-500 mb-2"
        />
        <div className="flex justify-between items-center text-xs">
          <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showLocation}
              onChange={(e) => setShowLocation(e.target.checked)}
              className="accent-purple-600"
            />
            Show my location publicly
          </label>
          <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded">
            Post Comment
          </button>
        </div>
      </form>

      {/* Translation Lang Picker */}
      <div className="flex justify-end items-center gap-2 mb-4 text-xs text-zinc-400">
        <span>Translate comments to:</span>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white"
        >
          <option value="en">English</option>
          <option value="hi">Hindi (हिन्दी)</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className={`p-4 rounded border ${c.isFlagged ? 'bg-red-950/10 border-red-900/50' : 'bg-zinc-800/40 border-zinc-800'}`}>
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
              <span className="font-bold text-white">{c.userName}</span>
              <span>{c.location} • {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
            </div>

            <p className="text-sm my-2">{translatedTexts[c.id] || c.text}</p>
            {c.isFlagged && <span className="text-[10px] bg-red-600/30 text-red-400 px-2 py-0.5 rounded">Flagged for review</span>}

            <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
              <button
                onClick={() => commentService.rateComment(videoId, c.id, true).then(loadComments)}
                className="hover:text-green-400"
              >
                👍 Like ({c.likes})
              </button>
              <button
                onClick={() => commentService.rateComment(videoId, c.id, false).then(loadComments)}
                className="hover:text-red-400"
              >
                👎 Dislike ({c.dislikes})
              </button>
              <button
                onClick={() => handleTranslate(c.id, c.text)}
                className="text-purple-400 hover:underline ml-auto"
              >
                Translate ({targetLang.toUpperCase()})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}