import React from 'react';

export default function StaffCard({ staf, isSelected, onSelect }) {
  return (
    <div 
      onClick={() => onSelect(staf)}
      className={`cursor-pointer bg-white rounded-xl p-4 border transition flex items-center gap-4 ${
        isSelected 
          ? 'border-pink-500 ring-2 ring-pink-200 bg-pink-50/30' 
          : 'border-gray-100 hover:border-gray-300'
      }`}
    >
      <img 
        src={staf.foto_url} 
        alt={staf.nama} 
        className="w-14 h-14 rounded-full object-cover border-2 border-pink-100"
      />
      <div>
        <h4 className="font-semibold text-gray-800">{staf.nama}</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {staf.keahlian.join(', ')}
        </p>
      </div>
    </div>
  );
}