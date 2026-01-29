import { useEffect, useState } from 'react';
import { Play, Trash2, Clock, CheckCircle, XCircle, Video as VideoIcon } from 'lucide-react';
import type { Video } from '../types/dto';
import { mediaApi } from '../services/api';
import { mockVideosData } from '../services/mockData';

export function Media() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadVideos();
  }, [currentPage]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await mediaApi.getAll({ page: currentPage, limit: 12 });
      // setVideos(response.data);
      // setTotalPages(Math.ceil(response.meta.total / response.meta.limit));

      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      setVideos(mockVideosData.data);
      setTotalPages(Math.ceil(mockVideosData.meta.total / mockVideosData.meta.limit));
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      // TODO: Replace with actual API call when backend is ready
      // await mediaApi.delete(id);

      setVideos(videos.filter(v => v.id !== id));
      if (selectedVideo?.id === id) {
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: Video['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'processing':
        return <Clock size={16} className="text-orange-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
    }
  };

  const getStatusColor = (status: Video['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-green-50 text-green-700';
      case 'processing':
        return 'bg-orange-50 text-orange-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-neutral-900 mb-2">Media Library</h1>
          <p className="text-neutral-600">Manage your product videos and media content</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-500">Loading videos...</div>
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-xl border border-neutral-200">
          <VideoIcon className="text-neutral-400 mb-4" size={48} />
          <p className="text-neutral-900 mb-1">No videos yet</p>
          <p className="text-neutral-600 text-sm">Upload videos to showcase your products</p>
        </div>
      ) : (
        <>
          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-video bg-neutral-100">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <Play size={24} className="text-neutral-900 ml-1" />
                    </div>
                  </button>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-neutral-900 flex-1 line-clamp-2">
                      {video.title}
                    </h3>
                  </div>

                  {video.description && (
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                      {video.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(video.status)}`}>
                      {getStatusIcon(video.status)}
                      <span>{video.status}</span>
                    </div>

                    <button
                      onClick={() => handleDelete(video.id)}
                      disabled={video.status === 'processing'}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete video"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-500 mt-3">
                    Uploaded {new Date(video.createdAt).toLocaleDateString()}
                  </p>
                </div>
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

      {/* Video Preview Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-neutral-900">
              {selectedVideo.status === 'ready' ? (
                <video
                  src={selectedVideo.url}
                  poster={selectedVideo.thumbnail}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    {getStatusIcon(selectedVideo.status)}
                    <p className="text-white mt-2">
                      Video is {selectedVideo.status}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {selectedVideo.title}
              </h3>
              {selectedVideo.description && (
                <p className="text-neutral-600 mb-4">{selectedVideo.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>Duration: {formatDuration(selectedVideo.duration)}</span>
                <span>Uploaded {new Date(selectedVideo.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedVideo.id);
                    setSelectedVideo(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
