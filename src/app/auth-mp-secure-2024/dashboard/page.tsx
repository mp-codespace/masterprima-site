// File path: src/app/auth-mp-secure-2024/dashboard/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  // FileText, 
  // Users, 
  Activity,
  // CheckCircle,
  // Clock
} from 'lucide-react';
import StatusChart from './components/StatusChart';

function timeAgo(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

// interface DashboardStats {
//   publishedArticles: number;
//   draftArticles: number;
//   totalTeamMembers: number;
// }
interface ActivityLog {
  id: string;
  details: string;
  timestamp: string;
}
interface ChartDataItem {
    name: string;
    value: number;
    fill: string;
}
// interface SummaryCardProps {
//   icon: ElementType;
//   title: string;
//   value: string | number;
//   colorClass: string;
// }

// const SummaryCard = ({ icon: Icon, title, value, colorClass }: SummaryCardProps) => (
//   <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4">
//     <div className={`w-10 h-10 ${colorClass} bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
//       <Icon className={`${colorClass} w-5 h-5`} />
//     </div>
//     <div>
//       <p className="text-2xl font-bold font-urbanist text-neutral-charcoal">{value}</p>
//       <p className="text-sm text-neutral-dark-gray">{title}</p>
//     </div>
//   </div>
// );


export default function DashboardPage() {
  // const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
        const [statsRes, activityRes, chartRes] = await Promise.all([
            fetch('/api/auth-mp-secure-2024/stats'),
            fetch('/api/auth-mp-secure-2024/activity'),
            fetch('/api/auth-mp-secure-2024/chart-data')
        ]);
        
        if (!statsRes.ok || !activityRes.ok || !chartRes.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        
        // const statsData = await statsRes.json();
        const activityData = await activityRes.json();
        const chartData = await chartRes.json();

        // setStats(statsData);
        setActivity(activityData);
        setChartData(chartData);

    } catch (error) {
        console.error(error);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
    }
    loadInitialData();
    
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'articles' },
        (payload) => {
          console.log('Article change detected, re-fetching data...', payload);
          fetchData(); 
        }
      )
       .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_activity_log' },
        (payload) => {
          console.log('New activity detected, re-fetching activity...', payload);
          fetch('/api/auth-mp-secure-2024/activity').then(res => res.json()).then(setActivity);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };

  }, [fetchData]); 

  // const summaryCards = stats ? [
  //   { icon: CheckCircle, title: 'Published Articles', value: stats.publishedArticles, colorClass: 'text-green-600' },
  //   { icon: FileText, title: 'Draft Articles', value: stats.draftArticles, colorClass: 'text-blue-600' },
  //   { icon: Users, title: 'Team Members', value: stats.totalTeamMembers, colorClass: 'text-purple-600' },
  // ] : [];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-9 bg-gray-200 rounded-lg w-1/3 mb-10"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-80 bg-gray-200 rounded-xl"></div>
            <div className="lg:col-span-2 h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-urbanist text-neutral-charcoal">Project Overview</h1>
        <p className="text-neutral-dark-gray mt-1">A summary of your website content and activity.</p>
      </div>
      
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => <SummaryCard key={i} {...card} />)}
      </div> */}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold font-urbanist text-neutral-charcoal mb-4">Status Overview</h2>
            <StatusChart data={chartData} />
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-xl font-bold font-urbanist text-neutral-charcoal mb-4">Recent Activity</h2>
          <div className="space-y-1">
              {activity.length > 0 ? (
                  activity.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 -mx-3 rounded-lg hover:bg-gray-50/50">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Activity className="w-5 h-5 text-gray-500" />
                          </div>
                          <p className="text-sm text-neutral-charcoal flex-1">{item.details}</p>
                          <p className="text-xs text-neutral-dark-gray flex-shrink-0">{timeAgo(item.timestamp)}</p>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-12 text-sm text-gray-500">
                      No recent activity to display.
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
