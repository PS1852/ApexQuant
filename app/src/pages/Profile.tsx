import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, signOut } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Wallet,
  Calendar,
  Edit2,
  Save,
  LogOut,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/services/stockService';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const { error } = await updateProfile(user.id, { full_name: fullName });

      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const { error } = await signOut();

      if (error) {
        toast.error('Failed to logout');
        return;
      }

      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex animate-fade-in-up">
      <Sidebar />

      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile</h1>
            <p className="text-slate-400 mt-1">Manage your account settings</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Personal Information</CardTitle>
                  {!editing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                        {getInitials(profile?.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">Profile Picture</p>
                      <p className="text-sm text-slate-400">Your initials are displayed as your avatar</p>
                    </div>
                  </div>

                  <Separator className="bg-slate-800" />

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-slate-300 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Full Name
                      </Label>
                      {editing ? (
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      ) : (
                        <div className="p-3 rounded-lg bg-slate-800/50 text-white">
                          {profile?.full_name || 'Not set'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <div className="p-3 rounded-lg bg-slate-800/50 text-white">
                        {profile?.email}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Member Since
                      </Label>
                      <div className="p-3 rounded-lg bg-slate-800/50 text-white">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                          : 'Unknown'
                        }
                      </div>
                    </div>
                  </div>

                  {editing && (
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setFullName(profile?.full_name || '');
                        }}
                        className="border-slate-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Stats */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Account Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/50">
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Current Balance
                      </p>
                      <p className="text-2xl font-bold text-emerald-400 mt-2">
                        {formatCurrency(profile?.balance || 0)}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50">
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Account Type
                      </p>
                      <p className="text-2xl font-bold text-white mt-2">
                        Virtual Trader
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    {loggingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">About ApexQuant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm">
                    ApexQuant is a virtual trading platform that allows you to practice
                    stock trading with real market data without risking real money.
                    Start with ₹2,000 virtual currency and build your trading skills.
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-slate-500 text-xs">Version 1.0.0</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
