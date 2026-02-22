import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { Card } from '../../components/ui/Card/Card';
import './LoginPage.css';
import { loginUser } from '../../services/api';


function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await loginUser({
        email: formData.email,
        password: formData.password
      });
      // Предполагается, что backend возвращает токен
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate('/dashboard');
      } else {
        setError('Неверный ответ от сервера');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return <div className="login-page">
      <div className="login-bg-gradient"></div>
      <div className="login-bg-gradient-2"></div>

      <motion.div className="login-container" initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.5
    }}>
        <div className="login-header">
          <div className="login-logo">
            <Shield size={24} />
          </div>
          <h1 className="login-title">Добро пожаловать</h1>
          <p className="login-subtitle">Войдите в свой аккаунт CyberLearn</p>
        </div>

        <Card variant="glass" className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <Input label="Email" name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} icon={<Mail size={16} />} required />

            <Input label="Пароль" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} icon={<Lock size={16} />} required />

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Запомнить меня</span>
              </label>
              <button type="button" className="forgot-password">
                Забыли пароль?
              </button>
            </div>

            <Button type="submit" size="lg" className="login-button" disabled={isLoading} rightIcon={<ArrowRight size={20} />}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
            {error && <p className="login-error">{error}</p>}

            <div className="divider">
              <span>или</span>
            </div>

            <button type="button" className="social-button">
              <Github size={20} />
              Войти через GitHub
            </button>
          </form>
        </Card>

        <p className="login-footer">
          Нет аккаунта?{' '}
          <button onClick={() => navigate('/register')} className="register-link">
            Зарегистрироваться
          </button>
        </p>
      </motion.div>
    </div>;
}
export default LoginPage;