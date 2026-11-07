import React from 'react';

export default function TableLoading({ cols = 4, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`loading-row-${rowIndex}`} className="animate-pulse border-b border-white/[0.04] last:border-0">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={`loading-cell-${rowIndex}-${colIndex}`} className="px-4 py-3.5 whitespace-nowrap">
              <div
                className="h-4 bg-white/[0.06] rounded-md"
                style={{ width: `${Math.floor(Math.random() * (90 - 40 + 1)) + 40}%` }}
              ></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
