import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Trophy, 
  Target, 
  Zap, 
  Brain, 
  Users, 
  Clock, 
  Award,
  Galaxy,
  Sparkles,
  TrendingUp,
  Calendar,
  Eye,
  Share2,
  Download,
  Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Galaxy {
  id: string;
  title: string;
  description: string;
  nodeCount: number;
  depth: number;
  createdAt: Date;
  lastViewed: Date;
  tags: string[];
  thumbnail: string;
  views: number;
  xpEarned: number;
  category: 'science' | 'technology' | 'philosophy' | 'business' | 'personal';
}

interface UserStats {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  galaxiesCreated: number;
  totalNodes: number;
  totalStudyTime: number;
  achievements: number;
  streak: number;
  rank: string;
}

const UserProfile: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 12,
    currentXP: 2450,
    xpToNextLevel: 3000,
    totalXP: 15650,
    galaxiesCreated: 28,
    totalNodes: 186,
    totalStudyTime: 1247,
    achievements: 15,
    streak: 7,
    rank: 'Knowledge Explorer'
  });

  const [galaxies, setGalaxies] = useState<Galaxy[]>([
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      description: 'A comprehensive exploration of ML concepts, algorithms, and applications',
      nodeCount: 15,
      depth: 4,
      createdAt: new Date('2024-01-15'),
      lastViewed: new Date('2024-01-20'),
      tags: ['AI', 'Technology', 'Data Science'],
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=200&fit=crop',
      views: 245,
      xpEarned: 750,
      category: 'technology'
    },
    {
      id: '2',
      title: 'Philosophy of Mind',
      description: 'Deep dive into consciousness, free will, and the nature of mental states',
      nodeCount: 22,
      depth: 5,
      createdAt: new Date('2024-01-10'),
      lastViewed: new Date('2024-01-18'),
      tags: ['Philosophy', 'Consciousness', 'Mind'],
      thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=200&fit=crop',
      views: 189,
      xpEarned: 920,
      category: 'philosophy'
    },
    {
      id: '3',
      title: 'Quantum Physics Basics',
      description: 'Understanding the strange world of quantum mechanics and its implications',
      nodeCount: 18,
      depth: 3,
      createdAt: new Date('2024-01-05'),
      lastViewed: new Date('2024-01-16'),
      tags: ['Physics', 'Quantum', 'Science'],
      thumbnail: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300&h=200&fit=crop',
      views: 312,
      xpEarned: 680,
      category: 'science'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'science': return 'bg-blue-500';
      case 'technology': return 'bg-green-500';
      case 'philosophy': return 'bg-purple-500';
      case 'business': return 'bg-orange-500';
      case 'personal': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getXPProgress = () => (userStats.currentXP / userStats.xpToNextLevel) * 100;

  const filteredGalaxies = selectedCategory === 'all' 
    ? galaxies 
    : galaxies.filter(g => g.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <Avatar className="w-32 h-32 mx-auto border-4 border-purple-400 shadow-2xl">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                KE
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1">
                Level {userStats.level}
              </Badge>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Knowledge Explorer</h1>
            <p className="text-purple-200 text-lg">{userStats.rank}</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4" />
                Total XP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalXP.toLocaleString()}</div>
              <div className="text-xs text-gray-300 mt-1">+{userStats.currentXP} this level</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Galaxy className="h-4 w-4" />
                Galaxies Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.galaxiesCreated}</div>
              <div className="text-xs text-gray-300 mt-1">{userStats.totalNodes} total nodes</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Study Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(userStats.totalStudyTime / 60)}h {userStats.totalStudyTime % 60}m</div>
              <div className="text-xs text-gray-300 mt-1">{userStats.streak} day streak</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.achievements}</div>
              <div className="text-xs text-gray-300 mt-1">Unlocked</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Level Progress
                </span>
                <span className="text-sm">Level {userStats.level} → {userStats.level + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{userStats.currentXP.toLocaleString()} XP</span>
                <span>{userStats.xpToNextLevel.toLocaleString()} XP</span>
              </div>
              <Progress value={getXPProgress()} className="h-3" />
              <div className="text-center text-sm text-gray-300">
                {userStats.xpToNextLevel - userStats.currentXP} XP to next level
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Galaxies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Galaxy className="h-6 w-6" />
                My Knowledge Galaxies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-white/10">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="science">Science</TabsTrigger>
                  <TabsTrigger value="technology">Tech</TabsTrigger>
                  <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galaxies.map((galaxy, index) => (
                      <motion.div
                        key={galaxy.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group cursor-pointer"
                      >
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden">
                          <div className="relative">
                            <img 
                              src={galaxy.thumbnail} 
                              alt={galaxy.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className={`${getCategoryColor(galaxy.category)} text-white border-0`}>
                                {galaxy.category}
                              </Badge>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <h3 className="text-white font-semibold text-lg mb-1">{galaxy.title}</h3>
                              <p className="text-gray-200 text-sm line-clamp-2">{galaxy.description}</p>
                            </div>
                          </div>
                          
                          <CardContent className="p-4 space-y-3">
                            <div className="flex flex-wrap gap-1">
                              {galaxy.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-300">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Brain className="h-3 w-3" />
                                  {galaxy.nodeCount} nodes
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  L{galaxy.depth}
                                </span>
                              </div>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {galaxy.views}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="text-sm">+{galaxy.xpEarned} XP</span>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Share2 className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Other tab contents would be similar but filtered */}
                {['science', 'technology', 'philosophy', 'business', 'personal'].map((category) => (
                  <TabsContent key={category} value={category} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {galaxies.filter(g => g.category === category).map((galaxy, index) => (
                        <motion.div
                          key={galaxy.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group cursor-pointer"
                        >
                          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden">
                            <div className="relative">
                              <img 
                                src={galaxy.thumbnail} 
                                alt={galaxy.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2">
                                <Badge className={`${getCategoryColor(galaxy.category)} text-white border-0`}>
                                  {galaxy.category}
                                </Badge>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-2 left-2 right-2">
                                <h3 className="text-white font-semibold text-lg mb-1">{galaxy.title}</h3>
                                <p className="text-gray-200 text-sm line-clamp-2">{galaxy.description}</p>
                              </div>
                            </div>
                            
                            <CardContent className="p-4 space-y-3">
                              <div className="flex flex-wrap gap-1">
                                {galaxy.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-gray-300">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Brain className="h-3 w-3" />
                                    {galaxy.nodeCount} nodes
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    L{galaxy.depth}
                                  </span>
                                </div>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {galaxy.views}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span className="text-sm">+{galaxy.xpEarned} XP</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Share2 className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
