import React, { useState } from 'react';

interface ChartData {
  label: string;
  value: number;
  qty?: number;
}

interface CustomChartProps {
  data: ChartData[];
  title: string;
}

export default function CustomChart({ data, title }: CustomChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value), 100000) : 100000;
  const chartHeight = 200;
  const paddingBottom = 30;
  const paddingTop = 10;
  const barWidth = 32;
  const barGap = 16;
  
  // Calculate rendering coords
  const totalWidth = data.length * (barWidth + barGap) + 40;

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-slate-300 text-sm tracking-wide uppercase">{title}</h4>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono font-medium">
          Real-time
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 pb-2">
        <div className="relative min-w-[320px]" style={{ height: `${chartHeight + 40}px` }}>
          {/* Y-Axis Guidlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const h = chartHeight - ratio * (chartHeight - paddingTop - paddingBottom);
            return (
              <div
                key={idx}
                className="absolute w-full border-t border-slate-800/80 flex justify-between items-center pointer-events-none"
                style={{ top: `${h}px` }}
              >
                <span className="text-[9px] font-mono text-slate-500 -mt-2 bg-slate-900 pr-1 select-none">
                  {formatRupiah(Math.round(maxValue * ratio))}
                </span>
              </div>
            );
          })}

          {/* Bars Graphic inside relative svg frame */}
          <div className="absolute inset-0 flex items-end justify-around px-8 pt-6 pb-8 h-full">
            {data.map((item, index) => {
              const percentage = item.value / maxValue;
              const barHeight = Math.max(percentage * (chartHeight - 40), 10);

              return (
                <div
                  key={index}
                  className="relative flex flex-col items-center group cursor-pointer"
                  style={{ width: `${barWidth}px` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip on Hover */}
                  {hoveredIndex === index && (
                    <div className="absolute bottom-full mb-2 bg-slate-950 border border-teal-500/30 text-white text-[11px] rounded-lg p-2 shadow-2xl z-20 pointer-events-none text-left w-28 -translate-x-1/2 left-1/2">
                      <p className="font-semibold text-teal-400">{item.label}</p>
                      <p className="font-mono text-slate-200 mt-0.5">{formatRupiah(item.value)}</p>
                      {item.qty !== undefined && (
                        <p className="text-slate-400 text-[10px] mt-0.5">{item.qty} Pcs diproduksi</p>
                      )}
                    </div>
                  )}

                  {/* Colored Bar */}
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 relative overflow-hidden ${
                      hoveredIndex === index
                        ? 'bg-gradient-to-t from-teal-600 to-emerald-400 shadow-lg shadow-teal-500/20 scale-x-105'
                        : 'bg-gradient-to-t from-slate-700 to-teal-500'
                    }`}
                    style={{ height: `${barHeight}px` }}
                  >
                    {/* Shiny overlay highlight */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-md" />
                  </div>

                  {/* Horizontal Label */}
                  <span className="absolute top-full mt-1.5 text-[10px] font-mono text-slate-400 truncate max-w-full text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end space-x-4 text-xs font-mono text-slate-400">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded bg-teal-500 mr-2 inline-block"></span>
          <span>Omzet Penjualan</span>
        </div>
      </div>
    </div>
  );
}
