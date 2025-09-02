"use client"
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChartDataPoint, CollegeChartProps } from "@/lib/types/interface";
import { getCollegeGrowth, CollegeGrowthResponse } from "@/lib/api/analytics";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p 
            key={`item-${index}`} 
            className="text-sm" 
            style={{ color: entry.color }}
          >
            <span className="font-medium">{entry.name}: </span>
            {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const CollegeChart: React.FC<CollegeChartProps> = ({
  title = "Total Colleges",
  subtitle = "Target you've set for each month",
  data,
  lines = [
    {
      key: "target",
      name: "Target",
      color: "#4F46E5",
      gradientId: "colorTarget",
      startColor: "#4F46E5",
      endColor: "#4F46E5"
    },
    {
      key: "actual",
      name: "Actual",
      color: "#60A5FA",
      gradientId: "colorActual",
      startColor: "#60A5FA",
      endColor: "#60A5FA"
    }
  ],
  xAxisKey = "month",
  yAxisDomain = [0, 1000],
  yAxisTicks = [0, 200, 400, 600, 800, 1000],
  showTabs = true,
  tabOptions = [
    { value: "overview", label: "Overview" },
    { value: "sales", label: "Sales" },
    { value: "revenue", label: "Revenue" }
  ],
  defaultTabValue = "overview",
  showDateRange = true,
  dateRangeLabel = "05 Feb - 06 March"
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(defaultTabValue);

  // Fetch college growth data from API
  useEffect(() => {
    const fetchCollegeGrowth = async () => {
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
        const result = await getCollegeGrowth(currentYear, undefined, undefined, activeTab);

        // Transform API data to chart format
        const transformedData = result.data.map(item => ({
          month: item.monthName,
          target: item.monthlyTarget,
          actual: item.cumulativeColleges,
          collegesAdded: item.collegesAdded,
          targetAchievement: item.targetAchievement,
          revenue: item.revenue
        }));

        setChartData(transformedData);
      } catch (err) {
        console.error("Error fetching college growth:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch college growth data");
        // Use generated data as fallback
        setChartData(generateData());
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeGrowth();
  }, [data, activeTab]);
  
  function generateData(): ChartDataPoint[] {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    // Base values for two lines
    const targetBase = 720;
    const actualBase = 480;
    
    // Generate data with realistic variations
    return monthNames.map((month, index) => {
      // Create slightly curvy pattern with some ups and downs
      const targetOffset = Math.sin(index * 0.5) * 30 + (index * 10);
      const actualOffset = Math.sin((index + 1) * 0.7) * 20 + (index * 12);
      
      return {
        month,
        target: Math.round(targetBase + targetOffset + (index * 5)), // Higher line
        actual: Math.round(actualBase + actualOffset + (index * 6)), // Lower line
      };
    });
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 pt-6 px-6 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4">
          {showTabs && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100/80">
                {tabOptions.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          {showDateRange && (
            <Button variant="outline" className="gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline-block text-sm font-normal">{dateRangeLabel}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6">
        <div className="h-[350px] w-full mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p>Failed to load chart data</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                {lines.map((line) => (
                  <linearGradient key={line.gradientId} id={line.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={line.startColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={line.endColor} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
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
                domain={yAxisDomain}
                ticks={yAxisTicks}
              />
              <Tooltip content={<CustomTooltip />} />
              {lines.map((line) => (
                <Area 
                  key={line.key}
                  type="monotone" 
                  dataKey={line.key} 
                  name={line.name}
                  stroke={line.color} 
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#${line.gradientId})`} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CollegeChart;
