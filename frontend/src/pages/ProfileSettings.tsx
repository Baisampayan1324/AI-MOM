import { useState } from "react";
import { User, Bell, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    keywords: "budget, deadline, action items",
    speakerAlerts: true,
    autoSummary: true,
    emailNotifications: false,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and alert keywords</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="keywords">Alert Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="Enter keywords separated by commas"
                  value={profile.keywords}
                  onChange={(e) => setProfile({ ...profile, keywords: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You'll be alerted when these keywords are mentioned in meetings
                </p>
              </div>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card className="p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Notification Preferences</h2>
                <p className="text-sm text-muted-foreground">Customize your alert settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="speakerAlerts">Speaker Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when specific speakers are talking
                  </p>
                </div>
                <Switch
                  id="speakerAlerts"
                  checked={profile.speakerAlerts}
                  onCheckedChange={(checked) => setProfile({ ...profile, speakerAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSummary">Auto-Summary Generation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate summaries after meetings
                  </p>
                </div>
                <Switch
                  id="autoSummary"
                  checked={profile.autoSummary}
                  onCheckedChange={(checked) => setProfile({ ...profile, autoSummary: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email summaries after meetings
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={profile.emailNotifications}
                  onCheckedChange={(checked) => setProfile({ ...profile, emailNotifications: checked })}
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg" className="px-8">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
