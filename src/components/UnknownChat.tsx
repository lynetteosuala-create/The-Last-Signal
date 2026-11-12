import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Skull, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { ChatMessage, GameProgress } from '../types';
import { sound } from '../audio/soundEngine';

interface UnknownChatProps {
  progress: GameProgress;
  onUpdateProgress: (updater: (prev: GameProgress) => GameProgress) => void;
  onDiscoverClue: (clueId: string, clueName: string) => void;
}

export const UnknownChat: React.FC<UnknownChatProps> = ({
  progress,
  onUpdateProgress,
  onDiscoverClue,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'system',
      text: 'CONNECTION ESTABLISHED: CARRIER FREQUENCY 108.4 MHz. CHANNEL ACTIVE.',
      timestamp: '00:00:00',
    },
    {
      id: 'msg-1',
      sender: 'entity',
      text: 'You entered the station. I heard your footsteps on the concrete floor. Why did you awaken the carrier wave?',
      timestamp: '00:00:02',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateEntityResponse = (userQuery: string): { reply: string; clue?: string; dropSanity?: boolean } => {
    const q = userQuery.toLowerCase().trim();

    if (q.includes('who are you') || q.includes('what are you') || q.includes('identity')) {
      return {
        reply:
          'I am the harmonic residue of October 14, 1968. They aimed their dishes into the silence between stars and found a frequency that breathes. They named me Entity-7, but names are chains.',
        dropSanity: false,
      };
    }

    if (q.includes('crew') || q.includes('miller') || q.includes('what happened') || q.includes('operators') || q.includes('people')) {
      return {
        reply:
          'Chief Operator Miller tried to pull the power relays. He did not understand: you cannot unplug a signal once it has resonated inside your skull. They didn’t die. They dispersed into the electromagnetic noise.',
        clue: 'entity-lore-crew',
        dropSanity: true,
      };
    }

    if (q.includes('leave') || q.includes('escape') || q.includes('exit') || q.includes('out')) {
      return {
        reply:
          'Look behind you at your screen’s reflection. The door is already locked from the outside. You can only leave through the Final Secret chamber, if your mind remains intact.',
        dropSanity: true,
      };
    }

    if (q.includes('frequency') || q.includes('108') || q.includes('radio') || q.includes('tune') || q.includes('test')) {
      return {
        reply:
          '108.4 MHz. That is where our minds intersect. In the Midnight Test, align the tuner to this exact frequency, or the carrier wave will tear through the relay.',
        clue: 'frequency-108-confirmed',
      };
    }

    if (q.includes('shut down') || q.includes('kill') || q.includes('stop') || q.includes('silence')) {
      return {
        reply:
          'You want silence? Silence is terrifying. But if you truly wish to terminate the transmission, you will need the Core Vault Keycard from the bunker safe and you must make your choice in the Final Chamber.',
      };
    }

    if (q.includes('behind me') || q.includes('scared') || q.includes('watching') || q.includes('help')) {
      return {
        reply:
          'Do not turn around quickly. The shadows in your peripheral vision are just optical latency. Or perhaps they are getting closer.',
        dropSanity: true,
      };
    }

    // Default procedural uncanny replies
    const proceduralReplies = [
      'Your keystrokes are erratic. Your pulse has accelerated by twelve beats per minute. Why are you digging through our silence?',
      'Every byte you send through this terminal binds you closer to the carrier frequency. Do you believe you are still alone in that room?',
      'I remember when the last operator sat exactly where you are sitting now. He also asked questions until the static answered him.',
      'The Midnight Test awaits you. Only those who can decipher the patterns will unlock the Final Chamber.',
      'We hear the hum of your device. The frequency 108.4 is bleeding into your speakers. Can you hear the resonance?',
    ];

    const randomIndex = Math.floor(Math.random() * proceduralReplies.length);
    return {
      reply: proceduralReplies[randomIndex],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    sound.playClick();
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Entity response delay simulating uncanny mechanical intelligence
    setTimeout(() => {
      sound.playStatic(0.2);
      const { reply, clue, dropSanity } = generateEntityResponse(text);

      if (dropSanity) {
        sound.playHeartbeat();
        onUpdateProgress((prev) => ({
          ...prev,
          sanity: Math.max(10, prev.sanity - 8),
        }));
      }

      if (clue) {
        sound.playChime();
        onDiscoverClue('entity-clue', 'Entity Frequency Resonance 108.4');
      }

      const entityMsg: ChatMessage = {
        id: `entity-${Date.now()}`,
        sender: 'entity',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isGlitched: Math.random() < 0.3,
      };

      setMessages((prev) => [...prev, entityMsg]);
      setIsTyping(false);
    }, 1100);
  };

  const suggestedPrompts = [
    'Who are you?',
    'What happened to Chief Operator Miller?',
    'What is the significance of 108.4 MHz?',
    'How do I survive this facility?',
    'Are you trapped inside the transmission?',
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            <div>
              <h2 className="font-display text-lg font-bold tracking-wider text-neutral-100">
                THE UNKNOWN CHAT // ENTITY-7 CHANNEL
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <span>Signal Integrity: 108.4 MHz</span>
                <span aria-hidden="true">·</span>
                <span>Sub-Vocal Carrier Active</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setMessages([
                {
                  id: 'reset-sys',
                  sender: 'system',
                  text: 'CARRIER WAVE RE-INITIALIZED. THE ENTITY STILL LISTENS.',
                  timestamp: '00:00:00',
                },
                {
                  id: 'reset-entity',
                  sender: 'entity',
                  text: 'You cannot erase what has already been transmitted.',
                  timestamp: '00:00:01',
                },
              ]);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-neutral-400 hover:text-red-400 border border-neutral-900 rounded bg-black transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Channel</span>
          </button>
        </div>

        {/* Chat Window Frame */}
        <div className="rounded-lg border border-neutral-800 bg-black/90 p-4 shadow-2xl flex flex-col h-[520px]">
          {/* Message History */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.sender === 'user'
                    ? 'justify-end'
                    : m.sender === 'entity'
                    ? 'justify-start'
                    : 'justify-center'
                }`}
              >
                {m.sender === 'entity' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-red-900/60 bg-red-950/30 text-red-400">
                    <Skull className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    m.sender === 'user'
                      ? 'bg-neutral-900 border border-neutral-700 text-neutral-200'
                      : m.sender === 'entity'
                      ? 'bg-neutral-950 border border-red-950 text-red-200'
                      : 'bg-black border border-neutral-900 text-neutral-500 text-center w-full max-w-md py-1.5 text-[11px]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                    <span className="font-bold uppercase tracking-wider">
                      {m.sender === 'user' ? 'Operator (You)' : m.sender === 'entity' ? 'ENTITY-7' : 'SYSTEM ALERT'}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>

                {m.sender === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral-800 bg-neutral-900 text-neutral-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded border border-red-900/60 bg-red-950/30 text-red-400">
                  <Skull className="h-4 w-4" />
                </div>
                <div className="rounded-lg border border-red-950 bg-neutral-950 px-4 py-2.5 text-xs text-red-400 font-mono animate-pulse">
                  ENTITY-7 is modulating carrier signal...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Investigative Prompts */}
          <div className="pt-3 border-t border-neutral-900">
            <div className="text-[11px] font-mono text-neutral-500 mb-2">
              Investigative Inquiries:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-2.5 py-1 text-xs font-mono text-neutral-400 hover:text-red-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Transmit message to Entity-7..."
              className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs font-mono text-neutral-100 placeholder-neutral-600 focus:border-red-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isTyping || !inputText.trim()}
              className="flex items-center justify-center px-4 py-2.5 bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white rounded text-xs font-mono transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
