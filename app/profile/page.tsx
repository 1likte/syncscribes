'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Camera, User, BadgeCheck, Mail, Phone, Calendar,
  MapPin, Globe, Twitter, Instagram, Facebook, Linkedin,
  CreditCard, Trash2, Info, Lock, Eye, EyeOff, Shield,
  Search, Bell, Bookmark, Users, Star, ArrowUpCircle,
  Hash, Unlock, LogOut, Edit2, ExternalLink, Book, Heart, MessageCircle, Upload, X, Crown, History
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // settings, social, messages, invite, saved, activities
  const [profileData, setProfileData] = useState({
    id: '',
    name: '',
    username: '',
    email: '',
    bio: '',
    avatar: '/api/placeholder/150/150',
    phone: '',
    gender: '',
    birthday: '',
    emailVisible: false,
    phoneVisible: false,
    birthdayVisible: false,
    isPrivate: false,
    isVerified: false,
    profileSlug: '',
    interests: [] as string[],
    website: '',
    twitter: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    level: 1,
    xp: 0,
    verifiedTier: 'NONE',
    role: 'USER',
    joinDate: '',
    booksRead: 0,
    postsCount: 0,
    likesReceived: 0,
    hasActiveSubscription: false,
    subscription: null as any
  });

  const TIERS = {
    NONE: { name: 'None', color: '#94a3b8', gradient: 'from-slate-400 to-slate-500' },
    SILVER: { name: 'Silver', color: '#cbd5e1', gradient: 'from-slate-300 via-slate-100 to-slate-400', secondary: '#94a3b8' },
    GOLD: { name: 'Gold', color: '#fbbf24', gradient: 'from-amber-300 via-yellow-500 to-orange-500', secondary: '#d97706' },
    EMERALD: { name: 'Emerald', color: '#10b981', gradient: 'from-emerald-400 via-emerald-500 to-teal-600', secondary: '#059669' },
    PLATINUM: { name: 'Platinum', color: '#e2e8f0', gradient: 'from-blue-200 via-slate-200 to-indigo-300', secondary: '#475569' },
    DIAMOND: { name: 'Diamond', color: '#38bdf8', gradient: 'from-cyan-300 via-sky-400 to-blue-500', secondary: '#0284c7' },
    ADMIN: { name: 'Founder', color: '#f43f5e', gradient: 'from-rose-500 via-fuchsia-600 to-rose-600', secondary: '#9d174d' }
  };

  const CATEGORIES = ['Dystopian', 'Sci-Fi', 'Fantasy', 'Romance', 'Mystery', 'History', 'Philosophy', 'Cyberpunk'];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);


  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        const userRole = data.role?.toUpperCase() || 'USER';
        const isUserAdmin = userRole === 'ADMIN' || userRole === 'OWNER';

        setProfileData({
          ...data,
          isVerified: isUserAdmin ? true : data.isVerified,
          verifiedTier: isUserAdmin ? 'ADMIN' : data.verifiedTier,
          birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : '',
          name: data.username || data.name
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeTier = async () => {
    try {
      const resp = await fetch('/api/profile/upgrade-tier', { method: 'POST' });
      if (resp.ok) {
        const data = await resp.json();
        alert(`Congratulations! You've been upgraded to the ${data.tierName} badge.`);
        fetchProfile();
      } else {
        const err = await resp.json();
        alert(err.error || 'Upgrade failed');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const getTierMetadata = () => {
    const tier = profileData.verifiedTier as keyof typeof TIERS;
    return TIERS[tier] || TIERS.NONE;
  };

  const currentLevel = profileData.level as number;
  const xpForCurrentLevel = 50 * Math.pow(currentLevel - 1, 2);
  const xpForNextLevel = 50 * Math.pow(currentLevel, 2);
  const xpInCurrentLevel = profileData.xp - xpForCurrentLevel;
  const xpNeededInCurrentLevel = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededInCurrentLevel) * 100));
  const nextLevelXp = xpForNextLevel;

  const TierBadge = ({ tier, size = "md" }: { tier: string, size?: "sm" | "md" | "lg" }) => {
    const meta = TIERS[tier as keyof typeof TIERS] || TIERS.NONE;
    if (tier === 'NONE') return null;

    const iconSize = {
      sm: 10,
      md: 14,
      lg: 20
    };

    // Special styling for ADMIN (Kurucu) - The "Founder Masterpiece"
    if (tier === 'ADMIN') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className="relative flex items-center gap-2 px-4 py-2 group/admin cursor-help"
        >
          {/* Layer 1: Glassmorphic Container with Shimmer */}
          <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/20 shadow-xl dark:shadow-2xl overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -skew-x-12"
            />
          </div>

          {/* Layer 2: High-End Icons */}
          <div className="flex items-center gap-1.5 relative z-10">
            <div className="relative">
              <Crown
                size={iconSize[size] + 4}
                className="text-rose-600 dark:text-white drop-shadow-[0_0_10px_rgba(225,29,72,0.4)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] fill-rose-500/10"
              />
            </div>

            <div className="h-4 w-[1px] bg-slate-300 dark:bg-white/20" />

            <div className="relative">
              <BadgeCheck
                size={iconSize[size] + 2}
                className="text-[#0095F6] drop-shadow-[0_0_10px_rgba(0,149,246,0.6)] fill-white dark:fill-white/80"
              />
            </div>
          </div>

          {/* Layer 3: FRONT NEON FLARE (The Request) */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 bg-gradient-to-r ${meta.gradient} mix-blend-multiply dark:mix-blend-screen blur-[12px] opacity-40`}
            />
            {/* Horizontal Flare Line */}
            <motion.div
              animate={{ left: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -translate-y-1/2 w-full h-[1px] bg-blue-500/30 dark:bg-white/50 blur-[1px] -rotate-12"
            />
          </div>

        </motion.div>
      );
    }

    // Higher-Tier Luxury Badges (SILVER to DIAMOND) - The "Prestige Collection"
    const bgSize = {
      sm: "w-5 h-5",
      md: "w-8 h-8",
      lg: "w-10 h-10"
    };

    return (
      <motion.div
        whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
        className={`${bgSize[size]} relative flex items-center justify-center shrink-0 cursor-pointer group/tier`}
      >
        {/* Layer 1: Rotating Light Rays (Luxury Aura) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 bg-gradient-to-r ${meta.gradient} opacity-20 blur-lg rounded-full`}
        />

        {/* Layer 2: 3D Bezel / Frame */}
        <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} rounded-full rotate-12 shadow-[0_4px_15px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/30`} />
        <div className={`absolute inset-[1px] bg-gradient-to-tr ${meta.gradient} rounded-full -rotate-12 opacity-80`} />

        {/* Layer 3: Inner Core (The Sunburst Effect) */}
        <div className="absolute inset-1 bg-white dark:bg-black/40 rounded-full backdrop-blur-sm flex items-center justify-center overflow-hidden border border-slate-100 dark:border-transparent">
          {/* Moving Metallic Shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-blue-400/20 dark:via-white/40 to-transparent -skew-x-20 z-10"
          />

          {/* The Signature Blue Tick */}
          <BadgeCheck
            size={iconSize[size] + 2}
            className="text-[#0095F6] fill-white relative z-20 drop-shadow-[0_0_8px_rgba(0,149,246,0.4)]"
          />
        </div>

        {/* Layer 4: FRONT NEON FLARE (The Final Polish) */}
        <div className="absolute inset-0 pointer-events-none z-30">
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} mix-blend-multiply dark:mix-blend-screen blur-[6px] rounded-full opacity-30`}
          />
        </div>
      </motion.div>
    );
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          username: profileData.name
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        await fetchProfile();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST'
      });

      if (response.ok) {
        alert('Subscription canceled successfully');
        await fetchProfile();
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Account deleted successfully');
        router.push('/auth/signin');
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'social') {
      fetchSocialData();
    } else if (activeTab === 'saved') {
      fetchSavedPosts();
    } else if (activeTab === 'activities') {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchSocialData = async () => {
    try {
      const resp = await fetch('/api/notifications');
      if (resp.ok) setNotifications(await resp.json());

      // We'll need endpoints for followers/following list if we want to show them
      // For now, let's focus on notifications for follow requests
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const resp = await fetch('/api/social/saved');
      if (resp.ok) setSavedPosts(await resp.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActivities = async () => {
    try {
      const resp = await fetch('/api/profile/activities');
      if (resp.ok) setActivities(await resp.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollowSearch = async () => {
    if (!searchUser.trim()) return;
    try {
      setSearchLoading(true);
      // First find user by username
      const findResp = await fetch(`/api/users/search?username=${searchUser.trim()}`);
      if (findResp.ok) {
        const user = await findResp.json();
        if (user.id) {
          const followResp = await fetch('/api/social/follow', {
            method: 'POST',
            body: JSON.stringify({ targetId: user.id })
          });
          if (followResp.ok) {
            const data = await followResp.json();
            alert(data.status === 'PENDING' ? 'Follow request sent!' : 'Followed successfully!');
            setSearchUser('');
          }
        } else {
          alert('User not found');
        }
      } else {
        alert('User not found');
      }
    } catch (e) {
      alert('Error following user');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAcceptFollow = async (notifId: string, followerId: string) => {
    try {
      // Logic to accept follow request
      // We'll need an endpoint for this
      const resp = await fetch('/api/social/follow/accept', {
        method: 'POST',
        body: JSON.stringify({ followerId, notificationId: notifId })
      });
      if (resp.ok) {
        fetchSocialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-foreground text-xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 md:pt-32 pb-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3 md:mb-4 uppercase tracking-tighter italic">
            {isEditing ? 'Edit' : 'Your'} <span className="text-primary italic">Profile</span>
          </h1>
          <p className="text-muted-foreground font-medium text-xs md:text-base">Manage your personal threads and scribes</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl mb-8 relative"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-[4px] shadow-2xl shadow-primary/20 relative">
                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                  {profileData.avatar && profileData.avatar !== '/api/placeholder/150/150' ? (
                    <img
                      src={profileData.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <User className="w-20 h-20 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-20">
                    <Camera className="w-8 h-8 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="relative group">
                    <TierBadge tier={profileData.verifiedTier} size="lg" />
                    {/* Extra floating particles for Admin */}
                    {profileData.verifiedTier === 'ADMIN' && (
                      <div className="absolute inset-0 pointer-events-none">
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-2 -right-2 w-2 h-2 bg-rose-500 rounded-full blur-[2px]" />
                        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-500 rounded-full blur-[2px]" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-5xl font-black text-foreground tracking-tighter italic drop-shadow-sm">
                    @{profileData.profileSlug || profileData.username}
                  </h2>
                </div>
                {profileData.verifiedTier !== 'NONE' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className={`text-[10px] px-5 py-2 rounded-full border border-white/10 shadow-2xl bg-gradient-to-r ${getTierMetadata().gradient} text-white font-black italic tracking-[0.3em] uppercase transition-transform hover:scale-105 cursor-default`}>
                      {getTierMetadata().name}
                    </span>
                  </motion.div>
                )}
              </div>
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs font-black text-muted-foreground uppercase tracking-widest">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>Level {profileData.level}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                    Joined {profileData.joinDate}
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="w-48 h-1.5 bg-muted rounded-full mt-2 overflow-hidden relative group">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {profileData.xp} / {nextLevelXp} XP
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Tabs - Wrapping on mobile */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
            {[
              { id: 'settings', icon: Settings, label: 'Settings' },
              { id: 'social', icon: Users, label: 'Social' },
              { id: 'messages', icon: MessageCircle, label: 'Messages' },
              { id: 'invite', icon: Mail, label: 'Invite' },
              { id: 'saved', icon: Bookmark, label: 'Saved' },
              { id: 'activities', icon: History, label: 'History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 md:px-6 py-2 rounded-full font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${activeTab === tab.id
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-muted/10 border-transparent text-muted-foreground hover:bg-muted/30'
                  }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'settings' && (
            <div>
              {!isEditing ? (
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-8">
                  <div className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar w-full md:w-auto justify-center md:justify-start pb-2">
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-black text-foreground">{profileData.booksRead}</div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Books Read</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-black text-foreground">{profileData.postsCount}</div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Insights</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-black text-foreground">{profileData.likesReceived}</div>
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Likes</div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(true)}
                      className="flex-1 md:flex-none px-8 py-3.5 bg-foreground text-background rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="px-5 py-3.5 bg-red-500/10 text-red-500 border-2 border-red-500/20 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg flex items-center justify-center"
                    >
                      <LogOut className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Account Privacy & Meta */}
                  <div className="p-6 bg-muted/20 rounded-[2rem] border border-border/50">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Lock size={14} className="text-primary" /> Privacy & Identity
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/40">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">Private Account</span>
                          <span className="text-[10px] text-muted-foreground">Only followers can see posts</span>
                        </div>
                        <button
                          onClick={() => setProfileData({ ...profileData, isPrivate: !profileData.isPrivate })}
                          className={`w-12 h-6 rounded-full transition-colors relative ${profileData.isPrivate ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profileData.isPrivate ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Profile Link (Slug)</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                          <input
                            type="text"
                            value={profileData.profileSlug}
                            onChange={(e) => setProfileData({ ...profileData, profileSlug: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-background/50 rounded-2xl border border-border/40 focus:border-primary/50 focus:bg-background focus:outline-none transition-all font-bold text-sm"
                            placeholder="my-cool-link"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div>
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 ml-1">Personal Details</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-muted/20 border-border/40 rounded-2xl focus:border-primary/50 focus:bg-background outline-none transition-all font-bold text-sm"
                              placeholder="+90 5xx ..."
                            />
                          </div>
                          <button
                            onClick={() => setProfileData({ ...profileData, phoneVisible: !profileData.phoneVisible })}
                            className={`p-3 rounded-2xl border transition-all ${profileData.phoneVisible ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/30 border-border text-muted-foreground'}`}
                            title="Show on profile"
                          >
                            {profileData.phoneVisible ? <Unlock size={18} /> : <Lock size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Gender</label>
                        <select
                          value={profileData.gender}
                          onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                          className="w-full px-4 py-3 bg-muted/20 border border-border/40 rounded-2xl focus:border-primary/50 focus:bg-background outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="None">Prefer not to say</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Birth Date</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="date"
                              value={profileData.birthday}
                              onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-muted/20 border-border/40 rounded-2xl focus:border-primary/50 focus:bg-background outline-none transition-all font-bold text-sm"
                            />
                          </div>
                          <button
                            onClick={() => setProfileData({ ...profileData, birthdayVisible: !profileData.birthdayVisible })}
                            className={`p-3 rounded-2xl border transition-all ${profileData.birthdayVisible ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/30 border-border text-muted-foreground'}`}
                            title="Show on profile"
                          >
                            {profileData.birthdayVisible ? <Unlock size={18} /> : <Lock size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Visibility</label>
                        <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/40">
                          <Mail size={18} className="text-muted-foreground" />
                          <span className="flex-1 font-bold text-sm">{profileData.email}</span>
                          <button
                            onClick={() => setProfileData({ ...profileData, emailVisible: !profileData.emailVisible })}
                            className={`p-2 rounded-xl border transition-all ${profileData.emailVisible ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/30 border-border text-muted-foreground'}`}
                          >
                            {profileData.emailVisible ? <Unlock size={14} /> : <Lock size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interests / Categories */}
                  <div>
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 ml-1">Interests & Categories</h3>
                    <div className="flex flex-wrap gap-3">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => toggleInterest(cat)}
                          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${profileData.interests.includes(cat) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-background border-border hover:border-primary/50 text-muted-foreground'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-6 py-4 bg-muted/20 border border-border/40 rounded-[2rem] focus:border-primary/50 focus:bg-background outline-none transition-all font-medium resize-none shadow-inner"
                      placeholder="The scribes in my head tell a story of..."
                    />
                  </div>

                  {/* Social Links */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Existing social inputs here, omitted for brevity but they should stay */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="url"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-muted/20 rounded-2xl border border-border/40 focus:outline-none transition-all font-bold text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Twitter (X)</label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={profileData.twitter}
                          onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-muted/20 rounded-2xl border border-border/40 focus:outline-none transition-all font-bold text-sm"
                          placeholder="@username"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Instagram</label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="url"
                          value={profileData.instagram}
                          onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-muted/20 rounded-2xl border border-border/40 focus:outline-none transition-all font-bold text-sm"
                          placeholder="Instagram URL"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Facebook</label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="url"
                          value={profileData.facebook}
                          onChange={(e) => setProfileData({ ...profileData, facebook: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-muted/20 rounded-2xl border border-border/40 focus:outline-none transition-all font-bold text-sm"
                          placeholder="Facebook URL"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">LinkedIn</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="url"
                          value={profileData.linkedin}
                          onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-muted/20 rounded-2xl border border-border/40 focus:outline-none transition-all font-bold text-sm"
                          placeholder="LinkedIn URL"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-8">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-3 text-muted-foreground font-black uppercase tracking-widest text-xs hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                      {saving && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                      Finalize Scribe
                    </motion.button>
                  </div>

                  {/* Prestige Section */}
                  <div className="mt-12 pt-8 border-t border-border/40">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <BadgeCheck size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider">Prestige & Badge System</h3>
                        <p className="text-[10px] text-muted-foreground font-bold">Customize your profile and stand out in the community</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="p-6 bg-muted/10 rounded-3xl border border-border/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Shield size={64} />
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-2">Current Badge</h4>
                        <div className="flex items-center gap-3">
                          <div
                            className="p-3 rounded-2xl shadow-lg"
                            style={{ backgroundColor: getTierMetadata().color, color: 'white' }}
                          >
                            <BadgeCheck size={24} className="fill-current" />
                          </div>
                          <div>
                            <p className="font-black text-lg italic">{getTierMetadata().name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground">Senior Member Status</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex flex-col justify-between">
                        <div>
                          <h4 className="font-black text-xs uppercase tracking-widest mb-1 text-primary">Next Level</h4>
                          <p className="text-xs font-bold text-muted-foreground mb-4">Upgrade to the next prestige badge</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleUpgradeTier}
                          className="w-full py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                        >
                          <ArrowUpCircle size={14} />
                          Upgrade (0.25$)
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Prestige Journey</p>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(TIERS).filter(([k]) => k !== 'NONE').map(([key, tier]) => (
                          <div
                            key={key}
                            className={`px-3 py-2 rounded-2xl border flex items-center gap-2 transition-all ${profileData.verifiedTier === key ? 'border-primary bg-primary/10 shadow-lg scale-110 z-10' : 'border-border/40 opacity-30 grayscale hover:grayscale-0 hover:opacity-60'}`}
                          >
                            <TierBadge tier={key} size="sm" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground">
                              {tier.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-12 pt-8 border-t border-red-500/20">
                    <h3 className="text-red-500 font-black uppercase tracking-widest text-xs mb-6">Danger Zone</h3>
                    <div className="space-y-4">
                      {profileData.hasActiveSubscription && (
                        <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                          <div>
                            <h4 className="font-bold text-red-600 dark:text-red-400">Subscription Active</h4>
                            <p className="text-xs text-red-600/60 dark:text-red-400/60 font-medium">Cancel your premium benefits</p>
                          </div>
                          <button
                            onClick={handleCancelSubscription}
                            className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline"
                          >
                            Cancel Subscription
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 dark:border-red-500/10 rounded-2xl">
                        <div>
                          <h4 className="font-bold text-red-600 dark:text-red-400">Delete Account</h4>
                          <p className="text-xs text-red-700/60 dark:text-red-400/60 font-medium">Permanently remove all your data</p>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-8">
              {/* Search User */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-3xl opacity-20 blur group-focus-within:opacity-40 transition duration-500" />
                <div className="relative flex gap-4 p-2 bg-background border border-border rounded-[2rem]">
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Enter username to follow..."
                    className="flex-1 px-6 py-4 bg-transparent outline-none font-bold italic"
                    onKeyDown={(e) => e.key === 'Enter' && handleFollowSearch()}
                  />
                  <button
                    onClick={handleFollowSearch}
                    disabled={searchLoading}
                    className="px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    {searchLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Users size={16} />}
                    Follow
                  </button>
                </div>
              </div>

              {/* Notifications / Follow Requests */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Notifications</h3>
                {notifications.length === 0 ? (
                  <div className="p-12 text-center bg-muted/10 rounded-[2rem] border border-border/50 italic text-muted-foreground font-medium">
                    No new scrolls found in the archive. 📜
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div key={notif.id} className="p-6 bg-card border border-border rounded-[2rem] flex items-center justify-between group hover:border-primary/50 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${notif.type.includes('FOLLOW') ? 'bg-primary/10 text-primary' :
                            notif.type.includes('COMMENT') ? 'bg-blue-500/10 text-blue-500' :
                              'bg-muted text-muted-foreground'
                            }`}>
                            {notif.type.includes('FOLLOW') ? <Users size={20} /> :
                              notif.type.includes('COMMENT') ? <MessageCircle size={20} /> :
                                <Bell size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{notif.message}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {notif.type === 'FOLLOW_REQUEST' && !notif.isRead && (
                            <button
                              onClick={() => handleAcceptFollow(notif.id, notif.link?.split('/').pop() || '')}
                              className="px-6 py-2 bg-green-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                              Accept
                            </button>
                          )}
                          {notif.link && (
                            <button
                              onClick={() => router.push(notif.link)}
                              className="px-4 py-2 bg-muted hover:bg-muted/50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Your Chat Rooms</h3>
                <button
                  onClick={() => router.push('/chat-rooms')}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                >
                  View All Rooms
                </button>
              </div>
              <div className="grid gap-4">
                <div className="p-8 text-center bg-muted/10 rounded-[2rem] border border-border/50">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground font-medium mb-4">
                    Join chat rooms to start messaging with the community!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => router.push('/chat-rooms')}
                      className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all"
                    >
                      Browse Rooms
                    </button>
                    <button
                      onClick={() => router.push('/messages')}
                      className="px-6 py-3 bg-muted/30 text-foreground rounded-xl font-bold hover:bg-muted/50 transition-all"
                    >
                      Direct Messages
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invite' && (
            <div className="space-y-6">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Invite Friends</h3>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-[2rem] p-8 border border-primary/20">
                <div className="text-center mb-6">
                  <Crown className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h4 className="text-2xl font-black text-foreground mb-2">Earn Free Access!</h4>
                  <p className="text-muted-foreground">
                    Create a chat room and invite 1000 members to unlock lifetime free access to SyncScribes!
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center">
                    <div className="text-4xl font-black text-primary mb-2">1000</div>
                    <div className="text-sm text-muted-foreground">Members Needed</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center">
                    <div className="text-4xl font-black text-green-500 mb-2">FREE</div>
                    <div className="text-sm text-muted-foreground">Lifetime Access</div>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/chat-rooms')}
                  className="w-full px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Create Your Room Now
                </button>
              </div>

              <div className="bg-muted/10 rounded-[2rem] p-8 border border-border/50">
                <h4 className="text-lg font-black text-foreground mb-4">Share via Social Media</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Invite your friends to join SyncScribes and discover amazing books together!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      const text = "Join me on SyncScribes - the ultimate platform for book lovers!";
                      const url = window.location.origin;
                      window.location.href = `mailto:?subject=${encodeURIComponent('Join SyncScribes')}&body=${encodeURIComponent(text + '\n\n' + url)}`;
                    }}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-border hover:border-primary transition-all flex flex-col items-center gap-2"
                  >
                    <Mail className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs font-bold">Email</span>
                  </button>
                  <button
                    onClick={() => {
                      const text = "Join me on SyncScribes!";
                      const url = window.location.origin;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                    }}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-border hover:border-primary transition-all flex flex-col items-center gap-2"
                  >
                    <Facebook className="w-6 h-6 text-blue-600" />
                    <span className="text-xs font-bold">Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      const text = "Join me on SyncScribes - the ultimate platform for book lovers!";
                      const url = window.location.origin;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                    }}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-border hover:border-primary transition-all flex flex-col items-center gap-2"
                  >
                    <Twitter className="w-6 h-6 text-sky-500" />
                    <span className="text-xs font-bold">Twitter</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.origin;
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                    }}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-border hover:border-primary transition-all flex flex-col items-center gap-2"
                  >
                    <Linkedin className="w-6 h-6 text-blue-700" />
                    <span className="text-xs font-bold">LinkedIn</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-6">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Archived Insights</h3>
              {savedPosts.length === 0 ? (
                <div className="p-12 text-center bg-muted/10 rounded-[2rem] border border-border/50 italic text-muted-foreground font-medium">
                  No saved scribes yet. Start exploring the community! ✨
                </div>
              ) : (
                <div className="grid gap-6">
                  {savedPosts.map(post => (
                    <div key={post.id} className="p-6 bg-card border border-border rounded-[2rem] shadow-sm hover:border-primary/50 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                          @{post.author?.username?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-sm">@{post.author?.username}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium italic opacity-80 mb-4">"{post.content.substring(0, 150)}..."</p>
                      <button
                        onClick={() => router.push(`/activity?post=${post.id}`)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2"
                      >
                        View Thread <ExternalLink size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Your Activity History</h3>
              {activities.length === 0 ? (
                <div className="p-12 text-center bg-muted/10 rounded-[2rem] border border-border/50 italic text-muted-foreground font-medium">
                  The archives are empty. Your journey starts now! ⚔️
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map(activity => {
                    const metadata = activity.metadata ? JSON.parse(activity.metadata) : {};
                    return (
                      <div key={activity.id} className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/40 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${activity.type.includes('LIKE') ? 'bg-pink-500/10 text-pink-500' :
                            activity.type.includes('SAVE') ? 'bg-yellow-500/10 text-yellow-500' :
                              activity.type.includes('REPOST') ? 'bg-green-500/10 text-green-500' :
                                'bg-blue-500/10 text-blue-500'
                            }`}>
                            {activity.type.includes('LIKE') ? <Heart size={18} /> :
                              activity.type.includes('SAVE') ? <Bookmark size={18} /> :
                                activity.type.includes('REPOST') ? <ExternalLink size={18} /> :
                                  <MessageCircle size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {activity.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {metadata.postId && (
                          <button
                            onClick={() => router.push(`/activity?post=${metadata.postId}`)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            title="View Post"
                          >
                            <ExternalLink size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
