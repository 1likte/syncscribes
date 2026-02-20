'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Star, Book, User, ExternalLink, ThumbsDown, Repeat2, Bookmark, Crown, BadgeCheck, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface PostItemProps {
  id: string;
  authorId?: string;
  user: string;
  content: string;
  timestamp?: string;
  avatar?: string;
  userLevel?: string;
  likes?: number;
  comments?: number;
  bookName?: string;
  bookId?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  image?: string;
  isPremium?: boolean;
  isLocal?: boolean;
  textColor?: string;
  fontClass?: string;
  link?: string;
  dislikes?: number;
  reposts?: number;
  isDisliked?: boolean;
  isVerified?: boolean;
  verifiedTier?: string;
  repostOf?: {
    author: {
      username: string;
      avatar?: string;
    }
  };
}

export const PostItem: React.FC<PostItemProps> = ({
  id,
  authorId,
  user,
  content,
  timestamp,
  avatar,
  userLevel = 'Reader',
  likes = 0,
  comments = 0,
  bookName,
  bookId,
  isLiked = false,
  isSaved = false,
  image,
  isPremium = false,
  isLocal = false,
  textColor,
  fontClass,
  link,
  dislikes = 0,
  reposts = 0,
  isDisliked = false,
  isVerified = false,
  verifiedTier = 'NONE',
  repostOf
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isDeleted, setIsDeleted] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [disliked, setDisliked] = useState(isDisliked);
  const [dislikeCount, setDislikeCount] = useState(dislikes);
  const [repostCount, setRepostCount] = useState(reposts);
  const [saved, setSaved] = useState(isSaved);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsData, setCommentsData] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const res = await fetch(`/api/posts/${id}/comments`);
      if (res.ok) {
        setCommentsData(await res.json());
      }
    } catch (e) {
      console.error("Fetch comments error:", e);
    } finally {
      setLoadingComments(false);
    }
  };

  React.useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const handleLike = async () => {
    if (isLocal) {
      // For local posts, just toggle like locally
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      return;
    }
    if (!isPremium) {
      router.push('/subscription');
      return;
    }
    try {
      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleSave = async () => {
    if (isLocal) {
      setSaved(!saved);
      return;
    }
    try {
      const res = await fetch('/api/social/saved', {
        method: 'POST',
        body: JSON.stringify({ postId: id })
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleComment = async () => {
    if (!isPremium && !isLocal) {
      router.push('/subscription');
      return;
    }
    if (commentText.trim()) {
      try {
        const res = await fetch(`/api/posts/${id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: commentText,
            parentId: replyingTo
          })
        });
        if (res.ok) {
          const newComment = await res.json();
          setCommentText('');
          setReplyingTo(null);
          // Refresh comments list
          fetchComments();
        }
      } catch (e) {
        console.error("Comment error:", e);
      }
    }
  };

  const handleDislike = async () => {
    if (isLocal) {
      setDisliked(!disliked);
      setDislikeCount(prev => disliked ? prev - 1 : prev + 1);
      return;
    }
    if (!isPremium) {
      router.push('/subscription');
      return;
    }
    try {
      const res = await fetch(`/api/posts/${id}/dislike`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDisliked(data.disliked);
        setDislikeCount(prev => data.disliked ? prev + 1 : prev - 1);

        // If it was liked, update likes too
        if (data.disliked && liked) {
          setLiked(false);
          setLikeCount(prev => prev - 1);
        }
      }
    } catch (error) {
      console.error("Dislike error:", error);
    }
  };

  const handleRepost = async () => {
    if (!isPremium && !isLocal) {
      router.push('/subscription');
      return;
    }
    try {
      const res = await fetch(`/api/posts/${id}/repost`, { method: 'POST' });
      if (res.ok) {
        setRepostCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Repost error:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      setShowLongPressMenu(false);
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleted(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert('Failed to delete post');
    } finally {
      setShowLongPressMenu(false);
    }
  };

  const handleTouchStart = () => {
    if (!(authorId === session?.user?.id || (session?.user as any)?.role === 'ADMIN')) return;

    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setShowLongPressMenu(true);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50); // Haptic feedback
      }
    }, 600); // 600ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPressing(false);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'gold reader': return 'text-yellow-400';
      case 'silver reader': return 'text-gray-300';
      case 'bronze reader': return 'text-orange-400';
      default: return 'text-blue-400';
    }
  };

  const TIERS: any = {
    SILVER: { gradient: 'from-slate-300 via-slate-100 to-slate-400' },
    GOLD: { gradient: 'from-amber-300 via-yellow-500 to-orange-500' },
    EMERALD: { gradient: 'from-emerald-400 via-emerald-500 to-teal-600' },
    PLATINUM: { gradient: 'from-blue-200 via-slate-200 to-indigo-300' },
    DIAMOND: { gradient: 'from-cyan-300 via-sky-400 to-blue-500' },
    ADMIN: { gradient: 'from-rose-400 via-fuchsia-500 to-indigo-600' }
  };

  const renderBadge = () => {
    if (!verifiedTier || verifiedTier === 'NONE') return null;

    if (verifiedTier === 'ADMIN') {
      return (
        <div className="flex items-center gap-0.5 mr-1" title="Kurucu / Admin">
          <Crown size={14} className="text-rose-500 fill-rose-500/20 drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]" />
          <BadgeCheck size={12} className="text-rose-500 fill-current" />
        </div>
      );
    }

    const meta = TIERS[verifiedTier] || TIERS.SILVER;
    return (
      <div className="w-4 h-4 relative flex items-center justify-center shrink-0 mr-1">
        <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} rounded-full rotate-12`} />
        <div className="relative z-10 flex items-center justify-center bg-white rounded-full p-[0.5px]">
          <BadgeCheck size={10} className="text-[#0095F6] fill-current" />
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isDeleted ? { opacity: 0, height: 0, margin: 0, padding: 0 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className={`group relative flex gap-4 ${isDeleted ? 'overflow-hidden' : 'py-6 border-b border-slate-200 dark:border-white/5 last:border-none'} transition-all duration-300 ${isLongPressing ? 'scale-[0.98] bg-slate-50/50 dark:bg-white/5' : ''}`}
    >
      {/* Long Press Context Menu */}
      <AnimatePresence>
        {showLongPressMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute inset-0 z-[100] bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl flex items-center justify-center p-6 border-2 border-primary/20"
          >
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                <Trash2 size={32} />
              </div>
              <p className="text-center font-bold text-sm">Post Management</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLongPressMenu(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                >
                  Delete Post
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowLongPressMenu(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-foreground"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Left Column: Avatar & Connection Line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm relative z-10">
            {avatar ? (
              <img src={avatar} alt={user} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          {/* Status Indicator */}
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 z-20">
              {renderBadge()}
            </div>
          )}
        </div>
        {/* Threads-style Vertical Connector (Visible if has replies or just for aesthetic) */}
        <div className="w-[2px] flex-1 bg-slate-200 dark:bg-white/5 mt-2 rounded-full" />
      </div>

      {/* Right Column: Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-1 gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
            <div className="flex items-center min-w-0">
              {renderBadge()}
              <span className="font-bold text-slate-900 dark:text-white hover:underline cursor-pointer truncate max-w-[120px] md:max-w-none text-sm md:text-base">{user}</span>
            </div>
            {isLocal && (
              <span className="text-[10px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">LOCAL</span>
            )}
            <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 hidden xs:block" />
            <span className="text-[10px] md:text-xs text-slate-400 dark:text-white/40 font-medium whitespace-nowrap">
              {timestamp ? new Date(timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) : 'Just now'}
            </span>
          </div>
          {(authorId === session?.user?.id || (session?.user as any)?.role === 'ADMIN') && (
            <button
              onClick={handleDelete}
              className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all shrink-0"
              title="Delete Post"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {repostOf && (
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 font-medium italic">
            <Repeat2 className="w-3 h-3 text-green-500" />
            <span className="truncate">Reposted from @{repostOf.author.username}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="mb-4">
          <p
            className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-100 ${fontClass || ''}`}
            style={textColor ? { color: textColor } : undefined}
          >
            {content}
          </p>

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-semibold transition-colors bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 max-w-full overflow-hidden"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{link.length > 40 ? link.substring(0, 40) + '...' : link}</span>
            </a>
          )}

          {image && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-black/20">
              <img
                src={image}
                alt="Post content"
                className="w-full h-auto max-h-[512px] object-contain hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          )}

          {bookName && bookId && (
            <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-blue-500/20 max-w-full">
              <Book className="w-4 h-4 text-blue-500 shrink-0" />
              <a
                href={`/books/${bookId}`}
                className="text-blue-500 dark:text-blue-400 hover:underline font-bold text-xs truncate"
              >
                {bookName}
              </a>
            </div>
          )}
        </div>

        {/* Actions UI: Like, Reply, Repost, Share, Save */}
        <div className="flex items-center justify-between md:justify-start md:gap-8 relative overflow-x-auto no-scrollbar py-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 md:gap-2 group/btn ${liked ? 'text-pink-500' : 'text-slate-400 dark:text-white/40 hover:text-pink-500'} transition-all duration-200`}
          >
            <div className={`p-2 rounded-full ${liked ? 'bg-pink-500/10' : 'group-hover/btn:bg-pink-500/10'} transition-colors`}>
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${liked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[10px] md:text-xs font-bold">{likeCount > 0 ? likeCount : ''}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 md:gap-2 group/btn text-slate-400 dark:text-white/40 hover:text-blue-500 transition-all duration-200"
          >
            <div className="p-2 rounded-full group-hover/btn:bg-blue-500/10 transition-colors">
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-[10px] md:text-xs font-bold">{comments > 0 ? comments : ''}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDislike}
            className={`flex items-center gap-1.5 md:gap-2 group/btn ${disliked ? 'text-orange-500' : 'text-slate-400 dark:text-white/40 hover:text-orange-500'} transition-all duration-200`}
          >
            <div className={`p-2 rounded-full ${disliked ? 'bg-orange-500/10' : 'group-hover/btn:bg-orange-500/10'} transition-colors`}>
              <ThumbsDown className={`w-4 h-4 md:w-5 md:h-5 ${disliked ? 'fill-current' : ''}`} />
            </div>
            <span className="text-[10px] md:text-xs font-bold">{dislikeCount > 0 ? dislikeCount : ''}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRepost}
            className="flex items-center gap-1.5 md:gap-2 group/btn text-slate-400 dark:text-white/40 hover:text-green-500 transition-all duration-200"
          >
            <div className="p-2 rounded-full group-hover/btn:bg-green-500/10 transition-colors">
              <Repeat2 className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-[10px] md:text-xs font-bold">{repostCount > 0 ? repostCount : ''}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={`flex items-center gap-1.5 md:gap-2 group/btn ${saved ? 'text-yellow-500' : 'text-slate-400 dark:text-white/40 hover:text-yellow-500'} transition-all duration-200`}
          >
            <div className={`p-2 rounded-full ${saved ? 'bg-yellow-500/10' : 'group-hover/btn:bg-yellow-500/10'} transition-colors`}>
              <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${saved ? 'fill-current' : ''}`} />
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Post by ${user}`,
                  text: content,
                  url: window.location.href,
                })
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="flex items-center gap-1.5 md:gap-2 group/btn text-slate-400 dark:text-white/40 hover:text-blue-500 transition-all duration-200"
          >
            <div className="p-2 rounded-full group-hover/btn:bg-blue-500/10 transition-colors">
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </motion.button>
        </div>

        {/* Threads style reply indicator below actions */}
        {comments > 0 && !showComments && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:underline" onClick={() => setShowComments(true)}>
            <div className="flex -space-x-1">
              {[1, 2].map((i) => (
                <div key={i} className="w-4 h-4 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
            <span>{comments} replies</span>
          </div>
        )}

        {/* Comments Section (Expanded) */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-4 overflow-hidden"
            >
              {/* Loading Indicator */}
              {loadingComments && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              {/* Comment List */}
              <div className="space-y-6 mb-6">
                {commentsData.map((comment) => (
                  <div key={comment.id} className="group/comment">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0">
                        {comment.user.avatar ? (
                          <img src={comment.user.avatar} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl px-4 py-2 border border-slate-100 dark:border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">@{comment.user.username}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 ml-2">
                          <button
                            onClick={() => {
                              setReplyingTo(comment.id);
                              setCommentText(`@${comment.user.username} `);
                            }}
                            className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors"
                          >
                            Reply
                          </button>
                        </div>

                        {/* Replies Rendering */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-4 ml-6 border-l-2 border-slate-100 dark:border-white/5 pl-4">
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="flex gap-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0">
                                  {reply.user.avatar ? (
                                    <img src={reply.user.avatar} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                                      <User className="w-3 h-3 text-slate-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-2xl px-3 py-1.5 border border-slate-100 dark:border-white/5">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-bold text-[10px] text-slate-900 dark:text-white">@{reply.user.username}</span>
                                    <span className="text-[9px] text-slate-400">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-700 dark:text-slate-200">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1">
                  {replyingTo && (
                    <div className="flex items-center justify-between px-3 py-1 bg-primary/5 rounded-t-lg border-x border-t border-primary/10">
                      <span className="text-[10px] text-primary font-bold italic">Replying to comment...</span>
                      <button onClick={() => setReplyingTo(null)} className="text-primary hover:text-primary/80">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyingTo ? "Write your reply..." : "Reply to thread..."}
                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white ${replyingTo ? 'rounded-b-xl' : 'rounded-xl'} focus:outline-none focus:ring-1 focus:ring-primary/30 border border-slate-200 dark:border-white/5 resize-none`}
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim()}
                      className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-all font-sans"
                    >
                      {replyingTo ? 'Post Reply' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
