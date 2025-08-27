import './Home.css';
import '../theme.css';
import {io} from 'socket.io-client'
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentChat, addMessage, setChats, setChatMessages } from '../chatSlice';
import Sidebar from '../components/Sidebar';
import ChatScreen from '../components/ChatScreen';
import ChatInput from '../components/ChatInput';
import axios from 'axios';


const Home = () => {
  const navigate = useNavigate();
  // Redirect to login if no token in cookies
  useEffect(() => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (!tokenCookie) {
      navigate('/login');
    }
  }, [navigate]);
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const currentChatId = useSelector(state => state.chat.currentChatId);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [socket, setSocket] = useState(null)

  // On mount, fetch chats and set in Redux, and set up socket
  useEffect(() => {
    axios.get("http://localhost:3000/api/chat", { withCredentials: true })
      .then(response => {
        const loadedChats = response.data.chats.reverse();
        dispatch(setChats(loadedChats));
        // Do NOT restore selected chat here; do it after chats are set
      })
      .catch(error => {
        console.error('Error fetching chats:', error);
      });

    const tempSocket = io("http://localhost:3000",{
      withCredentials:true
    });

    tempSocket.on("ai-response",(message)=>{
      // Add AI response to chat
      dispatch(addMessage({ chatId: message.chat, message: { sender: 'ai', text: message.content } }));
      setLoading(false);
    });

    setSocket(tempSocket);
    // Only run once on mount to avoid duplicate socket connections/listeners
    // eslint-disable-next-line
  }, []);

  // Restore selected chat from localStorage after chats are loaded
  useEffect(() => {
    if (chats && chats.length > 0) {
      const savedChatId = localStorage.getItem('currentChatId');
      if (
        savedChatId &&
        chats.some(c => c._id === savedChatId) &&
        currentChatId !== savedChatId
      ) {
        dispatch(setCurrentChat(savedChatId));
      }
    }
  }, [chats, dispatch, currentChatId]);
  // Persist currentChatId to localStorage whenever it changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId);
    } else {
      localStorage.removeItem('currentChatId');
    }
  }, [currentChatId]);

  // ...existing code...

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentChatId) return;
    const userMsg = { sender: 'user', text: input };
    dispatch(addMessage({ chatId: currentChatId, message: userMsg }));
    setInput('');
    setLoading(true);
    // Send user message to backend via socket
    if (socket) {
      socket.emit("ai-message", {
        chat: currentChatId,
        content: input.trim()
      });
    }
  };

  const handleNewChat = async() => {
  // Always prompt for new chat name, regardless of messages
  setPrompt(true);
  setNewChatTitle('');
  };

  const confirmSwitchChat = async () => {
    setPrompt(false);
    const title = newChatTitle.trim() ? newChatTitle.trim() : `Chat ${chats.length + 1}`;
    // Send chat title to backend
    const response = await axios.post("http://localhost:3000/api/chat", {
      title
    }, {
      withCredentials: true
    });

    console.log(response.data);

    // After creating, fetch latest chats and set current chat
    const chatId = response.data.chat._id;
    const chatsResponse = await axios.get("http://localhost:3000/api/chat", { withCredentials: true });
    const loadedChats = chatsResponse.data.chats.reverse();
    dispatch(setChats(loadedChats));
    dispatch(setCurrentChat(chatId));
    localStorage.setItem('currentChatId', chatId);
  };

  // Show sidebar toggle button only on mobile
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 600 : false
  );

useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 600;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // Always close sidebar on desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMessages = async (chatId) =>{
  const response = await axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, {withCredentials:true});
  const messages = response.data.messages.map(m => ({
    sender: m.role === 'user' ? 'user' : 'ai',
    text: m.content
  }));
  dispatch(setChatMessages({ chatId, messages }));

  }

  return (
    <>
      {prompt && (
        <div className="chat-prompt-modal">
          <div className="chat-prompt-content">
            <p>Libra-chat<br/> <span>Enter a name for your new chat:</span></p>
            <input
              type="text"
              value={newChatTitle}
              onChange={e => setNewChatTitle(e.target.value)}
              placeholder={`Chat ${chats.length + 1}`}
              style={{ margin: '1rem 0', padding: '0.5rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc', width: '80%' }}
              autoFocus
            />
            <div>
              <button onClick={confirmSwitchChat} disabled={loading}>
                Create Chat
              </button>
              <button onClick={() => setPrompt(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isMobile && (
        <div className="mobile-topbar">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle sidebar"
          >
            &#9776;
          </button>
        </div>
      )}
      <div className="home-root">
        <Sidebar
          previousChats={chats}
          selectedChat={currentChatId}
          setSelectedChat={(id) => {
            dispatch(setCurrentChat(id));
            localStorage.setItem('currentChatId', id);
            setSidebarOpen(false);
            getMessages(id);
          }}
          handleNewChat={handleNewChat}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
        <main className="home-main">
          <ChatScreen
            messages={
              chats.find(c => (c._id || c.id) === currentChatId)?.messages || []
            }
            loading={loading}
          />
          {currentChatId && (
            <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, background: 'var(--input-bg-light)', zIndex: 10 }}>
              <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                loading={loading}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
