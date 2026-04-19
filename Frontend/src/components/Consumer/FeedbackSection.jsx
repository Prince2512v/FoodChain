import React, { useState } from 'react';
import api from '../../services/api';

const FeedbackSection = ({ batchId, existingFeedbacks, onNewFeedback }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        try {
            await api.post('/consumer/feedback', {
                batchId,
                rating,
                comment,
                customerName: name || 'Anonymous'
            });
            setMessage({ type: 'success', text: 'Thank you for your feedback!' });
            setComment('');
            setName('');
            setRating(5);
            if (onNewFeedback) onNewFeedback();
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to submit feedback.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mt-6">
            <h4 className="font-extrabold text-lg text-indigo-900 mb-6 flex items-center gap-2">
                <i className="bi bi-chat-right-quote-fill text-indigo-500"></i> Consumer Feedback
            </h4>

            {/* Feedback Form */}
            <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-inner">
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-bold text-slate-700 text-sm mb-2">Rate this product:</p>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`text-3xl transition-transform hover:scale-110 focus:outline-none ${star <= rating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold tracking-widest border border-slate-200">
                        {rating} / 5 STARS
                    </span>
                </div>

                <div className="mb-4">
                    <textarea 
                        rows={3} 
                        placeholder="Share your experience with this product..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-slate-700 placeholder-slate-400 resize-none shadow-sm"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-1/2">
                        <input 
                            type="text" 
                            placeholder="Your Name (Optional)"
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm text-slate-700 placeholder-slate-400 shadow-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-1/2 md:text-right">
                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="w-full md:w-auto px-6 py-2.5 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {submitting ? 'Submitting...' : 'Post Feedback'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`mt-4 px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                        message.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
                        {message.text}
                    </div>
                )}
            </form>

            {/* Feedback List */}
            <div>
                <h5 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-4">Recent Reviews ({existingFeedbacks?.length || 0})</h5>
                
                <div className="space-y-3">
                    {existingFeedbacks && existingFeedbacks.length > 0 ? (
                        existingFeedbacks.map((f, i) => (
                            <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm text-slate-800">{f.customerName}</span>
                                        <span className="text-amber-400 text-sm tracking-widest">{ '★'.repeat(f.rating) }{ '☆'.repeat(5 - f.rating) }</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed m-0">{f.comment}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <p className="text-slate-400 text-sm italic m-0">No feedback yet. Be the first to share!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackSection;
