"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, Bell, Palette, Shield, Database, Trash2, Save, Upload, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function DashboardSettings() {
  const [theme, setTheme] = useState("system");
  const [accent, setAccent] = useState("blue");
  const [twoFA, setTwoFA] = useState(false);
  const [saving, setSaving] = useState(false);

  function onSave(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    // TODO: Wire up to your API route / server action
    setTimeout(() => setSaving(false), 900);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account, preferences, and notifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={onSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="organization" className="gap-2"><Building2 className="h-4 w-4" />Organization</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="data" className="gap-2"><Database className="h-4 w-4" />Data</TabsTrigger>
        </TabsList>

        {/* PROFILE */}
        <TabsContent value="profile" className="space-y-6 pt-4">
          <form onSubmit={onSave} className="grid grid-cols-1 gap-6 md:grid-cols-5">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>Square images work best. Max 2MB.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-avatar.png" alt="Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button type="button" variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" /> Upload
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Basic information for your account.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Rafael Silva" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" placeholder="rafa" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Short bio for your profile" rows={3} />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" className="gap-2" disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* ORGANIZATION */}
        <TabsContent value="organization" className="space-y-6 pt-4">
          <form onSubmit={onSave} className="grid grid-cols-1 gap-6 md:grid-cols-5">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
                <CardDescription>These appear on invoices and shared docs.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="org-name">Company name</Label>
                  <Input id="org-name" placeholder="Humanos" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="org-domain">Domain</Label>
                  <Input id="org-domain" placeholder="humanos.health" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="org-address">Address</Label>
                  <Input id="org-address" placeholder="Rua Exemplo 123, Lisboa" />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" className="gap-2" disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save company"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>Create teams to group people and permissions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-medium">Core</p>
                    <p className="text-xs text-muted-foreground">Admins and leads</p>
                  </div>
                  <Badge variant="secondary">6 members</Badge>
                </div>
                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-medium">Engineering</p>
                    <p className="text-xs text-muted-foreground">Developers</p>
                  </div>
                  <Badge variant="secondary">14 members</Badge>
                </div>
                <Button variant="outline" className="w-full">Create team</Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* APPEARANCE */}
        <TabsContent value="appearance" className="pt-4">
          <form onSubmit={onSave} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose how your dashboard looks.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Theme mode</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Accent color</Label>
                  <Select value={accent} onValueChange={setAccent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an accent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="violet">Violet</SelectItem>
                      <SelectItem value="emerald">Emerald</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" className="gap-2" disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Apply"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See a quick preview of your choices.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-6 w-28 rounded-full bg-muted" />
                    <div className="h-6 w-10 rounded-full bg-muted" />
                  </div>
                  <div className="grid gap-3">
                    <div className="h-8 w-40 rounded-full bg-muted" />
                    <div className="h-24 rounded-2xl border p-3">
                      <div className="mb-2 h-4 w-24 rounded bg-muted" />
                      <div className="h-3 w-3/4 rounded bg-muted" />
                    </div>
                    <div className="h-24 rounded-2xl border p-3">
                      <div className="mb-2 h-4 w-24 rounded bg-muted" />
                      <div className="h-3 w-2/3 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control how and when we contact you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Product updates</p>
                  <p className="text-sm text-muted-foreground">Occasional announcements and tips.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New mentions</p>
                  <p className="text-sm text-muted-foreground">When someone mentions you.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly summary</p>
                  <p className="text-sm text-muted-foreground">Progress, alerts, and digests.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button className="gap-2" onClick={onSave} disabled={saving}>
                <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security" className="pt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sign-in & 2FA</CardTitle>
                <CardDescription>Secure your account with two-factor auth.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">Use an authenticator app for codes.</p>
                  </div>
                  <Switch checked={twoFA} onCheckedChange={setTwoFA} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Change password</Label>
                  <Input id="password" type="password" placeholder="New password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password2">Confirm password</Label>
                  <Input id="password2" type="password" placeholder="Repeat password" />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button className="gap-2" onClick={onSave} disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Update security"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
                <CardDescription>Sign out devices you no longer use.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["MacBook Pro • Lisbon", "iPhone 15 • Portugal", "Windows • Work"]?.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border p-3">
                    <p className="text-sm">{s}</p>
                    <Button variant="outline" size="sm">Sign out</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DATA */}
        <TabsContent value="data" className="pt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Export data</CardTitle>
                <CardDescription>Download your data in common formats.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button variant="outline">Export as CSV</Button>
                <Button variant="outline">Export as JSON</Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Danger zone</CardTitle>
                <CardDescription>Irreversible actions. Please be careful.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Delete your account and all associated data.</p>
                <Button variant="destructive" className="gap-2 w-full">
                  <Trash2 className="h-4 w-4" /> Delete account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
