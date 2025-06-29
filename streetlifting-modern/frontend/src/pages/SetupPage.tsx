import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Setup.css';

const SetupPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: '',
    weight: '',
    height: '',
    pull_up_rm: '',
    dip_rm: '',
    squat_rm: '',
    muscle_up_rm: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to update user data
    console.log('Updating user data:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">Configuración del Usuario</h1>
        <p className="text-xl text-gray-300">Configura tus datos personales y 1RM iniciales</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Edad</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Peso (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Altura (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* 1RM Initial Values */}
          <div>
            <h2 className="text-2xl font-bold text-orange-500 mb-4">1RM Iniciales (kg)</h2>
            <p className="text-gray-300 mb-4">Establece tus valores de 1RM iniciales para cada ejercicio</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Pull-Up</label>
                <input
                  type="number"
                  name="pull_up_rm"
                  value={formData.pull_up_rm}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Weighted Dips</label>
                <input
                  type="number"
                  name="dip_rm"
                  value={formData.dip_rm}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Squat</label>
                <input
                  type="number"
                  name="squat_rm"
                  value={formData.squat_rm}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Muscle-ups</label>
                <input
                  type="number"
                  name="muscle_up_rm"
                  value={formData.muscle_up_rm}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupPage; 