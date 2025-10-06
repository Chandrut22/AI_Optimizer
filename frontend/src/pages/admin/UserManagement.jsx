import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  UserPlus,
  UserMinus,
  Shield,
  AlertTriangle,
  CheckCircle,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ Correct import path for API functions
import {
  fetchAllUsers,
  promoteUser,
  demoteUser,
  deleteUser,
} from "@/api/adminService";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // ✅ Fetch all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // ✅ Filter + Sort
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      if (sortField === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      return sortDirection === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });

    return filtered;
  }, [users, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePromote = async (id) => {
    await promoteUser(id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: "ADMIN" } : u))
    );
  };

  const handleDemote = async (id) => {
    await demoteUser(id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: "USER" } : u))
    );
  };

  

  const handleDelete = async (id) => {
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const SortIcon = ({ field }) =>
    sortField !== field ? (
      <ChevronUp className="h-4 w-4 opacity-30" />
    ) : sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Total: {filteredAndSortedUsers.length}
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSortField("createdAt");
                  setSortDirection("desc");
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ✅ User Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : paginatedUsers.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No users found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-border rounded-lg text-sm">
                  <thead>
                    <tr className="bg-muted text-left">
                      <th className="p-3 cursor-pointer">#</th>
                      <th
                        className="p-3 cursor-pointer"
                        onClick={() => setSortField("name")}
                      >
                        Name <SortIcon field="name" />
                      </th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Credits</th>
                      <th
                        className="p-3 cursor-pointer"
                        onClick={() => setSortField("createdAt")}
                      >
                        Joined <SortIcon field="createdAt" />
                      </th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={cn(
                          "border-t hover:bg-muted/50 transition-colors"
                        )}
                      >
                        <td className="p-3">{startIndex + index + 1}</td>
                        <td className="p-3 font-medium">{user.name}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          {user.role === "ADMIN" ? (
                            <span className="text-purple-600 font-semibold">
                              ADMIN
                            </span>
                          ) : (
                            <span className="text-gray-600">USER</span>
                          )}
                        </td>
                        <td className="p-3">{user.provider}</td>
                        <td className="p-3">
                          {user.credits ?? <span className="text-gray-400">—</span>}
                        </td>
                        <td className="p-3">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 flex gap-2 justify-end">
                          {user.role === "USER" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handlePromote(user.id)}
                                >
                                  <Shield className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Promote to Admin</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDemote(user.id)}
                                >
                                  <UserMinus className="h-4 w-4 text-yellow-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Demote to User</TooltipContent>
                            </Tooltip>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Trash2 className="h-4 w-4 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete User</TooltipContent>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ✅ Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <p>
                    Page {currentPage} of {totalPages}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default UserManagement;
