import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Register from '../pages/Register'
import Login from '../pages/Login'
import { Navigate } from 'react-router-dom';

const Approutes = () => {
  // Helper to check for token in cookies
  const hasToken = document.cookie.split(';').map(c => c.trim()).some(c => c.startsWith('token='));

  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/login' element={<Login/>}/>
      {/* Catch-all route for any other path, use Navigate for clean redirect */}
      <Route path='*' element={<Navigate to={hasToken ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default Approutes