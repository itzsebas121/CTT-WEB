import React from 'react';

export default function TableLoading({ cols = 4, rows = 5 }) {
  // Retornamos un fragmento para que pueda ser insertado directamente en <tbody>
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`loading-row-${rowIndex}`} className="animate-pulse border-b border-gray-100 last:border-0">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={`loading-cell-${rowIndex}-${colIndex}`} className="px-6 py-4 whitespace-nowrap">
              <div
                className="h-4 bg-gray-100 rounded shimmer-wrapper relative overflow-hidden"
                style={{ width: `${Math.floor(Math.random() * (90 - 40 + 1)) + 40}%` }}
              ></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
