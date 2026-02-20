'use client';

import React, { useState, useRef } from "react";
import { Image as ImageIcon, X, Send, Sparkles, Lock, Crown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';

export const NewPostForm = ({ onAdd, isPremium = false }: { onAdd: (content: string, image?: string) => void; isPremium?: boolean }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !image) || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, image })
      });

      if (res.ok) {
        const newPost = await res.json();
        onAdd(newPost);
        setText("");
        setImage(null);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 w-full border-b border-slate-200 dark:border-white/5 pb-8">
      <div className="flex gap-4">
        {/* Left Column: Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-[2px] shadow-sm">
            <div className="w-full h-full rounded-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
              <User className="w-6 h-6 text-slate-400 dark:text-white/40" />
            </div>
          </div>
        </div>

        {/* Right Column: Input & Actions */}
        <div className="flex-1">
          <textarea
            value={text}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={e => setText(e.target.value)}
            placeholder="Start a thread..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 resize-none focus:outline-none text-base md:text-lg font-medium leading-relaxed min-h-[60px]"
          />

          <AnimatePresence>
            {image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mt-4 group max-w-md"
              >
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                  <img
                    src={image}
                    alt="Preview"
                    className="max-h-[300px] w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all"
                title="Attach image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <button
              type="submit"
              disabled={!text.trim() && !image || isLoading}
              className={`px-6 py-1.5 rounded-full font-bold text-sm transition-all shadow-sm ${(!text.trim() && !image)
                ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed"
                : "bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95"
                }`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
