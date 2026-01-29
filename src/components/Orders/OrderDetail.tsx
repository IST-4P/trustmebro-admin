import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import type { Order } from "../../types/dto";
import { ordersApi } from "../../services/api";
import { mockOrdersData } from "../../services/mockData";

export function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // TODO: Replace with actual API call when backend is ready
      // const response = await ordersApi.getById(id);
      // setOrder(response.data);

      // Using mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      const foundOrder = mockOrdersData.data.find((o) => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Order["status"]) => {
    if (!order) return;

    try {
      setUpdating(true);

      // TODO: Replace with actual API call when backend is ready
      // const response = await ordersApi.updateStatus(order.id, { status: newStatus });
      // setOrder(response.data);

      // Using mock update for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setOrder({
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="text-neutral-400 mb-4" size={48} />
        <p className="text-neutral-900 mb-1">Order not found</p>
        <button
          onClick={() => navigate("/orders")}
          className="text-neutral-600 hover:text-neutral-900"
        >
          Back to orders
        </button>
      </div>
    );
  }

  const statusOptions: Order["status"][] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/orders")}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-neutral-900 mb-2">Order Details</h1>
          <p className="text-neutral-600">Order ID: {order.id}</p>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="font-semibold text-neutral-900">Order Items</h2>
            </div>
            <div className="divide-y divide-neutral-200">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-4 flex items-center gap-4"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.productName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-neutral-600">SKU: {item.sku}</p>
                    <p className="text-sm text-neutral-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-neutral-900">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-neutral-900">Total</p>
                <p className="font-semibold text-neutral-900">
                  ${order.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">
              Shipping Address
            </h2>
            <p className="text-neutral-700">{order.shippingAddress}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500">Name</p>
                <p className="text-neutral-900">{order.userName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Email</p>
                <p className="text-neutral-900">{order.userEmail}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">User ID</p>
                <p className="text-neutral-600 text-sm">{order.userId}</p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">
              Order Status
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 mb-2">Current Status</p>
                <span
                  className={`inline-flex px-3 py-1 text-sm rounded-full ${
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
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Update Status
                </label>
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusUpdate(e.target.value as Order["status"])
                  }
                  disabled={updating}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status?.charAt(0).toUpperCase() + status?.slice(1) ||
                        status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-neutral-200 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Created</span>
                  <span className="text-neutral-900">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Updated</span>
                  <span className="text-neutral-900">
                    {new Date(order.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
