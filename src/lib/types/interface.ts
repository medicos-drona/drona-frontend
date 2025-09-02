
export type ChartDataPoint = {
    month: string;
    [key: string]: number | string;
  };
  
  export type TabOption = {
    value: string;
    label: string;
  };
  
  export interface CollegeChartProps {
    title?: string;
    subtitle?: string;
    data?: ChartDataPoint[];
    lines?: {
      key: string;
      name: string;
      color: string;
      gradientId: string;
      startColor: string;
      endColor: string;
    }[];
    xAxisKey?: string;
    yAxisDomain?: [number, number];
    yAxisTicks?: number[];
    showTabs?: boolean;
    tabOptions?: TabOption[];
    defaultTabValue?: string;
    showDateRange?: boolean;
    dateRangeLabel?: string;
  }

  export interface UsageChartProps {
    title?: string;
    data?: ChartDataPoint[];
    dataKey?: string;
    xAxisKey?: string;
    yAxisDomain?: [number, number];
    yAxisTicks?: number[];
    barSize?: number;
    barGap?: number;
    maxBarSize?: number;
    highlightIndex?: number;
    highlightColor?: string;
    defaultBarColor?: string;
    showMoreButton?: boolean;
  }

  export interface College {
    _id: string;
    name: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  export interface CurrentUser {
    _id: string;
    email: string;
    displayName: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    lastLogin: string;
    college: College;
  }