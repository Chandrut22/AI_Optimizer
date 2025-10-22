import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Shield,
  Mail,
  Globe,
  Database,
} from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: "AI Optimizer",
    supportEmail: "support@aioptimizer.com",
    maxUsers: "1000",
    defaultCredits: "100",
    emailNotifications: true,
    maintenanceMode: false,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert("Settings saved successfully!");
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure application settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxUsers">Maximum Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={settings.maxUsers}
                onChange={(e) => handleInputChange("maxUsers", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="defaultCredits">Default Credits for New Users</Label>
              <Input
                id="defaultCredits"
                type="number"
                value={settings.defaultCredits}
                onChange={(e) => handleInputChange("defaultCredits", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email notifications for important events
              </p>
            </div>
            <Button
              variant={settings.emailNotifications ? "default" : "outline"}
              onClick={() => handleInputChange("emailNotifications", !settings.emailNotifications)}
            >
              {settings.emailNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable user access for maintenance
              </p>
            </div>
            <Button
              variant={settings.maintenanceMode ? "destructive" : "outline"}
              onClick={() => handleInputChange("maintenanceMode", !settings.maintenanceMode)}
            >
              {settings.maintenanceMode ? "Active" : "Inactive"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Site Name:</p>
              <p className="text-muted-foreground">{settings.siteName}</p>
            </div>
            <div>
              <p className="font-medium">Support Email:</p>
              <p className="text-muted-foreground">{settings.supportEmail}</p>
            </div>
            <div>
              <p className="font-medium">Max Users:</p>
              <p className="text-muted-foreground">{settings.maxUsers}</p>
            </div>
            <div>
              <p className="font-medium">Default Credits:</p>
              <p className="text-muted-foreground">{settings.defaultCredits}</p>
            </div>
            <div>
              <p className="font-medium">Email Notifications:</p>
              <p className="text-muted-foreground">
                {settings.emailNotifications ? "Enabled" : "Disabled"}
              </p>
            </div>
            <div>
              <p className="font-medium">Maintenance Mode:</p>
              <p className="text-muted-foreground">
                {settings.maintenanceMode ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300">
              Demo Settings Panel
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              This settings interface allows administrators to configure various aspects of the application. Changes are simulated for demo purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
