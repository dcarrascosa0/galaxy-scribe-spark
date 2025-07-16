import React, { useState, useEffect } from 'react';
import { Star, Trophy, Target, Zap, Brain, Users, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  category: 'creation' | 'exploration' | 'mastery' | 'social' | 'time';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp: number;
}

interface AchievementSystemProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: {
    notesCreated: number;
    sessionsCount: number;
    totalTimeSpent: number;
    deepestDepth: number;
    themesUsed: number;
    exportsCount: number;
  };
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({
  isOpen,
  onClose,
  userStats
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);

  const achievements: Achievement[] = [
    {
      id: 'first_note',
      title: 'First Steps',
      description: 'Create your first knowledge galaxy',
      icon: <Brain className="h-5 w-5" />,
      unlocked: userStats.notesCreated >= 1,
      progress: Math.min(userStats.notesCreated, 1),
      maxProgress: 1,
      category: 'creation',
      rarity: 'common',
      xp: 100
    },
    {
      id: 'note_creator',
      title: 'Knowledge Builder',
      description: 'Create 10 knowledge galaxies',
      icon: <Target className="h-5 w-5" />,
      unlocked: userStats.notesCreated >= 10,
      progress: Math.min(userStats.notesCreated, 10),
      maxProgress: 10,
      category: 'creation',
      rarity: 'rare',
      xp: 500
    },
    {
      id: 'deep_explorer',
      title: 'Deep Diver',
      description: 'Explore knowledge with depth level 5 or more',
      icon: <Zap className="h-5 w-5" />,
      unlocked: userStats.deepestDepth >= 5,
      progress: Math.min(userStats.deepestDepth, 5),
      maxProgress: 5,
      category: 'exploration',
      rarity: 'epic',
      xp: 750
    },
    {
      id: 'time_master',
      title: 'Time Master',
      description: 'Spend 10 hours exploring knowledge',
      icon: <Clock className="h-5 w-5" />,
      unlocked: userStats.totalTimeSpent >= 600, // 10 hours in minutes
      progress: Math.min(userStats.totalTimeSpent, 600),
      maxProgress: 600,
      category: 'time',
      rarity: 'rare',
      xp: 800
    },
    {
      id: 'theme_explorer',
      title: 'Style Explorer',
      description: 'Try all available themes',
      icon: <Star className="h-5 w-5" />,
      unlocked: userStats.themesUsed >= 4,
      progress: Math.min(userStats.themesUsed, 4),
      maxProgress: 4,
      category: 'exploration',
      rarity: 'epic',
      xp: 600
    },
    {
      id: 'export_master',
      title: 'Sharing is Caring',
      description: 'Export your knowledge 5 times',
      icon: <Users className="h-5 w-5" />,
      unlocked: userStats.exportsCount >= 5,
      progress: Math.min(userStats.exportsCount, 5),
      maxProgress: 5,
      category: 'social',
      rarity: 'rare',
      xp: 400
    },
    {
      id: 'session_warrior',
      title: 'Session Warrior',
      description: 'Complete 25 learning sessions',
      icon: <Trophy className="h-5 w-5" />,
      unlocked: userStats.sessionsCount >= 25,
      progress: Math.min(userStats.sessionsCount, 25),
      maxProgress: 25,
      category: 'mastery',
      rarity: 'legendary',
      xp: 1000
    },
    {
      id: 'galaxy_master',
      title: 'Galaxy Master',
      description: 'Create 50 knowledge galaxies',
      icon: <Award className="h-5 w-5" />,
      unlocked: userStats.notesCreated >= 50,
      progress: Math.min(userStats.notesCreated, 50),
      maxProgress: 50,
      category: 'mastery',
      rarity: 'legendary',
      xp: 2000
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: <Star className="h-4 w-4" /> },
    { id: 'creation', name: 'Creation', icon: <Brain className="h-4 w-4" /> },
    { id: 'exploration', name: 'Exploration', icon: <Target className="h-4 w-4" /> },
    { id: 'mastery', name: 'Mastery', icon: <Trophy className="h-4 w-4" /> },
    { id: 'social', name: 'Social', icon: <Users className="h-4 w-4" /> },
    { id: 'time', name: 'Time', icon: <Clock className="h-4 w-4" /> }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      default: return 'border-gray-300';
    }
  };

  useEffect(() => {
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const totalXP = unlockedAchievements.reduce((sum, a) => sum + a.xp, 0);
    setTotalXP(totalXP);
    setLevel(Math.floor(totalXP / 1000) + 1);
  }, [achievements]);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const completionPercentage = (unlockedCount / achievements.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>Achievements</span>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <Badge variant="outline" className="text-sm">
                Level {level}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {totalXP} XP
              </Badge>
              <Badge variant="outline" className="text-sm">
                {unlockedCount}/{achievements.length}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-300
                  ${achievement.unlocked 
                    ? `${getRarityBorder(achievement.rarity)} bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900` 
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800 opacity-60'
                  }
                  hover:shadow-lg hover:scale-105
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-full ${getRarityColor(achievement.rarity)} text-white
                    ${achievement.unlocked ? '' : 'grayscale'}
                  `}>
                    {achievement.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {achievement.title}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRarityColor(achievement.rarity)} text-white border-0`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Progress: {achievement.progress}/{achievement.maxProgress}
                        </span>
                        <span className="font-medium text-yellow-600">
                          +{achievement.xp} XP
                        </span>
                      </div>
                      
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1"
                      />
                    </div>
                    
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                        ✓ Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementSystem;