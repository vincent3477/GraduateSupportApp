<<<<<<< HEAD
// Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
=======
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadSupportData } from "../utils/supportStorage.js";
import PageBackButton from "../components/PageBackButton.jsx";
>>>>>>> df3b948 (added new features)

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      setIsAuthenticated(true); // Update parent state
      navigate('/support');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-white to-[#f0ede2] px-4 py-20 text-slate-900">
<<<<<<< HEAD
      <div className="mx-auto max-w-md rounded-3xl border border-[#e4dcc4] bg-white/90 p-8 shadow-2xl shadow-[#2F4D6A]/10 backdrop-blur">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the details you used during onboarding to jump straight into your support board.
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Alex Kim"
              className="rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-slate-700 outline-none focus:border-[#2F4D6A]"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="login-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="alex@email.com"
              className="rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-slate-700 outline-none focus:border-[#2F4D6A]"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="interactive w-full rounded-full bg-[#2F4D6A] px-6 py-3 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
          >
            Access support board
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          Need to create your profile?{" "}
          <a href="/register" className="interactive inline-flex items-center font-semibold text-[#2F4D6A]">
            Start onboarding
          </a>
        </p>
=======
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageBackButton fallback="/" className="w-fit" />
        <div className="rounded-3xl border border-[#e4dcc4] bg-white/90 p-8 shadow-2xl shadow-[#2F4D6A]/10 backdrop-blur">
          <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the details you used during onboarding to jump straight into your support board.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="login-name" className="text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Kim"
                className="rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-slate-700 outline-none focus:border-[#2F4D6A]"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@email.com"
                className="rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-slate-700 outline-none focus:border-[#2F4D6A]"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="interactive w-full rounded-full bg-[#2F4D6A] px-6 py-3 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
            >
              Access support board
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-500">
            Need to create your profile?{" "}
            <a href="/onboarding" className="interactive inline-flex items-center font-semibold text-[#2F4D6A]">
              Start onboarding
            </a>
          </p>
        </div>
>>>>>>> df3b948 (added new features)
      </div>
    </div>
  );
};

export default Login;
