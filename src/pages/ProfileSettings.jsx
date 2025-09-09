import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Bell, KeyRound } from 'lucide-react';
import { useUser } from '@/pages/Layout';
import NotificationSettingsPanel from '@/components/settings/NotificationSettingsPanel';

export default function ProfileSettings() {
    const { user, updateUser, refreshUser } = useUser();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        title: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                title: user.title || ''
            });
        }
    }, [user]);
    
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateUser(formData);
            await refreshUser(); // Refresh context to reflect updates everywhere
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
            
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <KeyRound className="w-4 h-4 mr-2" />
                        Security
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Profile</CardTitle>
                            <CardDescription>Manage your personal information.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSave}>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <Avatar className="w-24 h-24">
                                        <AvatarImage src={user.photo_url} alt={user.full_name} />
                                        <AvatarFallback className="text-3xl">
                                            {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <Label htmlFor="photo">Profile Photo</Label>
                                        <Input id="photo" type="file" disabled />
                                        <p className="text-xs text-slate-500">Image uploads coming soon.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">Full Name</Label>
                                        <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" value={formData.email} disabled />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Job Title</Label>
                                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Operations Manager" />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6">
                    <NotificationSettingsPanel />
                </TabsContent>
                
                <TabsContent value="security" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your account security settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-slate-500 py-8">
                                Password and 2FA settings will be available here soon.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}