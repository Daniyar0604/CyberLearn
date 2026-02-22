import { AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  danger = false,
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal confirm-modal ${danger ? 'danger' : ''}`}>
        <div className="confirm-header">
          <AlertTriangle size={22} />
          <h2>{title}</h2>
        </div>

        <p className="confirm-desc">{description}</p>

        <div className="modal-actions">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className={`btn-save ${danger ? 'danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Выполняю...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
