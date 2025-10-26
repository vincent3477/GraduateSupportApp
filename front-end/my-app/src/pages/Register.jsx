// Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name}),
      });

      if (response.status == 400) {
        throw new Error('Username already exists!');
      }
      else if (!response.ok){
        throw new Error('A server side error has occurrred.')
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
      <div className="mx-auto max-w-md rounded-3xl border border-[#e4dcc4] bg-white/90 p-8 shadow-2xl shadow-[#2F4D6A]/10 backdrop-blur">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome</h1>
        <p className="mt-2 text-sm text-slate-600">
          Hi, welcome aboard! We hope this will be helpful in supporting as you find your path.
        </p>
        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="register-name" className="text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Kim"
              className="rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-slate-700 outline-none focus:border-[#2F4D6A]"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="register-email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="register-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@email.com"
              className="rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-slate-700 outline-none focus:border-[#2F4D6A]"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="register-password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="register-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          Already have an account?{" "}
          <a href="/Login" className="interactive inline-flex items-center font-semibold text-[#2F4D6A]">
            Log back in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
