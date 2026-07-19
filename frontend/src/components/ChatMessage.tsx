/**
 * @fileoverview ChatMessage — renders a single chat bubble for the Fan Companion.
 * Fix #5: Copy/Speak buttons always visible and keyboard-accessible (no opacity-0 hide).
 *         Copy shows feedback toast. Clipboard errors handled gracefully.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Volume2, Check } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onSpeak?: (text: string) => void;
}

export function ChatMessage({ message, onSpeak }: ChatMessageProps) {
  const isUser = message.role === 'user';
  // Fix #5: copied feedback state
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    // Fix #5: catch clipboard errors — no unhandled rejection
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (non-HTTPS or denied) — silently skip
    }
  };

  // Aria label: avoid trailing "..." when content is short
  const ariaSnippet =
    message.content.length > 50
      ? `${message.content.slice(0, 50)}…`
      : message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      role="listitem"
      aria-label={`${isUser ? 'You' : 'StadiumPulse'}: ${ariaSnippet}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 font-bold border"
        style={
          isUser
            ? {
                background: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#34d399',
              }
            : {
                background: 'linear-gradient(135deg, #3B7EC2, #1e5fa8)',
                borderColor: 'rgba(59, 126, 194, 0.4)',
                color: '#ffffff',
              }
        }
        aria-hidden="true"
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble + actions */}
      <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-2.5 rounded-2xl text-xs leading-relaxed"
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  borderRadius: '16px 16px 2px 16px',
                  boxShadow: '0 2px 10px rgba(16,185,129,0.25)',
                }
              : {
                  background: 'rgba(255, 255, 255, 0.07)',
                  color: '#f4f4f5',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px 16px 16px 2px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }
          }
        >
          <p className="font-medium">{message.content}</p>
        </div>

        {/*
          Fix #5: action buttons are ALWAYS rendered (not opacity-0).
          They use opacity-60 at rest and opacity-100 on focus/hover so keyboard
          users can always tab to them, while keeping visual noise low.
        */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5">
            <button
              onClick={() => onSpeak?.(message.content)}
              className="p-1.5 rounded-lg transition-all duration-150 opacity-60 hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-assist-blue"
              style={{ backgroundColor: 'transparent' }}
              aria-label="Read message aloud"
              title="Read aloud"
            >
              <Volume2 size={12} className="text-floodlight/40" aria-hidden="true" />
            </button>

            <button
              onClick={() => void copyToClipboard()}
              className="p-1.5 rounded-lg transition-all duration-150 opacity-60 hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-assist-blue flex items-center gap-1"
              style={{ backgroundColor: 'transparent' }}
              aria-label={copied ? 'Copied!' : 'Copy message'}
              title={copied ? 'Copied!' : 'Copy'}
            >
              {copied ? (
                <Check size={12} className="text-pitch" aria-hidden="true" />
              ) : (
                <Copy size={12} className="text-floodlight/40" aria-hidden="true" />
              )}
              {/* Inline "Copied!" text — visible briefly after copy */}
              {copied && (
                <span className="text-[9px] font-bold text-pitch font-mono uppercase tracking-wider">
                  Copied
                </span>
              )}
            </button>
          </div>
        )}

        <time
          className="text-[10px] text-floodlight/30 mt-0.5 px-1 font-mono font-bold"
          dateTime={new Date(message.timestamp).toISOString()}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>
    </motion.div>
  );
}
