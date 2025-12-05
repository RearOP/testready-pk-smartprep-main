import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Crown } from "lucide-react";

const leaderboardData = [
  { 
    rank: 1, 
    name: "Ahmed Hassan", 
    city: "Lahore", 
    score: 2485, 
    subject: "MDCAT",
    avatar: "AH",
    badge: "🥇"
  },
  { 
    rank: 2, 
    name: "Fatima Khan", 
    city: "Karachi", 
    score: 2341, 
    subject: "FSc Pre-Med",
    avatar: "FK",
    badge: "🥈"
  },
  { 
    rank: 3, 
    name: "Muhammad Ali", 
    city: "Islamabad", 
    score: 2198, 
    subject: "ECAT",
    avatar: "MA",
    badge: "🥉"
  },
  { 
    rank: 4, 
    name: "Ayesha Malik", 
    city: "Faisalabad", 
    score: 2056, 
    subject: "CSS",
    avatar: "AM",
    badge: ""
  },
  { 
    rank: 5, 
    name: "Hassan Raza", 
    city: "Peshawar", 
    score: 1923, 
    subject: "Matric",
    avatar: "HR",
    badge: ""
  }
];

const Leaderboard = () => {
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBackground = (rank: number) => {
    switch(rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-background border-border";
    }
  };

  return (
    <section id="leaderboard" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Weekly Champions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compete with students across Pakistan and climb the leaderboard
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-primary" />
                <span>National Leaderboard - This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.map((student) => (
                  <div 
                    key={student.rank}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${getRankBackground(student.rank)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(student.rank)}
                          <span className="font-bold text-lg">#{student.rank}</span>
                          {student.badge && <span className="text-lg">{student.badge}</span>}
                        </div>
                        
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {student.avatar}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.city}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">{student.score.toLocaleString()}</div>
                        <Badge variant="outline" className="text-xs">
                          {student.subject}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  🎁 Weekly prizes: Scholarships, Cash rewards, and Study materials
                </p>
                <p className="text-xs text-muted-foreground">
                  Complete at least 50 questions to qualify for leaderboard
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;