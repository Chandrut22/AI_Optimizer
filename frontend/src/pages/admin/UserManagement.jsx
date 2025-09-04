import React, { useState, useMemo } from "react";
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
  X,
  Edit,
  Ban,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(null);
  const [showDemoteModal, setShowDemoteModal] = useState(null);
  const [showBanModal, setShowBanModal] = useState(null);
  const itemsPerPage = 10;

  // Mock user data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "USER",
      provider: "GOOGLE",
      usageCount: 15,
      credits: 85,
      createdAt: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "ADMIN",
      provider: "EMAIL",
      usageCount: 42,
      credits: 150,
      createdAt: "2024-01-10",
      status: "active",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "USER",
      provider: "EMAIL",
      usageCount: 8,
      credits: 92,
      createdAt: "2024-01-20",
      status: "active",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice.brown@example.com",
      role: "USER",
      provider: "GOOGLE",
      usageCount: 23,
      credits: 67,
      createdAt: "2024-01-18",
      status: "banned",
    },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie.wilson@example.com",
      role: "USER",
      provider: "EMAIL",
      usageCount: 31,
      credits: 119,
      createdAt: "2024-01-12",
      status: "active",
    },
    {
      id: 6,
      name: "Diana Prince",
      email: "diana.prince@example.com",
      role: "USER",
      provider: "GOOGLE",
      usageCount: 5,
      credits: 95,
      createdAt: "2024-01-22",
      status: "active",
    },
    {
      id: 7,
      name: "Edward Davis",
      email: "edward.davis@example.com",
      role: "USER",
      provider: "EMAIL",
      usageCount: 19,
      credits: 81,
      createdAt: "2024-01-16",
      status: "active",
    },
    {
      id: 8,
      name: "Fiona Green",
      email: "fiona.green@example.com",
      role: "USER",
      provider: "GOOGLE",
      usageCount: 12,
      credits: 88,
      createdAt: "2024-01-14",
      status: "active",
    },
  ]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handlePromoteUser = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, role: "ADMIN" } : user
    ));
    setShowPromoteModal(null);
  };

  const handleDemoteUser = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, role: "USER" } : user
    ));
    setShowDemoteModal(null);
  };

  const handleBanUser = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: user.status === "banned" ? "active" : "banned" } : user
    ));
    setShowBanModal(null);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    setShowDeleteModal(null);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = "danger" }) => {
    if (!isOpen) return null;

    const getIconAndColor = () => {
      switch (type) {
        case "danger":
          return { icon: AlertTriangle, color: "text-red-500" };
        case "warning":
          return { icon: AlertTriangle, color: "text-yellow-500" };
        case "confirm":
        default:
          return { icon: CheckCircle, color: "text-blue-500" };
      }
    };

    const { icon: Icon, color } = getIconAndColor();

    const getButtonVariant = () => {
      switch (type) {
        case "danger":
          return "destructive";
        case "warning":
          return "default";
        case "confirm":
        default:
          return "default";
      }
    };

    const getButtonText = () => {
      switch (type) {
        case "danger":
          return "Delete";
        case "warning":
          return "Confirm";
        case "confirm":
        default:
          return "Confirm";
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <Icon className={`h-6 w-6 ${color}`} />
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>
          <p className="text-muted-foreground mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant={getButtonVariant()}
              onClick={onConfirm}
              className={type === "warning" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredAndSortedUsers.length} users total
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSortField("createdAt");
                  setSortDirection("desc");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users ({filteredAndSortedUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  {[
                    { key: "id", label: "ID" },
                    { key: "name", label: "Name" },
                    { key: "email", label: "Email" },
                    { key: "role", label: "Role" },
                    { key: "provider", label: "Provider" },
                    { key: "status", label: "Status" },
                    { key: "usageCount", label: "Usage" },
                    { key: "credits", label: "Credits" },
                    { key: "createdAt", label: "Created At" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className="text-left p-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        <SortIcon field={column.key} />
                      </div>
                    </th>
                  ))}
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4 font-mono text-sm">{user.id}</td>
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          )}
                        >
                          {user.role === "ADMIN" && <Shield className="h-3 w-3" />}
                          {user.role}
                        </span>
                        {user.id === 999 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                                👑 Main
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Protected admin account</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                          user.provider === "GOOGLE"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        )}
                      >
                        {user.provider}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                          user.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                        )}
                      >
                        {user.status === "active" ? "Active" : "Banned"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm">{user.usageCount}</td>
                    <td className="p-4 font-mono text-sm">{user.credits}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.id === 999 && (
                          <span className="text-xs text-muted-foreground italic">
                            Protected account
                          </span>
                        )}
                        {/* Promote to Admin Button */}
                        {user.role !== "ADMIN" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPromoteModal(user)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                <UserPlus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Promote to Admin</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Demote from Admin Button */}
                        {user.role === "ADMIN" && user.id !== 999 && ( /* Don't allow demoting the main admin */
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDemoteModal(user)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Demote from Admin</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Ban/Unban User Button */}
                        {user.id !== 999 && ( /* Don't allow banning the main admin */
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowBanModal(user)}
                                className={`transition-colors ${
                                  user.status === "banned"
                                    ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                    : "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                }`}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{user.status === "banned" ? "Unban User" : "Ban User"}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Delete User Button */}
                        {user.id !== 999 && ( /* Don't allow deleting the main admin */
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDeleteModal(user)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-red-200 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete User</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredAndSortedUsers.length)}{" "}
                of {filteredAndSortedUsers.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showPromoteModal !== null}
        onClose={() => setShowPromoteModal(null)}
        onConfirm={() => handlePromoteUser(showPromoteModal?.id)}
        title="Promote to Admin"
        message={`Are you sure you want to promote ${showPromoteModal?.name} to Admin? This will give them full administrative privileges.`}
        type="confirm"
      />

      <ConfirmationModal
        isOpen={showDeleteModal !== null}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={() => handleDeleteUser(showDeleteModal?.id)}
        title="Delete User"
        message={`Are you sure you want to delete ${showDeleteModal?.name}? This action cannot be undone.`}
        type="danger"
      />

      <ConfirmationModal
        isOpen={showDemoteModal !== null}
        onClose={() => setShowDemoteModal(null)}
        onConfirm={() => handleDemoteUser(showDemoteModal?.id)}
        title="Demote from Admin"
        message={`Are you sure you want to demote ${showDemoteModal?.name} from Admin? They will lose all administrative privileges.`}
        type="warning"
      />

      <ConfirmationModal
        isOpen={showBanModal !== null}
        onClose={() => setShowBanModal(null)}
        onConfirm={() => handleBanUser(showBanModal?.id)}
        title={showBanModal?.status === "banned" ? "Unban User" : "Ban User"}
        message={
          showBanModal?.status === "banned"
            ? `Are you sure you want to unban ${showBanModal?.name}? They will regain access to the platform.`
            : `Are you sure you want to ban ${showBanModal?.name}? They will be unable to access the platform.`
        }
        type={showBanModal?.status === "banned" ? "confirm" : "warning"}
      />

        {/* Demo Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-300">
                Demo User Management
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                This is a demonstration of the user management system. You can search, sort, promote users to admin, and delete users. All changes are simulated and will reset on page refresh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default UserManagement;
