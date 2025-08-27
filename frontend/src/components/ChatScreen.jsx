import React from 'react';


const ChatScreen = ({ messages, loading }) => {
  const hasUserMessage = messages.some(msg => msg.sender === 'user');
  return (
    <div className="home-chat-screen" style={{ flex: 1, overflowY: 'auto', marginBottom: 0 }}>
      {!hasUserMessage && (
        <>
        <div className='chat-center'>
          <div className="chat-center-title">Libra Chat</div>
          <p className="chat-center-desc">
            Ask anything, brainstorm ideas, get quick explanations, your chats remain on the sidebar, so you can pick off where you left
          </p>
          <p>Click on New+ to start chatting</p>
          </div>
        </>
      )}
      {messages.map((msg, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '0.5rem' }}>
          <span className="chat-sender-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: msg.sender === 'user' ? '#4f8cff' : '#888', marginBottom: '2px', marginLeft: msg.sender === 'user' ? 'auto' : '0', marginRight: msg.sender === 'user' ? '0' : 'auto' }}>
            {msg.sender === 'user' ? 'You' : 'Libra'}
          </span>
          <div className={`home-message ${msg.sender}`}>
            {msg.text}
          </div>
        </div>
      ))}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <span className="chat-sender-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '2px' }}>Libra</span>
          <div className="home-message ai">AI is typing...</div>
        </div>
      )}
    </div>
  );
};


export default ChatScreen;
