import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [], // [{id, title, messages: []}]
  currentChatId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      if (chat) {
        chat.messages = messages;
      }
    },
    createChat: (state, action) => {
  const { _id, title } = action.payload;
  state.chats.push({ _id, title, messages: [] });
  state.currentChatId = _id;
    },
    setCurrentChat: (state, action) => {
      state.currentChatId = action.payload;
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      if (!chat) {
        console.warn('addMessage: chat not found for id', chatId);
        return;
      }
      if (!Array.isArray(chat.messages)) {
        chat.messages = [];
      }
      chat.messages.push(message);
    },
  setChats(state,action){
    state.chats = action.payload;
    // Restore currentChatId from localStorage if valid
    const savedChatId = typeof window !== 'undefined' ? window.localStorage.getItem('currentChatId') : null;
    if (savedChatId && action.payload.some(c => c._id === savedChatId)) {
      state.currentChatId = savedChatId;
    }
  },
    promptSwitchChat: (state, action) => {
      // This reducer can be used to trigger a UI prompt in your component
      // e.g. set a flag in state, or use middleware for side effects
      // For now, just set currentChatId
      state.currentChatId = action.payload;
    }
  }
});

export const { createChat, setCurrentChat, addMessage, promptSwitchChat,setChats,setChatMessages } = chatSlice.actions;
export default chatSlice.reducer;
