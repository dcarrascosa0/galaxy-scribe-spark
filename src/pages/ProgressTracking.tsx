import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Brain, 
  Clock, 
  Star,
  Trophy,
  Zap,
  Users,
  Eye,
  BookOpen,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface XPDataPoint {
    date: string;
    xp: number;
    galaxies: number;
}

interface CategoryDataPoint {
    name: string;
    value: number;
    color: string;
}

interface StudyTimeDataPoint {
    day: string;
    time: number;
    sessions: number;
}

interface AchievementStatus {
    id: number;
    name: string;
    desc: string;
    unlocked: boolean;
    date?: string;
    progress?: number;
}

interface GoalStatus {
    goal: string;
    current: number;
    target: number;
    icon: string;
}

interface MappedGoalStatus extends Omit<GoalStatus, 'icon'> {
    icon: React.ComponentType<{ className?: string }>;
}

interface RecentActivityItem {
    action: string;
    item: string;
    time: string;
    xp: number;
}

interface ProgressTrackingData {
    xpData: XPDataPoint[];
    categoryData: CategoryDataPoint[];
    studyTimeData: StudyTimeDataPoint[];
    achievements: AchievementStatus[];
    weeklyGoals: GoalStatus[];
    recentActivity: RecentActivityItem[];
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    Brain,
    Clock,
    Star,
    Trophy,
};

const ProgressTracking: React.FC = () => {
  const [progressData, setProgressData] = useState<(Omit<ProgressTrackingData, 'weeklyGoals'> & { weeklyGoals: MappedGoalStatus[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const response = await fetch('/api/user/progress');
        if (!response.ok) {
          throw new Error('Failed to fetch progress data');
        }
        const data: ProgressTrackingData = await response.json();
        
        // Map icon strings to actual components
        const mappedGoals: MappedGoalStatus[] = data.weeklyGoals.map(goal => ({
          ...goal,
          icon: iconMap[goal.icon] || Target,
        }));

        setProgressData({ ...data, weeklyGoals: mappedGoals });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (!progressData) {
    return null;
  }

  const {
    xpData,
    categoryData,
    studyTimeData,
    achievements,
    weeklyGoals,
    recentActivity,
  } = progressData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative">
      <Link to="/" className="absolute top-6 left-6 z-10">
        <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Galaxy
        </Button>
      </Link>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white">Progress Tracking</h1>
          <p className="text-purple-200 text-lg">Monitor your learning journey and achievements</p>
        </motion.div>

        {/* Weekly Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Weekly Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {weeklyGoals.map((goal, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <goal.icon className="h-4 w-4 text-purple-300" />
                      <span className="text-sm font-medium">{goal.goal}</span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>{goal.current}/{goal.target}</span>
                      <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* XP Progress Chart */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  XP Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={xpData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="#8b5cf6" 
                      fill="url(#colorXp)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Study Time Chart */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Study Time (Minutes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studyTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="time" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Galaxy Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">{category.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity & Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{activity.action}</div>
                        <div className="text-xs text-gray-300">{activity.item}</div>
                        <div className="text-xs text-gray-400">{activity.time}</div>
                      </div>
                      <Badge className="bg-yellow-500 text-black">
                        +{activity.xp} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        achievement.unlocked ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.name}</div>
                        <div className="text-xs text-gray-300">{achievement.desc}</div>
                        {achievement.unlocked && (
                          <div className="text-xs text-green-400">Unlocked {achievement.date}</div>
                        )}
                        {!achievement.unlocked && achievement.progress && (
                          <div className="mt-2">
                            <Progress value={(achievement.progress / 30) * 100} className="h-1" />
                            <div className="text-xs text-gray-400 mt-1">
                              {achievement.progress}/30 progress
                            </div>
                          </div>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <Trophy className="h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressTracking;
