import React from 'react';

// Material Symbols Outlined helper.
// <Icon name="map" /> or <Icon name="map" fill className="text-primary text-2xl" />
export default function Icon({ name, fill = false, className = '', style }) {
  return (
    <span
      className={`material-symbols-outlined${fill ? ' fill' : ''} ${className}`}
      style={style}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
