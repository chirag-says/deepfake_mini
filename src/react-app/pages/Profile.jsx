import React from "react";
import { useAuth } from "../shared/context/AuthContext";
import SiteHeader from "../components/layout/SiteHeader";
import { User, Mail, Shield, Calendar, LogOut } from "lucide-react";
import Button from "../components/common/Button";
import FloatingCard from "../components/common/FloatingCard";

export default function Profile() {
    const { user, logout } = useAuth();

    const getInitials = (name) => {
        return name
            ? name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "U";
    };

    return (
        <div className="min-h-screen bg-[#0f0f23] text-gray-100 font-sans selection:bg-blue-500/30">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <SiteHeader />

            <main className="relative pt-32 px-4 sm:px-6 lg:px-8 pb-20 max-w-4xl mx-auto">
                <div className="space-y-8">
                    <FloatingCard className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-slate-800">
                                    {getInitials(user?.name)}
                                </div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-slate-900 rounded-full" title="Active"></div>
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
                                <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                        {user?.email}
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                                        <Shield className="w-4 h-4 text-emerald-400" />
                                        Basic Plan
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                                        <Calendar className="w-4 h-4 text-purple-400" />
                                        Member since {new Date().getFullYear()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                <Button onClick={logout} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </FloatingCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingCard className="p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-blue-400" />
                                Account Status
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                    <span className="text-slate-400">Plan Type</span>
                                    <span className="text-white font-medium">Free Tier</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                    <span className="text-slate-400">Analysis Credits</span>
                                    <span className="text-white font-medium">Unlimited (Beta)</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                    <span className="text-slate-400">Verification Status</span>
                                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                                        Verified <Shield className="w-3 h-3 fill-current" />
                                    </span>
                                </div>
                            </div>
                        </FloatingCard>

                        <FloatingCard className="p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Security</h2>
                            <p className="text-slate-400 text-sm mb-6">
                                Manage your password and security preferences.
                            </p>
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full justify-center">
                                    Change Password
                                </Button>
                                <Button variant="outline" className="w-full justify-center">
                                    Two-Factor Authentication
                                </Button>
                            </div>
                        </FloatingCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
