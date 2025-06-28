import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Search,
  UserPlus,
  UserMinus,
  Crown,
  ChevronLeft,
  ChevronRight,
  Settings,
  Shield,
  Activity,
  Filter,
  Loader2,
  RefreshCw,
  BarChart3,
  CreditCard,
  Calendar,
  Globe,
  User,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  provider: "LOCAL" | "GOOGLE";
  usageCount: number;
  credits: number;
  createdAt: string;
  lastLogin: string;
  status: "active" | "inactive";
}

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  activeUsers: number;
  newThisMonth: number;
  totalUsage: number;
  totalCreditsUsed: number;
}

// Mock function to check if user has admin role
const checkAdminAccess = (): boolean => {
  // In real app, this would check JWT token or user context
  const userRole = localStorage.getItem("userRole") || "USER";
  return userRole === "ADMIN";
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAdmins: 0,
    activeUsers: 0,
    newThisMonth: 0,
    totalUsage: 0,
    totalCreditsUsed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
  const [providerFilter, setProviderFilter] = useState<
    "all" | "LOCAL" | "GOOGLE"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [promotingUsers, setPromotingUsers] = useState<Set<string>>(new Set());
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "ADMIN",
      provider: "LOCAL",
      usageCount: 245,
      credits: 750,
      createdAt: "2024-01-15T10:30:00Z",
      lastLogin: "2024-01-20T14:45:00Z",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "USER",
      provider: "GOOGLE",
      usageCount: 89,
      credits: 450,
      createdAt: "2024-01-10T09:15:00Z",
      lastLogin: "2024-01-19T16:20:00Z",
      status: "active",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "USER",
      provider: "LOCAL",
      usageCount: 156,
      credits: 320,
      createdAt: "2024-01-08T11:45:00Z",
      lastLogin: "2024-01-18T13:10:00Z",
      status: "active",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "USER",
      provider: "GOOGLE",
      usageCount: 23,
      credits: 100,
      createdAt: "2024-01-05T15:20:00Z",
      lastLogin: "2024-01-17T10:30:00Z",
      status: "inactive",
    },
    {
      id: "5",
      name: "David Brown",
      email: "david@example.com",
      role: "ADMIN",
      provider: "LOCAL",
      usageCount: 412,
      credits: 890,
      createdAt: "2024-01-01T08:00:00Z",
      lastLogin: "2024-01-16T17:45:00Z",
      status: "active",
    },
    {
      id: "6",
      name: "Emily Davis",
      email: "emily@example.com",
      role: "USER",
      provider: "GOOGLE",
      usageCount: 67,
      credits: 210,
      createdAt: "2023-12-28T12:30:00Z",
      lastLogin: "2024-01-15T09:25:00Z",
      status: "active",
    },
  ];

  useEffect(() => {
    // Check admin access on component mount
    if (!checkAdminAccess()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, [navigate, toast]);

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filter by provider
    if (providerFilter !== "all") {
      filtered = filtered.filter((user) => user.provider === providerFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, providerFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Simulate API call to GET /api/admin/users
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setUsers(mockUsers);

      // Calculate stats
      const totalUsers = mockUsers.length;
      const totalAdmins = mockUsers.filter((u) => u.role === "ADMIN").length;
      const activeUsers = mockUsers.filter((u) => u.status === "active").length;
      const newThisMonth = mockUsers.filter(
        (u) =>
          new Date(u.createdAt) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      ).length;
      const totalUsage = mockUsers.reduce((sum, u) => sum + u.usageCount, 0);
      const totalCreditsUsed = mockUsers.reduce((sum, u) => sum + u.credits, 0);

      setStats({
        totalUsers,
        totalAdmins,
        activeUsers,
        newThisMonth,
        totalUsage,
        totalCreditsUsed,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "User data has been updated successfully.",
    });
  };

  const handlePromoteUser = async (userId: string) => {
    if (!checkAdminAccess()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to promote users.",
        variant: "destructive",
      });
      return;
    }

    setPromotingUsers((prev) => new Set(prev).add(userId));

    try {
      // Simulate API call to PUT /api/admin/promote/{userId}
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, role: user.role === "ADMIN" ? "USER" : "ADMIN" }
            : user,
        ),
      );

      const user = users.find((u) => u.id === userId);
      const newRole = user?.role === "ADMIN" ? "USER" : "ADMIN";

      toast({
        title: "User role updated",
        description: `${user?.name} has been ${newRole === "ADMIN" ? "promoted to admin" : "demoted to user"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPromotingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!checkAdminAccess()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete users.",
        variant: "destructive",
      });
      return;
    }

    setDeletingUsers((prev) => new Set(prev).add(userId));

    try {
      // Simulate API call to DELETE /api/admin/delete/{userId}
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userToDelete = users.find((u) => u.id === userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      toast({
        title: "User deleted",
        description: `${userToDelete?.name} has been removed from the system.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col">
      <Header isLoggedIn={true} userName="Admin User" />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-inter text-[#111827] dark:text-[#F8FAFC]">
                    Admin Dashboard
                  </h1>
                  <p className="text-[#6B7280] dark:text-[#94A3B8]">
                    Manage users, roles, and platform access controls
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={cn("h-4 w-4", refreshing && "animate-spin")}
                />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card className="bg-[#FFFFFF] dark:bg-[#1E293B] border-[#E5E7EB] dark:border-[#334155]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-[#111827] dark:text-[#F8FAFC]">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFFFF] dark:bg-[#1E293B] border-[#E5E7EB] dark:border-[#334155]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                      Admins
                    </p>
                    <p className="text-2xl font-bold text-[#111827] dark:text-[#F8FAFC]">
                      {stats.totalAdmins}
                    </p>
                  </div>
                  <Crown className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFFFF] dark:bg-[#1E293B] border-[#E5E7EB] dark:border-[#334155]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-[#111827] dark:text-[#F8FAFC]">
                      {stats.activeUsers}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFFFF] dark:bg-[#1E293B] border-[#E5E7EB] dark:border-[#334155]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                      New This Month
                    </p>
                    <p className="text-2xl font-bold text-[#111827] dark:text-[#F8FAFC]">
                      +{stats.newThisMonth}
                    </p>
                  </div>
                  <UserPlus className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFFFF] dark:bg-[#1E293B] border-[#E5E7EB] dark:border-[#334155]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                      Total Usage
                    </p>
                    <p className="text-2xl font-bold text-[#111827] dark:text-[#F8FAFC]">
                      {stats.totalUsage.toLocaleString()}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFFFF] dark:bg-[#1E293B] border-[#E5E7EB] dark:border-[#334155]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                      Credits Used
                    </p>
                    <p className="text-2xl font-bold text-[#111827] dark:text-[#F8FAFC]">
                      {stats.totalCreditsUsed.toLocaleString()}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management Section */}
          <Card className="bg-[#FFFFFF] dark:bg-[#1E293B] border-[#E5E7EB] dark:border-[#334155]">
            <CardHeader className="bg-[#E2E8F0] dark:bg-[#1E293B] rounded-t-lg border-b border-[#E5E7EB] dark:border-[#334155]">
              <CardTitle className="flex items-center gap-2 text-[#111827] dark:text-[#F8FAFC]">
                <Users className="h-5 w-5" />
                User Management
                <Badge variant="secondary" className="ml-2">
                  {filteredUsers.length} users
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Filters and Search */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B7280] dark:text-[#94A3B8]" />
                  <Input
                    placeholder="Search by ID, name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#F3F4F6] dark:bg-[#334155] border-[#D1D5DB] dark:border-[#475569]"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#6B7280] dark:text-[#94A3B8]" />
                    <Select
                      value={roleFilter}
                      onValueChange={(value: "all" | "USER" | "ADMIN") =>
                        setRoleFilter(value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="USER">Users</SelectItem>
                        <SelectItem value="ADMIN">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#6B7280] dark:text-[#94A3B8]" />
                    <Select
                      value={providerFilter}
                      onValueChange={(value: "all" | "LOCAL" | "GOOGLE") =>
                        setProviderFilter(value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        <SelectItem value="LOCAL">Local</SelectItem>
                        <SelectItem value="GOOGLE">Google</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-[#6B7280] dark:text-[#94A3B8]">
                    Loading users...
                  </span>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#E5E7EB] dark:border-[#334155]">
                          <th className="text-left py-4 px-4 font-semibold text-sm text-[#111827] dark:text-[#F8FAFC]">
                            User ID
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-sm text-[#111827] dark:text-[#F8FAFC]">
                            Name
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-sm text-[#111827] dark:text-[#F8FAFC]">
                            Email
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-sm text-[#111827] dark:text-[#F8FAFC]">
                            Role
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-sm text-[#111827] dark:text-[#F8FAFC]">
                            Provider
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-sm text-[#111827] dark:text-[#F8FAFC]">
                            Usage
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-sm text-[#111827] dark:text-[#F8FAFC]">
                            Credits
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-sm text-[#111827] dark:text-[#F8FAFC]">
                            Created At
                          </th>
                          <th className="text-left py-4 px-4 font-semibold text-sm text-[#111827] dark:text-[#F8FAFC]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-[#E5E7EB] dark:border-[#334155] hover:bg-[#F9FAFB] dark:hover:bg-[#334155]/30 transition-colors"
                          >
                            <td className="py-4 px-4 text-sm font-mono text-[#111827] dark:text-[#F8FAFC]">
                              #{user.id}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                                    {user.status}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-[#111827] dark:text-[#F8FAFC]">
                              {user.email}
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                className={cn(
                                  "text-white font-medium",
                                  user.role === "ADMIN"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-blue-500 hover:bg-blue-600",
                                )}
                              >
                                {user.role === "ADMIN" ? (
                                  <>
                                    <Crown className="w-3 h-3 mr-1" />
                                    Admin
                                  </>
                                ) : (
                                  <>
                                    <User className="w-3 h-3 mr-1" />
                                    User
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                variant="outline"
                                className={cn(
                                  user.provider === "GOOGLE"
                                    ? "border-green-500 text-green-700 dark:text-green-400"
                                    : "border-gray-500 text-gray-700 dark:text-gray-400",
                                )}
                              >
                                {user.provider === "GOOGLE" ? (
                                  <>
                                    <Globe className="w-3 h-3 mr-1" />
                                    Google
                                  </>
                                ) : (
                                  <>
                                    <Shield className="w-3 h-3 mr-1" />
                                    Local
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-sm text-[#111827] dark:text-[#F8FAFC]">
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3 text-purple-500" />
                                {user.usageCount.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-[#111827] dark:text-[#F8FAFC]">
                              <div className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-orange-500" />
                                {user.credits.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-[#6B7280] dark:text-[#94A3B8]">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(user.createdAt)}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handlePromoteUser(user.id)}
                                  disabled={promotingUsers.has(user.id)}
                                  className="bg-[#10B981] hover:bg-[#10B981]/90 text-white"
                                >
                                  {promotingUsers.has(user.id) ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : user.role === "ADMIN" ? (
                                    <>
                                      <UserMinus className="w-3 h-3 mr-1" />
                                      Demote
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus className="w-3 h-3 mr-1" />
                                      Promote
                                    </>
                                  )}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      disabled={deletingUsers.has(user.id)}
                                      className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white"
                                    >
                                      {deletingUsers.has(user.id) ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <>
                                          <UserMinus className="w-3 h-3 mr-1" />
                                          Delete
                                        </>
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Delete User Account
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete{" "}
                                        <strong>{user.name}</strong>'s account (
                                        {user.email})?
                                        <br />
                                        <br />
                                        This action cannot be undone and will
                                        permanently remove:
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                          <li>All user data and preferences</li>
                                          <li>
                                            {user.usageCount} usage records
                                          </li>
                                          <li>{user.credits} credits</li>
                                          <li>
                                            Account history since{" "}
                                            {formatDate(user.createdAt)}
                                          </li>
                                        </ul>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteUser(user.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Delete User
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#E5E7EB] dark:border-[#334155]">
                      <p className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                        Showing {indexOfFirstUser + 1} to{" "}
                        {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                        {filteredUsers.length} users
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(totalPages, 5) },
                            (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <Button
                                  key={pageNum}
                                  variant={
                                    currentPage === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => paginate(pageNum)}
                                  className="w-8 h-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              );
                            },
                          )}
                          {totalPages > 5 && (
                            <>
                              <span className="px-2 text-[#6B7280] dark:text-[#94A3B8]">
                                ...
                              </span>
                              <Button
                                variant={
                                  currentPage === totalPages
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => paginate(totalPages)}
                                className="w-8 h-8 p-0"
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
