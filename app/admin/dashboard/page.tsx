"use client";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign, Users, Store, Eye, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockChartData, mockCategorySales, mockOrderStatusData, mockOrders } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const COLORS = ["#F97316", "#3B82F6", "#60A5FA", "#10B981", "#EF4444"];

export default function DashboardPage() {
  const recentOrders = mockOrders.slice(0, 5);

  return (
    <div>
      <Breadcrumb items={[{ label: "Tổng quan" }]} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground">
            Theo dõi hoạt động và hiệu suất của nền tảng
          </p>
        </div>
        <Select defaultValue="7days">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hôm nay</SelectItem>
            <SelectItem value="7days">7 ngày qua</SelectItem>
            <SelectItem value="30days">30 ngày qua</SelectItem>
            <SelectItem value="custom">Tùy chỉnh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Tổng đơn hàng"
          value="8,342"
          change={12.5}
          changeType="increase"
          icon={ShoppingCart}
        />
        <StatCard
          title="Doanh thu (GMV)"
          value={formatCurrency(15678000000)}
          change={8.3}
          changeType="increase"
          icon={DollarSign}
        />
        <StatCard
          title="Người dùng mới"
          value="234"
          change={-3.2}
          changeType="decrease"
          icon={Users}
        />
        <StatCard
          title="Shop hoạt động"
          value="87"
          change={5.1}
          changeType="increase"
          icon={Store}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng & Doanh thu</CardTitle>
            <CardDescription>Theo dõi xu hướng 7 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? formatCurrency(value) : value,
                    name === "orders" ? "Đơn hàng" : "Doanh thu",
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Đơn hàng"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F97316"
                  strokeWidth={2}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
            <CardDescription>Phân bổ theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockOrderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockOrderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top danh mục theo doanh số</CardTitle>
          <CardDescription>5 danh mục bán chạy nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockCategorySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "sales" ? formatCurrency(value) : value,
                  name === "orders" ? "Đơn hàng" : "Doanh số",
                ]}
              />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" name="Doanh số" />
              <Bar dataKey="orders" fill="#60A5FA" name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardDescription>5 đơn hàng mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Người mua</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.buyerName}</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.orderStatus === "delivered"
                            ? "success"
                            : order.orderStatus === "cancelled"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {order.orderStatus === "pending" && "Chờ xử lý"}
                        {order.orderStatus === "confirmed" && "Đã xác nhận"}
                        {order.orderStatus === "shipping" && "Đang giao"}
                        {order.orderStatus === "delivered" && "Hoàn tất"}
                        {order.orderStatus === "cancelled" && "Đã hủy"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Việc cần xử lý</CardTitle>
            <CardDescription>Các tác vụ cần chú ý</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Store className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Shop chờ duyệt</p>
                <p className="text-sm text-muted-foreground">1 cửa hàng mới</p>
              </div>
              <span className="text-2xl font-bold text-orange-600">1</span>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Review bị báo cáo</p>
                <p className="text-sm text-muted-foreground">Cần kiểm duyệt</p>
              </div>
              <span className="text-2xl font-bold text-red-600">1</span>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <XCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Thanh toán thất bại</p>
                <p className="text-sm text-muted-foreground">Cần xử lý</p>
              </div>
              <span className="text-2xl font-bold text-yellow-600">1</span>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Sản phẩm sắp hết hàng</p>
                <p className="text-sm text-muted-foreground">Cần nhắc nhở shop</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
