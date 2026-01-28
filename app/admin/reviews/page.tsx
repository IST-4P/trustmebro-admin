"use client";

import { useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { RefreshCw, Eye, Trash2, Star, Image as ImageIcon, Store } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  getReviews,
  deleteReview,
  getRatingStars,
  ReviewListItem,
} from "@/lib/api/reviews";

export default function ReviewsPage() {
  // State
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Filters
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [productIdFilter, setProductIdFilter] = useState<string>("");
  const [shopIdFilter, setShopIdFilter] = useState<string>("");

  // Detail dialog
  const [selectedReview, setSelectedReview] = useState<ReviewListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Delete dialog
  const [reviewToDelete, setReviewToDelete] = useState<ReviewListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (ratingFilter !== "all") params.rating = Number(ratingFilter);
      if (productIdFilter) params.productId = productIdFilter;
      if (shopIdFilter) params.shopId = shopIdFilter;

      const response = await getReviews(params);
      setReviews(response.data.reviews || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Không thể tải danh sách đánh giá");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, ratingFilter, productIdFilter, shopIdFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [ratingFilter, productIdFilter, shopIdFilter]);

  // Handle delete
  const handleDelete = async () => {
    if (!reviewToDelete) return;

    // Need shopId to delete - get from review's product shop or require input
    const shopId = shopIdFilter || prompt("Nhập Shop ID để xóa đánh giá:");
    if (!shopId) {
      toast.error("Cần Shop ID để xóa đánh giá");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReview(reviewToDelete.id, shopId);
      toast.success("Xóa đánh giá thành công");
      setReviewToDelete(null);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Không thể xóa đánh giá");
    } finally {
      setIsDeleting(false);
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const columns: ColumnDef<ReviewListItem>[] = [
    {
      accessorKey: "productName",
      header: "Sản phẩm",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <p className="font-medium truncate">{row.original.productName}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {row.original.productId.slice(0, 8)}...
          </p>
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "Người đánh giá",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.avatar && (
            <img
              src={row.original.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span>{row.original.username || "Ẩn danh"}</span>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Đánh giá",
      cell: ({ row }) => renderStars(row.original.rating),
    },
    {
      accessorKey: "content",
      header: "Nội dung",
      cell: ({ row }) => (
        <div className="max-w-[250px]">
          <p className="text-sm truncate">{row.original.content}</p>
          {row.original.medias && row.original.medias.length > 0 && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              <span>{row.original.medias.length} ảnh/video</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "reply",
      header: "Phản hồi",
      cell: ({ row }) =>
        row.original.reply ? (
          <Badge variant="success">Đã phản hồi</Badge>
        ) : (
          <Badge variant="secondary">Chưa phản hồi</Badge>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const review = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedReview(review);
                setIsDetailOpen(true);
              }}
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReviewToDelete(review)}
              title="Xóa"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: "Đánh giá" }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Đánh giá</h1>
          <p className="text-muted-foreground">
            Kiểm duyệt đánh giá của người dùng ({totalItems} đánh giá)
          </p>
        </div>
        <Button variant="outline" onClick={fetchReviews} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="space-y-2">
          <Label>Số sao</Label>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Product ID</Label>
          <Input
            value={productIdFilter}
            onChange={(e) => setProductIdFilter(e.target.value)}
            placeholder="UUID sản phẩm..."
            className="w-[250px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Shop ID</Label>
          <Input
            value={shopIdFilter}
            onChange={(e) => setShopIdFilter(e.target.value)}
            placeholder="UUID shop..."
            className="w-[250px]"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={reviews}
        searchKey="content"
        searchPlaceholder="Tìm nội dung..."
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Trang trước
          </Button>
          <span className="text-sm">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
          >
            Trang sau
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
            <DialogDescription>Thông tin chi tiết về đánh giá sản phẩm</DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {selectedReview.avatar ? (
                    <img
                      src={selectedReview.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xl font-bold text-primary">${(selectedReview.username || "A")[0].toUpperCase()}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-primary">
                      {(selectedReview.username || "A")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{selectedReview.username || "Ẩn danh"}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedReview.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {renderStars(selectedReview.rating)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedReview.rating}/5 sao
                  </p>
                </div>
              </div>

              {/* Product Info */}
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Sản phẩm</p>
                <p className="font-medium">{selectedReview.productName}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  ID: {selectedReview.productId}
                </p>
              </div>

              {/* Review Content */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Nội dung đánh giá</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                  {selectedReview.content}
                </p>
              </div>

              {/* Media */}
              {selectedReview.medias && selectedReview.medias.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Hình ảnh/Video ({selectedReview.medias.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedReview.medias.map((media, index) => (
                      <a
                        key={index}
                        href={media}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-square"
                      >
                        <img
                          src={media}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border hover:opacity-80 transition-opacity"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/100?text=Error";
                          }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Shop Reply */}
              {selectedReview.reply && (
                <div className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-primary">Phản hồi từ Shop</p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedReview.reply.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {formatDate(selectedReview.reply.createdAt)}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Xóa đánh giá"
        description="Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}
