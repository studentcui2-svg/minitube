import { useEffect, useState, useRef } from "react";

function ChatPanel({ messages, onSendMessage }) {
  const [draftMessage, setDraftMessage] = useState("");
  const [localMessages, setLocalMessages] = useState(messages);

  // Reference to the bottom of the chat list for auto-scrolling
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let t = null;
    // Schedule state update asynchronously to avoid sync setState inside effect
    t = window.setTimeout(() => setLocalMessages(messages), 0);
    return () => {
      if (t) window.clearTimeout(t);
    };
  }, [messages]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = () => {
    const trimmed = draftMessage.trim();
    if (!trimmed) return;

    const nextMessage = {
      user: "You",
      message: trimmed,
      isSelf: true, // Tag it so we can color your own name differently
    };

    setLocalMessages((current) => [...current, nextMessage]);
    onSendMessage?.(trimmed);
    setDraftMessage("");
  };

  // Allow sending with the Enter key
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="flex h-125 w-full flex-col overflow-hidden rounded-xl border border-[#272727] bg-[#0f0f0f] font-sans">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-[#272727] px-4 py-3">
        <h2 className="text-base text-[#f1f1f1]">Live chat</h2>
        <button
          className="text-[#aaaaaa] transition hover:text-[#f1f1f1]"
          aria-label="Chat menu"
        >
          {/* Authentic YouTube 3-dot vertical icon */}
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {/* 2. Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide">
        <div className="flex flex-col gap-2">
          {localMessages.map((message, index) => (
            <div
              key={`${message.user}-${index}`}
              className="flex items-start gap-3"
            >
              {/* Small Avatar */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3ea6ff] text-[10px] font-medium text-[#0f0f0f]">
                {message.user.slice(0, 1).toUpperCase()}
              </div>

              {/* Compact Inline Message */}
              <div className="text-[13px] leading-tight">
                <span
                  className={`mr-2 font-medium ${
                    message.isSelf ? "text-[#3ea6ff]" : "text-[#aaaaaa]"
                  }`}
                >
                  {message.user}
                </span>
                <span className="text-[#f1f1f1]">{message.message}</span>
              </div>
            </div>
          ))}
          {/* Invisible div to act as the scroll target */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Input Area */}
      <div className="border-t border-[#272727] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3ea6ff] text-[10px] font-medium text-[#0f0f0f]">
            Y
          </div>
          <div className="flex flex-1 items-center border-b border-[#aaaaaa] pb-1 focus-within:border-[#f1f1f1]">
            <input
              type="text"
              placeholder="Chat..."
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-[13px] text-[#f1f1f1] outline-none placeholder:text-[#aaaaaa]"
            />
            {/* Send Icon (Only visible when typing) */}
            {draftMessage.trim().length > 0 && (
              <button
                type="button"
                onClick={handleSend}
                className="ml-2 text-[#aaaaaa] hover:text-[#3ea6ff]"
                aria-label="Send message"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ChatPanel;
