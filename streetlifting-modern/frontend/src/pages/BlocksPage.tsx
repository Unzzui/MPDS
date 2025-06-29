import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlocks } from '../hooks/useBlocks';
import type { TrainingBlock } from '../types';
import '../styles/Blocks.css';

const BlocksPage: React.FC = () => {
  const { blocks, isLoadingBlocks, currentBlock, createBlock, deleteBlock, isDeletingBlock } = useBlocks();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleDeleteBlock = async (blockId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este bloque de entrenamiento?')) {
      deleteBlock(blockId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'planned':
        return 'status-planned';
      default:
        return 'status-default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completado';
      case 'planned':
        return 'Planificado';
      default:
        return 'Desconocido';
    }
  };

  if (isLoadingBlocks) {
    return (
      <div className="blocks-container">
        <div className="blocks-header">
          <h1>Bloques de Entrenamiento</h1>
        </div>
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Cargando bloques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blocks-container">
      <div className="blocks-header">
        <h1>Bloques de Entrenamiento</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Crear Bloque
        </button>
      </div>

      {/* Current Active Block */}
      {currentBlock && (
        <div className="current-block-section">
          <h2>Bloque Activo</h2>
          <div className="block-card current">
            <div className="block-header">
              <h3>{currentBlock.name}</h3>
              <span className={`status-badge ${getStatusColor(currentBlock.status)}`}>
                {getStatusText(currentBlock.status)}
              </span>
            </div>
            <div className="block-details">
              <div className="detail-row">
                <span className="detail-label">Semana Actual:</span>
                <span className="detail-value">{currentBlock.current_week} / {currentBlock.total_weeks}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duración:</span>
                <span className="detail-value">{currentBlock.duration} semanas</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estrategia:</span>
                <span className="detail-value">{currentBlock.strategy}</span>
              </div>
            </div>
            <div className="block-actions">
              <Link to={`/blocks/${currentBlock.id}`} className="btn-secondary">
                Ver Detalles
              </Link>
              <Link to={`/blocks/${currentBlock.id}/progress`} className="btn-accent">
                Progreso
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* All Blocks */}
      <div className="all-blocks-section">
        <h2>Todos los Bloques</h2>
        {blocks.length === 0 ? (
          <div className="empty-state">
            <p>No hay bloques de entrenamiento creados.</p>
            <button 
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Crear Primer Bloque
            </button>
          </div>
        ) : (
          <div className="blocks-grid">
            {blocks.map((block) => (
              <div key={block.id} className="block-card">
                <div className="block-header">
                  <h3>{block.name}</h3>
                  <span className={`status-badge ${getStatusColor(block.status)}`}>
                    {getStatusText(block.status)}
                  </span>
                </div>
                <div className="block-details">
                  <div className="detail-row">
                    <span className="detail-label">Semana:</span>
                    <span className="detail-value">{block.current_week} / {block.total_weeks}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duración:</span>
                    <span className="detail-value">{block.duration} semanas</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Estrategia:</span>
                    <span className="detail-value">{block.strategy}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Creado:</span>
                    <span className="detail-value">
                      {new Date(block.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="block-actions">
                  <Link to={`/blocks/${block.id}`} className="btn-secondary">
                    Ver
                  </Link>
                  <Link to={`/blocks/${block.id}/edit`} className="btn-secondary">
                    Editar
                  </Link>
                  <button 
                    className="btn-danger"
                    onClick={() => handleDeleteBlock(block.id)}
                    disabled={isDeletingBlock}
                  >
                    {isDeletingBlock ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Block Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Nuevo Bloque</h2>
              <button 
                className="btn-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Funcionalidad de creación de bloques en desarrollo...</p>
              <p>Por ahora, puedes ver y gestionar los bloques existentes.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlocksPage; 