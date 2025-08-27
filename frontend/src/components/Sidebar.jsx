import React from 'react';

const Sidebar = ({ previousChats, selectedChat, setSelectedChat, handleNewChat, open, setOpen }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  // Logout handler: remove token from cookies and reload
  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    window.location.reload();
  };

  return (
    <>
      <aside
        className={`home-sidebar${isMobile ? ' mobile' : ''}${open ? ' open' : ''}`}
        style={isMobile && !open ? { display: 'none' } : {}}
      >
        {isMobile && (
          <button
            className="sidebar-close-btn"
            onClick={() => setOpen(false)}
            style={{ alignSelf: 'flex-end', marginBottom: '1rem', fontSize: '1.5rem', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
            aria-label="Close sidebar"
          >
            &times;
          </button>
        )}
        <div className='sidebar-new-chat' >
          <h3>Chats</h3>
        <button
          className="home-send-btn"
          onClick={handleNewChat}
        >  
          New +
        </button>
        </div>
        <div className="home-chat-list">
          {previousChats.map((chat) => (
            <div
              key={chat._id}
              className={`home-chat-item${selectedChat === chat._id ? ' selected' : ''}`}
              onClick={() => setSelectedChat(chat._id)}
            >
              {chat.title}
            </div>
          ))}
        </div>
        <button
          className="home-send-btn"
          style={{ margin: '1.5rem 0', width: '80%', alignSelf: 'center', background: '#ff6f61' }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>
      {/* Removed sidebar-overlay click-to-close for mobile. Sidebar only closes via button or chat selection. */}
    </>
  );
};

export default Sidebar;
