"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { MonoText } from "@/components/ui";
import { fadeInUp, staggerContainer, viewportOptions } from "@/lib/animations";
import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";

const AgentDroneScene = dynamic(
  () =>
    import("@/components/three/AgentDroneScene").then(
      (m) => m.AgentDroneScene
    ),
  { ssr: false }
);

/*
  Timeline (12s cycle, progress 0→1):
  0.00  user message starts typing
  0.08  user message done → agent "deploying" reply
  0.10  drone lifts off
  0.55  scan complete → agent result reply begins typing
  0.70  agent result fully visible
  0.92  drone docked, brief pause
  1.00  reset
*/

const USER_MSG = "Go check how many pallets of PHARMA-2104 are left on the shelves";
const AGENT_DEPLOY = "Deploying drone to scan aisle C…";
const AGENT_RESULT =
  "Scan complete. 14 pallets of PHARMA-2104 located across 3 racks in aisle C. WMS record updated.";

const CYCLE_DURATION = 14;

interface ChatMessage {
  role: "user" | "agent";
  text: string;
  visibleChars: number;
  status?: "typing" | "done";
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const displayText = msg.text.slice(0, msg.visibleChars);

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
          isUser
            ? "bg-accent/10 border border-accent/20"
            : "bg-background border border-border"
        }`}
      >
        {isUser ? (
          <User size={14} className="text-accent" />
        ) : (
          <Bot size={14} className="text-accent" />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-accent/10 border border-accent/20 text-foreground"
            : "bg-background border border-border text-secondary"
        }`}
      >
        {msg.status === "typing" && msg.visibleChars === 0 ? (
          <TypingIndicator />
        ) : (
          <>
            {displayText}
            {msg.status === "typing" && (
              <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 align-middle animate-pulse" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChatPanel({ progress }: { progress: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const msgs: ChatMessage[] = [];

    if (progress >= 0.01) {
      const typingEnd = 0.08;
      const charProgress = Math.min(progress / typingEnd, 1);
      const chars = Math.floor(charProgress * USER_MSG.length);
      msgs.push({
        role: "user",
        text: USER_MSG,
        visibleChars: chars,
        status: charProgress < 1 ? "typing" : "done",
      });
    }

    if (progress >= 0.08 && progress < 0.10) {
      msgs.push({
        role: "agent",
        text: AGENT_DEPLOY,
        visibleChars: 0,
        status: "typing",
      });
    } else if (progress >= 0.10) {
      const deployTypingStart = 0.10;
      const deployTypingEnd = 0.18;
      const charProgress = Math.min(
        (progress - deployTypingStart) / (deployTypingEnd - deployTypingStart),
        1
      );
      msgs.push({
        role: "agent",
        text: AGENT_DEPLOY,
        visibleChars: Math.floor(charProgress * AGENT_DEPLOY.length),
        status: charProgress < 1 ? "typing" : "done",
      });
    }

    if (progress >= 0.55 && progress < 0.58) {
      msgs.push({
        role: "agent",
        text: AGENT_RESULT,
        visibleChars: 0,
        status: "typing",
      });
    } else if (progress >= 0.58) {
      const resultTypingStart = 0.58;
      const resultTypingEnd = 0.75;
      const charProgress = Math.min(
        (progress - resultTypingStart) / (resultTypingEnd - resultTypingStart),
        1
      );
      msgs.push({
        role: "agent",
        text: AGENT_RESULT,
        visibleChars: Math.floor(charProgress * AGENT_RESULT.length),
        status: charProgress < 1 ? "typing" : "done",
      });
    }

    setMessages(msgs);
  }, [progress]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden h-[400px] md:h-[500px] flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background">
        <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
        <span className="font-mono text-[10px] text-muted uppercase tracking-wider">
          tair_agent v0.1 — langgraph
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted text-xs font-mono">awaiting input…</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatBubble key={`${msg.role}-${i}`} msg={msg} />
        ))}
      </div>
      <div className="border-t border-border px-4 py-3 bg-background">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-muted font-mono">
            Ask your warehouse anything…
          </div>
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgentDemo() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.15,
    triggerOnce: false,
  });
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = performance.now();
    if (startTimeRef.current === null) startTimeRef.current = now;
    const elapsed = (now - startTimeRef.current) / 1000;
    const p = (elapsed % CYCLE_DURATION) / CYCLE_DURATION;
    setProgress(p);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (inView) {
      startTimeRef.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
      setProgress(0);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, tick]);

  return (
    <section id="agent" className="py-32 px-6" ref={sectionRef}>
      <motion.div
        className="max-w-7xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <MonoText className="text-secondary text-xs uppercase tracking-widest">
            // ai agent
          </MonoText>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Ask your warehouse
          </h2>
          <p className="mt-4 text-secondary text-lg max-w-xl mx-auto leading-relaxed">
            Chat with a LangGraph-powered agent that dispatches autonomous
            drones and returns real-time inventory answers.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <ChatPanel progress={progress} />
            </div>
            <div className="lg:col-span-3">
              <AgentDroneScene phase={progress} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
