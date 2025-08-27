import React, { useState } from 'react';
import '../theme.css';
import './pages.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [form, setform] = useState({email:'',password:""});
  const [submitting, setsubmitting] = useState(false)
  const navigate = useNavigate();

    const handleChange = (e) => {
        const{ name , value} = e.target;
        setform({...form, [name]:value});
  };


  async function handleSubmit(e){
    e.preventDefault();
    setsubmitting(true)

    axios.post("https://libra-chat.onrender.com/api/auth/login",{
        email:form.email,
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
        <h2 className="form-title">Sign In</h2>
        <form className='form' onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
            autoComplete='email'
            name='email'
              type="email"
            //   value={form.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name='password'
            //   value={form.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="form-btn" disabled={submitting}>{submitting? 'Signing In...' :'Sign in'}</button>
        </form>
        <div className='redirect'><p>Don"t have an Account? <Link to="/register">Create One</Link></p></div>
      </div>
    </div>
  );
};

export default Login;
