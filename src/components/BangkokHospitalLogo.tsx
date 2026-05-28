import React from 'react';

interface BangkokHospitalLogoProps {
  className?: string;
}

export const BangkokHospitalLogo: React.FC<BangkokHospitalLogoProps> = ({ className = "h-12" }) => (
  <div className={`flex items-center justify-center ${className}`} id="bph-logo-container">
    <img 
      src="https://static.bangkokhospital.com/uploads/2025/08/pattaya.svg" 
      alt="Bangkok Hospital Pattaya Logo" 
      className="max-h-full w-auto object-contain select-none"
      referrerPolicy="no-referrer"
    />
  </div>
);
