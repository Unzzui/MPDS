import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Register.css';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return false;
    }
    if (formData.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('El email debe ser válido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      // Navigation will be handled by AuthContext
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Error al registrar usuario. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo">
              <h1 className="register-title">MPDS</h1>
              <h2 className="register-subtitle">STREETLIFTING SYSTEM</h2>
            </div>
            <h3 className="register-form-title">CREAR NUEVA CUENTA</h3>
            <p className="register-description">
              UNETE A LA COMUNIDAD Y COMIENZA A TRACKEAR TU PROGRESO
            </p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">[ERROR]</span> {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                NOMBRE DE USUARIO
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Elige un nombre de usuario"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="tu@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                CONTRASEÑA
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Minimo 6 caracteres"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                CONFIRMAR CONTRASEÑA
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Repite tu contraseña"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={isLoading || !formData.username || !formData.email || !formData.password || !formData.confirmPassword}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  CREANDO CUENTA...
                </>
              ) : (
                'CREAR CUENTA'
              )}
            </button>
          </form>

          <div className="register-footer">
            <div className="login-link">
              <p>
                ¿YA TIENES CUENTA?{' '}
                <Link to="/login" className="register-link">
                  INICIA SESION AQUI
                </Link>
              </p>
            </div>
            
            <div className="register-benefits">
              <h4 className="benefits-title">¿POR QUE REGISTRARSE?</h4>
              <ul className="benefits-list">
                <li>TRACKEA TUS ENTRENAMIENTOS</li>
                <li>VISUALIZA TU PROGRESO</li>
                <li>ESTABLECE Y ALCANZA TUS METAS</li>
                <li>PROYECCIONES DE 1RM AUTOMATICAS</li>
                <li>DASHBOARD QUE SE ADAPTA A TU NIVEL</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
