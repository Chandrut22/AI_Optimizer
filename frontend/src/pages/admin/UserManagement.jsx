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
  toggleBanUser,
  deleteUser,
} from "@/api/adminService"; // <-- FIXED HERE

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(null);
  const [showDemoteModal, setShowDemoteModal] = useState(null);
  const [showBanModal, setShowBanModal] = useState(null);
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

  // ✅ Filter and sort
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

  // ✅ Handlers
  const handlePromote = async (id) => {
    await promoteUser(id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: "ADMIN" } : u))
    );
    setShowPromoteModal(null);
  };

  const handleDemote = async (id) => {
    await demoteUser(id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: "USER" } : u))
    );
    setShowDemoteModal(null);
  };

  const handleBan = async (id) => {
    await toggleBanUser(id);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "banned" ? "active" : "banned" }
          : u
      )
    );
    setShowBanModal(null);
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setShowDeleteModal(null);
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

        {/* Search bar */}
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

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                {/* Table same as before — use paginatedUsers */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default UserManagement;