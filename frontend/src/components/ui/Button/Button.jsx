import './Button.css';
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
      {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </button>;
}