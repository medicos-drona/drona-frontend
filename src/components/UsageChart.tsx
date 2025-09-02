"use client"
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartDataPoint } from "@/lib/types/interface";
import { UsageChartProps } from "@/lib/types/interface";
import { getUsageTrends, UsageTrendsResponse } from "@/lib/api/analytics";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
        <p className="text-sm font-medium">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const UsageChart: React.FC<UsageChartProps> = ({
  title = "Usage trends",
  data,
  dataKey = "totalUsage",
  xAxisKey = "monthName",
  yAxisDomain,
  yAxisTicks,
  barSize = 20,
  barGap = 2,
  maxBarSize = 20,
  highlightIndex,
  highlightColor = "#4F46E5",
  defaultBarColor = "#F3F4F6",
  showMoreButton = true,
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch usage trends data from API
  useEffect(() => {
    const fetchUsageTrends = async () => {
      if (data) {
        // If data is provided as prop, use it instead of fetching
        setChartData(data);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get current year for default query
        const currentYear = new Date().getFullYear().toString();
        
        // Fetch data using the API function
        const result = await getUsageTrends(currentYear);
        
        // Transform API data to chart format
        const transformedData = result.data.map(item => ({
          month: item.monthName,
          [dataKey]: item[dataKey as keyof typeof item] || item.totalUsage,
          questionsCreated: item.questionsCreated,
          papersGenerated: item.papersGenerated
        }));
        
        setChartData(transformedData);
        
        // Calculate yAxisDomain and yAxisTicks if not provided
        if (!yAxisDomain || !yAxisTicks) {
          const maxValue = Math.max(...transformedData.map(item => item[dataKey] as number));
          const roundedMax = Math.ceil(maxValue / 200) * 200;
          
          // Only update if props weren't provided
          if (!yAxisDomain) {
            yAxisDomain = [0, roundedMax];
          }
          
          if (!yAxisTicks) {
            const tickCount = 5;
            const tickInterval = roundedMax / (tickCount - 1);
            yAxisTicks = Array.from({ length: tickCount }, (_, i) => i * tickInterval);
          }
        }
      } catch (err) {
        console.error("Error fetching usage trends:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch usage data");
        // Use generated data as fallback
        setChartData(generateData());
      } finally {
        setLoading(false);
      }
    };

    fetchUsageTrends();
  }, [data, dataKey]);
  
  function generateData(): ChartDataPoint[] {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // This approximates the data from the image
    const values = [450, 750, 380, 620, 350, 680, 500, 650, 580, 600, 400, 520];
    
    return monthNames.map((month, index) => {
      const dataPoint: ChartDataPoint = { month };
      dataPoint[dataKey] = values[index];
      return dataPoint;
    });
  }

  // Use calculated or provided domain and ticks
  const finalYAxisDomain = yAxisDomain || [0, 800];
  const finalYAxisTicks = yAxisTicks || [0, 200, 400, 600, 800];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-0 pt-4 px-4">
        <CardTitle className="text-base font-medium text-gray-800">{title}</CardTitle>
        {showMoreButton && (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-5 w-5 text-gray-400" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[200px] w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teacher-blue"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p>Failed to load chart data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                barSize={barSize}
                barGap={barGap}
                maxBarSize={maxBarSize}
              >
                <CartesianGrid vertical={false} horizontal={true} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={xAxisKey} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickCount={finalYAxisTicks.length}
                  domain={finalYAxisDomain}
                  ticks={finalYAxisTicks}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar 
                  dataKey={dataKey} 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={highlightIndex !== undefined ? 
                            (index === highlightIndex ? highlightColor : defaultBarColor) : 
                            highlightColor} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageChart;
