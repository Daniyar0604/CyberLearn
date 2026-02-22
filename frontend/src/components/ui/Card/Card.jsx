import React from 'react';
import './Card.css';
export function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  return <div className={`card card-${variant} ${className}`} {...props}>
      {children}
    </div>;
}