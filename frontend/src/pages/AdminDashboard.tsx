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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  lastLogin: string;
  status: "active" | "inactive";
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      createdAt: "2024-01-15",
      lastLogin: "2024-01-20",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      createdAt: "2024-01-10",
      lastLogin: "2024-01-19",
      status: "active",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "user",
      createdAt: "2024-01-08",
      lastLogin: "2024-01-18",
      status: "active",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "user",
      createdAt: "2024-01-05",
      lastLogin: "2024-01-17",
      status: "inactive",
    },
    {
      id: "5",
      name: "David Brown",
      email: "david@example.com",
      role: "admin",
      createdAt: "2024-01-01",
      lastLogin: "2024-01-16",
      status: "active",
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchUsers = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, users]);

  const handlePromoteUser = async (userId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, role: user.role === "admin" ? "user" : "admin" }
            : user,
        ),
      );

      const user = users.find((u) => u.id === userId);
      const newRole = user?.role === "admin" ? "user" : "admin";

      toast({
        title: "User role updated",
        description: `${user?.name} has been ${newRole === "admin" ? "promoted to admin" : "demoted to user"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--admin-bg, #F8FAFC)",
      }}
    >
      <style>{`
        :root {
          --admin-bg: #F8FAFC;
          --admin-card-bg: #FFFFFF;
          --admin-header-bg: #E2E8F0;
          --admin-text-primary: #111827;
          --admin-table-border: #E5E7EB;
          --admin-promote-btn: #10B981;
          --admin-delete-btn: #EF4444;
        }
        .dark {
          --admin-bg: #0F172A;
          --admin-card-bg: #1E293B;
          --admin-header-bg: #1E293B;
          --admin-text-primary: #F8FAFC;
          --admin-table-border: #334155;
          --admin-promote-btn: #10B981;
          --admin-delete-btn: #EF4444;
        }
      `}</style>

      <Header isLoggedIn={true} userName="Admin User" />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1
                className="text-3xl font-bold font-inter"
                style={{ color: "var(--admin-text-primary)" }}
              >
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage users, roles, and platform access controls
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card style={{ backgroundColor: "var(--admin-card-bg)" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--admin-text-primary)" }}
                    >
                      {users.length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: "var(--admin-card-bg)" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Admins</p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--admin-text-primary)" }}
                    >
                      {users.filter((u) => u.role === "admin").length}
                    </p>
                  </div>
                  <Crown className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: "var(--admin-card-bg)" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Users
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--admin-text-primary)" }}
                    >
                      {users.filter((u) => u.status === "active").length}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: "var(--admin-card-bg)" }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--admin-text-primary)" }}
                    >
                      +12
                    </p>
                  </div>
                  <UserPlus className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management Section */}
          <Card style={{ backgroundColor: "var(--admin-card-bg)" }}>
            <CardHeader
              style={{ backgroundColor: "var(--admin-header-bg)" }}
              className="rounded-t-lg"
            >
              <CardTitle
                className="flex items-center gap-2"
                style={{ color: "var(--admin-text-primary)" }}
              >
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={roleFilter}
                    onValueChange={(value: "all" | "user" | "admin") =>
                      setRoleFilter(value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">Users</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          style={{
                            borderBottom: `1px solid var(--admin-table-border)`,
                          }}
                        >
                          <th
                            className="text-left py-3 px-4 font-medium text-sm"
                            style={{ color: "var(--admin-text-primary)" }}
                          >
                            User ID
                          </th>
                          <th
                            className="text-left py-3 px-4 font-medium text-sm"
                            style={{ color: "var(--admin-text-primary)" }}
                          >
                            Name
                          </th>
                          <th
                            className="text-left py-3 px-4 font-medium text-sm"
                            style={{ color: "var(--admin-text-primary)" }}
                          >
                            Email
                          </th>
                          <th
                            className="text-left py-3 px-4 font-medium text-sm"
                            style={{ color: "var(--admin-text-primary)" }}
                          >
                            Role
                          </th>
                          <th
                            className="text-left py-3 px-4 font-medium text-sm"
                            style={{ color: "var(--admin-text-primary)" }}
                          >
                            Status
                          </th>
                          <th
                            className="text-left py-3 px-4 font-medium text-sm"
                            style={{ color: "var(--admin-text-primary)" }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((user) => (
                          <tr
                            key={user.id}
                            style={{
                              borderBottom: `1px solid var(--admin-table-border)`,
                            }}
                            className="hover:bg-accent/50 transition-colors"
                          >
                            <td
                              className="py-3 px-4 text-sm"
                              style={{ color: "var(--admin-text-primary)" }}
                            >
                              #{user.id}
                            </td>
                            <td
                              className="py-3 px-4 text-sm font-medium"
                              style={{ color: "var(--admin-text-primary)" }}
                            >
                              {user.name}
                            </td>
                            <td
                              className="py-3 px-4 text-sm"
                              style={{ color: "var(--admin-text-primary)" }}
                            >
                              {user.email}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={cn(
                                  "text-white font-medium",
                                  user.role === "admin"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-blue-500 hover:bg-blue-600",
                                )}
                              >
                                {user.role === "admin" ? (
                                  <>
                                    <Crown className="w-3 h-3 mr-1" />
                                    Admin
                                  </>
                                ) : (
                                  "User"
                                )}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  user.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  user.status === "active"
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : ""
                                }
                              >
                                {user.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handlePromoteUser(user.id)}
                                  style={{
                                    backgroundColor: "var(--admin-promote-btn)",
                                    color: "white",
                                  }}
                                  className="hover:opacity-90 transition-opacity"
                                >
                                  {user.role === "admin" ? (
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
                                      style={{
                                        backgroundColor:
                                          "var(--admin-delete-btn)",
                                        color: "white",
                                      }}
                                      className="hover:opacity-90 transition-opacity"
                                    >
                                      <UserMinus className="w-3 h-3 mr-1" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete User Account
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete{" "}
                                        <strong>{user.name}</strong>'s account?
                                        This action cannot be undone and will
                                        permanently remove all their data.
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
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-muted-foreground">
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
                          {Array.from({ length: totalPages }, (_, i) => (
                            <Button
                              key={i + 1}
                              variant={
                                currentPage === i + 1 ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => paginate(i + 1)}
                              className="w-8 h-8 p-0"
                            >
                              {i + 1}
                            </Button>
                          ))}
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
