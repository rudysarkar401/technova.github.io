import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { 
  Users, 
  MousePointer, 
  ShoppingCart, 
  CreditCard,
  Eye,
  TrendingUp,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DailyInteraction {
  date: string;
  views: number;
  cart_adds: number;
  purchases: number;
  total: number;
}

interface InteractionTypeTrend {
  date: string;
  view: number;
  cart_add: number;
  purchase: number;
}

interface AnalyticsData {
  total_users: number;
  total_interactions: number;
  total_views: number;
  total_cart_adds: number;
  total_purchases: number;
  popular_categories: Array<{ category: string; count: number }>;
  recent_interactions: Array<{
    user_id: string;
    product_id: number;
    interaction_type: string;
    category: string;
    created_at: string;
  }>;
  daily_interactions: DailyInteraction[];
  interaction_types_trend: InteractionTypeTrend[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const AdminAnalytics = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
      return;
    }

    const fetchAnalytics = async () => {
      if (!isAdmin) return;

      try {
        const { data, error } = await supabase.rpc('get_admin_analytics');

        if (error) {
          console.error('Error fetching analytics:', error);
          return;
        }

        if (data && data.length > 0) {
          setAnalytics({
            ...data[0],
            popular_categories: (data[0].popular_categories as any) || [],
            recent_interactions: (data[0].recent_interactions as any) || [],
            daily_interactions: (data[0].daily_interactions as any) || [],
            interaction_types_trend: (data[0].interaction_types_trend as any) || [],
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Admin Analytics</h1>
          </div>
          <Badge variant="secondary" className="text-lg">Admin Panel</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_interactions || 0}</div>
              <p className="text-xs text-muted-foreground">All activities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Product Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_views || 0}</div>
              <p className="text-xs text-muted-foreground">Total views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cart Additions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_cart_adds || 0}</div>
              <p className="text-xs text-muted-foreground">Items added</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchases</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total_purchases || 0}</div>
              <p className="text-xs text-muted-foreground">Completed orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Interactions Trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>30-Day Activity Trend</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {analytics?.daily_interactions && analytics.daily_interactions.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.daily_interactions}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCartAdds" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                      name="Views"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cart_adds" 
                      stroke="hsl(var(--secondary))" 
                      fillOpacity={1} 
                      fill="url(#colorCartAdds)" 
                      name="Cart Adds"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="purchases" 
                      stroke="hsl(var(--accent))" 
                      fillOpacity={1} 
                      fill="url(#colorPurchases)" 
                      name="Purchases"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Interaction Types Over Time */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>7-Day Interaction Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {analytics?.interaction_types_trend && analytics.interaction_types_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.interaction_types_trend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Legend />
                    <Bar dataKey="view" fill="hsl(var(--primary))" name="Views" />
                    <Bar dataKey="cart_add" fill="hsl(var(--secondary))" name="Cart Adds" />
                    <Bar dataKey="purchase" fill="hsl(var(--accent))" name="Purchases" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Popular Categories</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {analytics?.popular_categories && analytics.popular_categories.length > 0 ? (
                <div className="space-y-4">
                  {analytics.popular_categories.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium capitalize">{cat.category}</span>
                      </div>
                      <Badge variant="secondary">{cat.count} interactions</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Interactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.recent_interactions && analytics.recent_interactions.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {analytics.recent_interactions.slice(0, 20).map((interaction, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            interaction.interaction_type === 'purchase' ? 'default' :
                            interaction.interaction_type === 'cart_add' ? 'secondary' : 
                            'outline'
                          }>
                            {interaction.interaction_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Product #{interaction.product_id}
                          </span>
                        </div>
                        {interaction.category && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {interaction.category}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(interaction.created_at), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No recent interactions</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
