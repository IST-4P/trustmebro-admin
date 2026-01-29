import { useEffect, useState } from 'react';
import { Star, MessageSquare, Edit2, Trash2, X, Check } from 'lucide-react';
import type { Review } from '../types/dto';
import { reviewsApi } from '../services/api';
import { mockReviewsData } from '../services/mockData';

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    loadReviews();
  }, [currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await reviewsApi.getAll({ page: currentPage, limit: 10 });
      // setReviews(response.data);
      // setTotalPages(Math.ceil(response.meta.total / response.meta.limit));

      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setReviews(mockReviewsData.data);
      setTotalPages(Math.ceil(mockReviewsData.meta.total / mockReviewsData.meta.limit));
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReply = async (reviewId: string) => {
    if (!replyContent.trim()) return;

    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await reviewsApi.createReply({
      //   reviewId,
      //   content: replyContent.trim(),
      // });
      // setReviews(reviews.map(r => r.id === reviewId ? response.data : r));

      // Using mock update for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setReviews(reviews.map(r =>
        r.id === reviewId
          ? {
              ...r,
              reply: {
                id: `reply-${Date.now()}`,
                content: replyContent.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            }
          : r
      ));

      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to create reply:', error);
      alert('Failed to create reply');
    }
  };

  const handleUpdateReply = async (replyId: string, reviewId: string) => {
    if (!replyContent.trim()) return;

    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await reviewsApi.updateReply({
      //   replyId,
      //   content: replyContent.trim(),
      // });
      // setReviews(reviews.map(r => r.id === reviewId ? response.data : r));

      // Using mock update for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setReviews(reviews.map(r =>
        r.id === reviewId && r.reply
          ? {
              ...r,
              reply: {
                ...r.reply,
                content: replyContent.trim(),
                updatedAt: new Date().toISOString(),
              },
            }
          : r
      ));

      setEditingReply(null);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to update reply:', error);
      alert('Failed to update reply');
    }
  };

  const handleDeleteReply = async (replyId: string, reviewId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      // TODO: Replace with actual API call when backend is ready
      // await reviewsApi.deleteReply(replyId);

      setReviews(reviews.map(r =>
        r.id === reviewId ? { ...r, reply: undefined } : r
      ));
    } catch (error) {
      console.error('Failed to delete reply:', error);
      alert('Failed to delete reply');
    }
  };

  const startReply = (reviewId: string) => {
    setReplyingTo(reviewId);
    setEditingReply(null);
    setReplyContent('');
  };

  const startEditReply = (reviewId: string, currentContent: string) => {
    setEditingReply(reviewId);
    setReplyingTo(null);
    setReplyContent(currentContent);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setEditingReply(null);
    setReplyContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-neutral-900 mb-2">Reviews</h1>
          <p className="text-neutral-600">Manage customer reviews and feedback</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-500">Loading reviews...</div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-xl border border-neutral-200">
          <Star className="text-neutral-400 mb-4" size={48} />
          <p className="text-neutral-900 mb-1">No reviews yet</p>
          <p className="text-neutral-600 text-sm">Customer reviews will appear here</p>
        </div>
      ) : (
        <>
          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-neutral-200 p-6"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-neutral-900">{review.userName}</p>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          review.status === 'approved'
                            ? 'bg-green-50 text-green-700'
                            : review.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-neutral-600 mb-2">{review.productName}</p>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-neutral-300'
                          }
                        />
                      ))}
                      <span className="ml-2 text-sm text-neutral-600">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-neutral-700">{review.content}</p>
                </div>

                {/* Reply Section */}
                {review.reply ? (
                  <div className="bg-neutral-50 rounded-lg p-4 border-l-4 border-neutral-900">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-neutral-600" />
                        <p className="text-sm font-medium text-neutral-900">Your Reply</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditReply(review.id, review.reply!.content)}
                          className="p-1 text-neutral-600 hover:text-neutral-900"
                          title="Edit reply"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteReply(review.reply!.id, review.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Delete reply"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {editingReply === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                          placeholder="Edit your reply..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateReply(review.reply!.id, review.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-sm"
                          >
                            <Check size={14} />
                            Update
                          </button>
                          <button
                            onClick={cancelReply}
                            className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-sm"
                          >
                            <X size={14} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-neutral-700">{review.reply.content}</p>
                        <p className="text-xs text-neutral-500 mt-2">
                          {new Date(review.reply.updatedAt).toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                ) : replyingTo === review.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                      placeholder="Write your reply..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCreateReply(review.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-sm"
                      >
                        <Check size={14} />
                        Reply
                      </button>
                      <button
                        onClick={cancelReply}
                        className="flex items-center gap-1 px-3 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-sm"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startReply(review.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                  >
                    <MessageSquare size={16} />
                    Reply to Review
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-neutral-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
