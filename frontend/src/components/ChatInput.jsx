import React from 'react';

const ChatInput = ({ input, setInput, handleSend, loading }) => (
  <form className="home-input-row" onSubmit={handleSend}>
    <input
      className="home-input"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Type your message..."
      disabled={loading}
      autoFocus
    />
    <button
      className="home-send-btn"
      type="submit"
      disabled={loading || !input.trim()}
    >
      Send
    </button>
  </form>
);

export default ChatInput;
