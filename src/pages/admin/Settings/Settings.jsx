import { UserCircle, Lock, Monitor, Save } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"

export function Settings() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-header">System Settings</h2>
        <p className="text-muted-foreground mt-2">Manage your profile and system preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              <CardTitle>Profile Details</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input defaultValue="Admin" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input defaultValue="User" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" defaultValue="admin@system.com" />
            </div>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <Button variant="outline">Upload New Avatar</Button>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border px-6 py-4 mt-4">
            <Button>
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Password Reset */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input type="password" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border px-6 py-4 mt-4">
            <Button>
              Update Password
            </Button>
          </CardFooter>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <CardTitle>System Preferences</CardTitle>
            </div>
            <CardDescription>Customize the application behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="font-medium">Dark Mode Appearance</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
              </div>
              <div className="bg-primary px-3 py-1 rounded text-primary-foreground text-sm cursor-pointer shadow-sm hover:bg-primary/90">
                Toggle Theme
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive daily summary emails.</p>
              </div>
              <div className="bg-muted px-3 py-1 rounded text-muted-foreground text-sm cursor-pointer shadow-sm hover:bg-muted/80 border border-input">
                Opt-in
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
