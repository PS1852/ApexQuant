import { useState, useRef, useCallback, useMemo } from 'react';
import { formatCurrency, formatPercentage } from '@/services/stockService';
import type { ChartData } from '@/types';

type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' | 'max';

const TIME_RANGES: { key: TimeRange; label: string; description: string }[] = [
    { key: '1d', label: '1D', description: 'today' },
    { key: '5d', label: '5D', description: 'past 5 days' },
    { key: '1mo', label: '1M', description: 'past month' },
    { key: '3mo', label: '3M', description: 'past 3 months' },
    { key: '6mo', label: '6M', description: 'past 6 months' },
    { key: '1y', label: '1Y', description: 'past year' },
    { key: '5y', label: '5Y', description: 'past 5 years' },
    { key: 'max', label: 'Max', description: 'all time' },
];

interface StockChartProps {
    candles: ChartData[];
    loading: boolean;
    currentPrice?: number;
    prevClose?: number;
    selectedRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
}

export default function StockChart({
    candles,
    loading,
    currentPrice,
    prevClose,
    selectedRange,
    onRangeChange,
}: StockChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    const rangeInfo = useMemo(
        () => TIME_RANGES.find((r) => r.key === selectedRange) || TIME_RANGES[2],
        [selectedRange]
    );

    // Compute chart metrics
    const chartMetrics = useMemo(() => {
        if (!candles || candles.length === 0) return null;

        const closes = candles.map((c) => c.close);
        const minPrice = Math.min(...closes);
        const maxPrice = Math.max(...closes);
        const priceRange = maxPrice - minPrice || 1;

        const firstClose = closes[0];
        const lastClose = closes[closes.length - 1];
        const startPrice = selectedRange === '1d' && prevClose ? prevClose : firstClose;
        const totalChange = lastClose - startPrice;
        const totalChangePct = startPrice > 0 ? (totalChange / startPrice) * 100 : 0;
        const isPositive = totalChange >= 0;

        return {
            closes,
            minPrice,
            maxPrice,
            priceRange,
            firstClose,
            lastClose,
            startPrice,
            totalChange,
            totalChangePct,
            isPositive,
        };
    }, [candles, selectedRange, prevClose]);

    // Chart dimensions
    const width = 800;
    const height = 320;
    const paddingTop = 20;
    const paddingBottom = 30;
    const paddingLeft = 0;
    const paddingRight = 0;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Build SVG path
    const pathData = useMemo(() => {
        if (!chartMetrics || candles.length === 0) return { linePath: '', areaPath: '' };

        const { closes, minPrice, priceRange } = chartMetrics;
        const points = closes.map((close, i) => {
            const x = paddingLeft + (i / (closes.length - 1)) * chartWidth;
            const y = paddingTop + chartHeight - ((close - minPrice) / priceRange) * chartHeight;
            return { x, y };
        });

        const linePath = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
            .join(' ');

        const areaPath =
            linePath +
            ` L ${points[points.length - 1].x.toFixed(2)} ${(paddingTop + chartHeight).toFixed(2)}` +
            ` L ${points[0].x.toFixed(2)} ${(paddingTop + chartHeight).toFixed(2)} Z`;

        return { linePath, areaPath, points };
    }, [chartMetrics, candles, chartWidth, chartHeight, paddingLeft, paddingTop]);

    // Previous close line position
    const prevCloseLine = useMemo(() => {
        if (
            !chartMetrics ||
            selectedRange !== '1d' ||
            !prevClose ||
            candles.length === 0
        )
            return null;

        const { minPrice, priceRange } = chartMetrics;
        const y = paddingTop + chartHeight - ((prevClose - minPrice) / priceRange) * chartHeight;
        return y;
    }, [chartMetrics, selectedRange, prevClose, candles, chartHeight, paddingTop]);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (!svgRef.current || !candles.length || !pathData.points) return;

            const rect = svgRef.current.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const mouseY = ((e.clientY - rect.top) / rect.height) * height;

            // Find nearest candle index
            const step = chartWidth / (candles.length - 1);
            const idx = Math.min(
                Math.max(Math.round((mouseX - paddingLeft) / step), 0),
                candles.length - 1
            );

            setHoverIndex(idx);
            setMousePos({ x: mouseX, y: mouseY });
        },
        [candles, pathData, width, height, chartWidth, paddingLeft]
    );

    const handleMouseLeave = useCallback(() => {
        setHoverIndex(null);
        setMousePos(null);
    }, []);

    // Hover data
    const hoverCandle = hoverIndex !== null ? candles[hoverIndex] : null;
    const hoverPoint =
        hoverIndex !== null && pathData.points
            ? (pathData.points as any)[hoverIndex]
            : null;

    const displayPrice = hoverCandle?.close ?? currentPrice ?? chartMetrics?.lastClose;
    const displayChange =
        hoverCandle && chartMetrics
            ? hoverCandle.close - chartMetrics.startPrice
            : chartMetrics?.totalChange;
    const displayChangePct =
        hoverCandle && chartMetrics && chartMetrics.startPrice > 0
            ? ((hoverCandle.close - chartMetrics.startPrice) / chartMetrics.startPrice) * 100
            : chartMetrics?.totalChangePct;

    const color = chartMetrics?.isPositive ? '#34a853' : '#ea4335';

    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="h-80 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-500 text-sm">Loading chart data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!candles.length) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="h-80 flex items-center justify-center">
                    <span className="text-slate-500">No chart data available</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {/* Price Header */}
            <div className="mb-4">
                {displayPrice !== undefined && (
                    <p className="text-3xl font-bold text-white tracking-tight">
                        {formatCurrency(displayPrice)}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                    {displayChange !== undefined && displayChangePct !== undefined && (
                        <span
                            style={{ color }}
                            className="text-sm font-medium"
                        >
                            {displayChange >= 0 ? '+' : ''}
                            {formatCurrency(displayChange)} ({formatPercentage(displayChangePct)})
                        </span>
                    )}
                    <span className="text-slate-500 text-sm">
                        {hoverCandle ? hoverCandle.time : rangeInfo.description}
                    </span>
                </div>
            </div>

            {/* SVG Chart */}
            <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full cursor-crosshair"
                    preserveAspectRatio="none"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Gradient Fill */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area */}
                    <path d={pathData.areaPath} fill="url(#chartGradient)" />

                    {/* Line */}
                    <path
                        d={pathData.linePath}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Previous Close Line (1D only) */}
                    {prevCloseLine !== null && (
                        <line
                            x1={paddingLeft}
                            x2={width - paddingRight}
                            y1={prevCloseLine}
                            y2={prevCloseLine}
                            stroke="#5f6368"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    {/* End Dot */}
                    {pathData.points && (pathData.points as any).length > 0 && (
                        <>
                            <circle
                                cx={(pathData.points as any)[(pathData.points as any).length - 1].x}
                                cy={(pathData.points as any)[(pathData.points as any).length - 1].y}
                                r="4"
                                fill={color}
                                vectorEffect="non-scaling-stroke"
                            />
                            <circle
                                cx={(pathData.points as any)[(pathData.points as any).length - 1].x}
                                cy={(pathData.points as any)[(pathData.points as any).length - 1].y}
                                r="8"
                                fill={color}
                                opacity="0.2"
                                vectorEffect="non-scaling-stroke"
                            />
                        </>
                    )}

                    {/* Crosshair */}
                    {hoverPoint && mousePos && (
                        <>
                            {/* Vertical line */}
                            <line
                                x1={hoverPoint.x}
                                x2={hoverPoint.x}
                                y1={paddingTop}
                                y2={paddingTop + chartHeight}
                                stroke="#5f6368"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Hover dot */}
                            <circle
                                cx={hoverPoint.x}
                                cy={hoverPoint.y}
                                r="5"
                                fill={color}
                                stroke="white"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                            />
                        </>
                    )}
                </svg>

                {/* Tooltip */}
                {hoverCandle && hoverPoint && (
                    <div
                        className="absolute pointer-events-none bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl z-10"
                        style={{
                            left: `${Math.min(Math.max((hoverPoint.x / width) * 100, 10), 85)}%`,
                            top: `${Math.max((hoverPoint.y / height) * 100 - 15, 2)}%`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="text-white font-medium">{formatCurrency(hoverCandle.close)}</div>
                        <div className="text-slate-400 mt-0.5">
                            O: {formatCurrency(hoverCandle.open)} H: {formatCurrency(hoverCandle.high)}
                        </div>
                        <div className="text-slate-400">
                            L: {formatCurrency(hoverCandle.low)} V: {hoverCandle.volume?.toLocaleString()}
                        </div>
                        <div className="text-slate-500 mt-0.5">{hoverCandle.time}</div>
                    </div>
                )}
            </div>

            {/* Time Range Buttons */}
            <div className="flex gap-1 mt-4 flex-wrap">
                {TIME_RANGES.map((range) => (
                    <button
                        key={range.key}
                        onClick={() => onRangeChange(range.key)}
                        className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${selectedRange === range.key
                                ? `text-white`
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }
            `}
                        style={
                            selectedRange === range.key
                                ? { backgroundColor: color + '20', color }
                                : undefined
                        }
                    >
                        {range.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
