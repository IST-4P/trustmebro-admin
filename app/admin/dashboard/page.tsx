"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Loader2, ShoppingCart, Store, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Define the API URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://trustmebro-admin.hacmieu.xyz";

interface DashboardData {
  data: {
    orders: {
      orderComplete: number;
      orderPending: number;
      orderCancelled: number;
      orderConfirmed: number;
      orderShipping: number;
      totalRevenue: number;
      totalOrders: number;
    };
    users: number;
    shops: number;
  };
  message: string;
  statusCode: number;
  processId: string;
  duration: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/dashboard`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Không thể tải dữ liệu bảng điều khiển.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-2">
        <p className="text-destructive font-medium">
          {error || "No data available"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm underline text-muted-foreground hover:text-primary"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { orders, users, shops } = data.data;

  // Transform data for PieChart
  const pieData = [
    { name: "Hoàn thành", value: orders.orderComplete, color: "#10B981" }, // Green-500
    { name: "Chờ xử lý", value: orders.orderPending, color: "#F97316" }, // Orange-500
    { name: "Đã hủy", value: orders.orderCancelled, color: "#EF4444" }, // Red-500
    { name: "Đã xác nhận", value: orders.orderConfirmed, color: "#3B82F6" }, // Blue-500
    { name: "Đang giao", value: orders.orderShipping, color: "#6366F1" }, // Indigo-500
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Tổng quan" }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground">
            Theo dõi hoạt động và hiệu suất của nền tảng
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(orders.totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Tổng đơn hàng"
          value={orders.totalOrders.toLocaleString("vi-VN")}
          icon={ShoppingCart}
        />
        <StatCard
          title="Người dùng"
          value={users.toLocaleString("vi-VN")}
          icon={Users}
        />
        <StatCard
          title="Cửa hàng"
          value={shops.toLocaleString("vi-VN")}
          icon={Store}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Pie Chart - Takes up 4 columns on large screens */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Phân bố trạng thái đơn hàng</CardTitle>
            <CardDescription>
              Tỷ lệ các đơn hàng theo trạng thái xử lý
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "Số lượng"]}
                    contentStyle={{ borderRadius: "8px" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown List - Takes up 3 columns */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Chi tiết đơn hàng</CardTitle>
            <CardDescription>
              Số lượng cụ thể theo từng trạng thái
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <OrderStatusRow
                label="Hoàn thành"
                count={orders.orderComplete}
                color="bg-green-500"
              />
              <OrderStatusRow
                label="Chờ xử lý"
                count={orders.orderPending}
                color="bg-orange-500"
              />
              <OrderStatusRow
                label="Đã xác nhận"
                count={orders.orderConfirmed}
                color="bg-blue-500"
              />
              <OrderStatusRow
                label="Đang giao"
                count={orders.orderShipping}
                color="bg-indigo-500"
              />
              <OrderStatusRow
                label="Đã hủy"
                count={orders.orderCancelled}
                color="bg-red-500"
              />
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tổng cộng</span>
                <span className="text-xl font-bold">{orders.totalOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OrderStatusRow({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="font-semibold">{count}</span>
    </div>
  );
}
