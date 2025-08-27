import React, { useState } from 'react';
import '../theme.css';
import './pages.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
const Register = () => {
  const [form, setForm] = useState({
    email: '',
    firstname: '',
    lastname: '',
    password: ''
  });
    const [submitting, setsubmitting] = useState(false)
  const navigate = useNavigate();
  const handleChange = (e) => {
    const {name ,value } = e.target
    setForm({ ...form, [name]: value });
  };

  async function handleSubmit(e){
    e.preventDefault();
    setsubmitting(true)
    axios.post("https://libra-chat.onrender.com/api/auth/register",{
        email:form.email,
        fullName:{
            firstName:form.firstname,
            lastName:form.lastname
        },
        password:form.password
    },
    {
        withCredentials:true
    }
    ).then((res)=>{
        console.log(res)
        navigate("/")
    }).catch((err)=>{
        console.log(err)
    }).finally(()=>{
        setsubmitting(false)
    })
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h2 className="form-title">Create Account</h2>
        <form className='form' onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstname"
              value={form.firstname}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="form-btn" disabled={submitting}>{submitting? 'Creating Account...' :'Create Account'}</button>
        </form>
        <div className='redirect'><p className=''>Already have an Account? <Link to="/login">Sign In</Link></p></div>
      </div>
    </div>
  );
};

export default Register;
