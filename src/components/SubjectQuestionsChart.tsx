"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getQuestionPaperStatsByDateRange } from "@/lib/api/college";

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface SubjectColor {
  subject: string;
  color: string;
}

export interface SubjectQuestionsChartProps {
  title: string;
  collegeId: string;
  subjectColors: SubjectColor[];
  timeRanges?: string[];
  defaultTimeRange?: string;
  className?: string;
}

const SubjectQuestionsChart = ({
  title,
  collegeId,
  subjectColors,
  timeRanges = ["Daily", "Weekly", "Monthly", "Yearly"],
  defaultTimeRange = "Monthly",
  className,
}: SubjectQuestionsChartProps) => {
  const [timeRange, setTimeRange] = useState(defaultTimeRange);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const chartConfig = subjectColors.reduce((config, { subject, color }) => {
    return {
      ...config,
      [subject]: { color },
    };
  }, {} as Record<string, { color: string }>);

  const formatYAxisTick = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const getDateRange = (range: string): { startDate: string; endDate: string } => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (range) {
      case "Daily":
        start.setDate(now.getDate() - 7); // last 7 days
        break;
      case "Weekly":
        start.setDate(now.getDate() - 30); // last 4 weeks
        break;
      case "Monthly":
        start.setMonth(now.getMonth() - 6); // last 6 months
        break;
      case "Yearly":
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 6);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  const fetchChartData = async () => {
    if (!collegeId) return;
  
    const { startDate, endDate } = getDateRange(timeRange);
    setLoading(true);
    try {
      const rawData = await getQuestionPaperStatsByDateRange(
        collegeId,
        startDate,
        endDate
      );
  
      if (!Array.isArray(rawData)) {
        console.warn("API did not return an array. Got:", rawData);
        setChartData([]);
        return;
      }
  
      const formattedData: ChartDataPoint[] = rawData.map((entry: any) => ({
        name: entry.dateLabel,
        ...entry.subjectCounts,
      }));
  
      setChartData(formattedData);
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchChartData();
  }, [collegeId, timeRange]);

  return (
    <Card className={`p-4 h-full ${className || ""}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <Select value={timeRange} onValueChange={(val) => setTimeRange(val)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={timeRange} />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 mb-2">
        <div className="flex flex-wrap gap-4">
          {subjectColors.map(({ subject, color }) => (
            <div key={subject} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-sm text-muted-foreground">{subject}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[calc(100%-80px)] min-h-[250px] w-full">
        <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="98%" height="100%">
  <BarChart
    data={chartData.length ? chartData : [{ name: "No Data" }]}
    margin={{ top: 5, right: 10, left: 10, bottom: 20 }}
    barGap={4}
    layout="horizontal"
  >
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis
      dataKey="name"
      axisLine={false}
      tickLine={false}
      tick={{ fontSize: 10 }}
      dy={8}
      height={20}
    />
    <YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fontSize: 10 }}
      domain={[0, "dataMax"]}
      width={40}
      tickFormatter={formatYAxisTick}
      padding={{ top: 10 }}
    />
    <Tooltip
      content={(props) =>
        props.active && props.payload && props.payload.length ? (
          <ChartTooltipContent indicator="line" payload={props.payload} />
        ) : null
      }
      cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
    />
    {subjectColors.map(({ subject, color }) => (
      <Bar
        key={subject}
        dataKey={subject}
        fill={color}
        radius={[2, 2, 0, 0]}
        maxBarSize={25}
      />
    ))}
  </BarChart>
</ResponsiveContainer>

        </ChartContainer>
      </div>
    </Card>
  );
};

export default SubjectQuestionsChart;
