
import React, { useState } from 'react';
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
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProgressTracking: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const xpData = [
    { date: '2024-01-01', xp: 100, galaxies: 1 },
    { date: '2024-01-02', xp: 250, galaxies: 2 },
    { date: '2024-01-03', xp: 400, galaxies: 3 },
    { date: '2024-01-04', xp: 600, galaxies: 4 },
    { date: '2024-01-05', xp: 850, galaxies: 6 },
    { date: '2024-01-06', xp: 1100, galaxies: 8 },
    { date: '2024-01-07', xp: 1350, galaxies: 10 },
  ];

  const categoryData = [
    { name: 'Technology', value: 35, color: '#10b981' },
    { name: 'Science', value: 25, color: '#3b82f6' },
    { name: 'Philosophy', value: 20, color: '#8b5cf6' },
    { name: 'Business', value: 15, color: '#f59e0b' },
    { name: 'Personal', value: 5, color: '#ec4899' },
  ];

  const studyTimeData = [
    { day: 'Mon', time: 45, sessions: 3 },
    { day: 'Tue', time: 60, sessions: 4 },
    { day: 'Wed', time: 30, sessions: 2 },
    { day: 'Thu', time: 75, sessions: 5 },
    { day: 'Fri', time: 90, sessions: 6 },
    { day: 'Sat', time: 120, sessions: 8 },
    { day: 'Sun', time: 85, sessions: 5 },
  ];

  const achievements = [
    { id: 1, name: 'First Galaxy', desc: 'Create your first knowledge galaxy', unlocked: true, date: '2024-01-01' },
    { id: 2, name: 'Deep Thinker', desc: 'Reach depth level 5', unlocked: true, date: '2024-01-05' },
    { id: 3, name: 'Knowledge Collector', desc: 'Create 10 galaxies', unlocked: true, date: '2024-01-10' },
    { id: 4, name: 'Time Master', desc: 'Study for 10 hours', unlocked: true, date: '2024-01-15' },
    { id: 5, name: 'Galaxy Master', desc: 'Create 25 galaxies', unlocked: false, progress: 20 },
    { id: 6, name: 'Streak Warrior', desc: '30 day streak', unlocked: false, progress: 7 },
  ];

  const weeklyGoals = [
    { goal: 'Create 3 new galaxies', current: 2, target: 3, icon: Brain },
    { goal: 'Study for 10 hours', current: 7.5, target: 10, icon: Clock },
    { goal: 'Earn 2000 XP', current: 1650, target: 2000, icon: Star },
    { goal: 'Maintain 7-day streak', current: 5, target: 7, icon: Trophy },
  ];

  const recentActivity = [
    { action: 'Created galaxy', item: 'Machine Learning Fundamentals', time: '2 hours ago', xp: 750 },
    { action: 'Completed goal', item: 'Study for 2 hours', time: '4 hours ago', xp: 200 },
    { action: 'Unlocked achievement', item: 'Deep Thinker', time: '1 day ago', xp: 500 },
    { action: 'Shared galaxy', item: 'Quantum Physics Basics', time: '2 days ago', xp: 100 },
    { action: 'Reached level', item: 'Level 12', time: '3 days ago', xp: 1000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
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
