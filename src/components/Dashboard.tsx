import { useEffect, useState } from "react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Clock,
  DollarSign,
} from "lucide-react";
import type { DashboardSellerResponseDto, Order, Review } from "../types/dto";
import { dashboardApi, ordersApi, reviewsApi } from "../services/api";
import {
  mockDashboardData,
  mockRecentOrders,
  mockRecentReviews,
} from "../services/mockData";
import { Link } from "react-router-dom";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardSellerResponseDto | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // TODO: Replace with actual API calls when backend is ready
      // const [statsRes, ordersRes, reviewsRes] = await Promise.all([
      //   dashboardApi.getStats(),
      //   ordersApi.getAll({ page: 1, limit: 5 }),
      //   reviewsApi.getAll({ page: 1, limit: 5 }),
      // ]);
      // setStats(statsRes);
      // setRecentOrders(ordersRes.data);
      // setRecentReviews(reviewsRes.data);

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
      setStats(mockDashboardData);
      setRecentOrders(mockRecentOrders);
      setRecentReviews(mockRecentReviews);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) return null;

  const kpiCards = [
    {
      label: "Total Products",
      value: stats.data.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Orders",
      value: stats.data.totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Pending Orders",
      value: stats.data.pendingOrders,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Revenue",
      value: `$${stats.data.revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-neutral-900 mb-2">Dashboard</h1>
        <p className="text-neutral-600">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-6 border border-neutral-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-neutral-600 mb-1">{card.label}</p>
                  <p className="text-2xl font-semibold text-neutral-900">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={card.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Recent Orders</h2>
          <Link
            to="/orders"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {order.userName}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        order.status === "pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : order.status === "confirmed"
                            ? "bg-blue-50 text-blue-700"
                            : order.status === "processing"
                              ? "bg-purple-50 text-purple-700"
                              : order.status === "shipped"
                                ? "bg-indigo-50 text-indigo-700"
                                : order.status === "delivered"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Recent Reviews</h2>
          <Link
            to="/reviews"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-neutral-200">
          {recentReviews.map((review) => (
            <div key={review.id} className="px-6 py-4 hover:bg-neutral-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-neutral-900">
                    {review.userName}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {review.productName}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "text-yellow-400 fill-current"
                          : "text-neutral-300"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-neutral-700">{review.content}</p>
              <p className="text-xs text-neutral-500 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
