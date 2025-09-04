import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  ArrowUpRight,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Mock data for dashboard stats
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "New Users",
      value: "145",
      change: "+8%",
      changeType: "positive",
      icon: UserPlus,
    },
    {
      title: "Active Sessions",
      value: "1,234",
      change: "+3%",
      changeType: "positive",
      icon: Activity,
    },
    {
      title: "Usage Growth",
      value: "23.5%",
      change: "+2.1%",
      changeType: "positive",
      icon: TrendingUp,
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View, edit, and manage user accounts",
      icon: Users,
      action: () => navigate("/admin/users"),
      color: "bg-blue-500",
    },
    {
      title: "View Analytics",
      description: "Check usage statistics and reports",
      icon: BarChart3,
      action: () => navigate("/admin/analytics"),
      color: "bg-green-500",
    },
    {
      title: "System Settings",
      description: "Configure application settings",
      icon: Settings,
      action: () => navigate("/admin/settings"),
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage your application from here
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={action.action}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "New user registered",
                user: "john.doe@example.com",
                time: "2 minutes ago",
              },
              {
                action: "User promoted to admin",
                user: "jane.smith@example.com",
                time: "15 minutes ago",
              },
              {
                action: "User account deleted",
                user: "old.user@example.com",
                time: "1 hour ago",
              },
              {
                action: "System settings updated",
                user: "admin@example.com",
                time: "2 hours ago",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <div>
            <h4 className="font-medium text-purple-900 dark:text-purple-300">
              👑 Admin Dashboard Active
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
              You're logged in as an administrator using <strong>admin@example.com</strong>.
              This gives you access to user management, analytics, and system settings.
              All data is simulated for demo purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
