import React, { useState } from 'react';
import { ArrowRight, Instagram, Heart, ExternalLink, X } from 'lucide-react';
import { INSTAGRAM_POSTS } from '../data/products';
import { InstagramPost } from '../types';

export const InstagramGrid: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-[#333333] decorative-sparkle">
            From Our Instagram
          </h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Follow our daily atelier diaries, custom packaging reveals & styling inspo.
          </p>
        </div>

        <a
          href="https://instagram.com/maryamsparkle456"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#2d5a61] hover:text-[#1e3c41] flex items-center group"
        >
          <Instagram className="w-4 h-4 mr-1.5" />
          <span>Follow us @maryamsparkle456</span>
          <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>

      {/* 8-Grid of Instagram Photos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
        {INSTAGRAM_POSTS.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-[#e0d8c8] cursor-pointer shadow-2xs"
          >
            <img
              src={post.image}
              alt={post.caption}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              loading="lazy"
            />

            {/* Hover overlay with heart & likes */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-2 text-center">
              <div className="flex items-center gap-1 text-xs font-semibold mb-1">
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>{post.likes}</span>
              </div>
              <Instagram className="w-4 h-4 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Instagram Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-[#fdfaf5] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e0d8c8]">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-square bg-black">
              <img
                src={selectedPost.image}
                alt="Instagram post preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#2d5a61] text-white flex items-center justify-center text-xs font-serif font-bold">
                    M
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#333333]">{selectedPost.handle}</h4>
                    <p className="text-[10px] text-[#888888]">Atelier Lahore</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#2d5a61]">
                  <Heart className="w-4 h-4 fill-[#2d5a61]" />
                  <span>{selectedPost.likes} likes</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed mb-4">
                {selectedPost.caption}
              </p>

              {selectedPost.productTag && (
                <div className="inline-flex items-center gap-1.5 text-xs bg-[#efe8dc] px-3 py-1 rounded-full text-[#2d5a61] font-medium">
                  <span>Tagged: {selectedPost.productTag}</span>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-[#e0d8c8] flex justify-end">
                <a
                  href="https://instagram.com/maryamsparkle456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d5a61] hover:underline"
                >
                  <span>View on Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
