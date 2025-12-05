import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  BarChart3, 
  Clock, 
  Trophy, 
  TrendingUp,
  User,
  Settings,
  LogOut,
  AlertCircle,
  Play
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, formatDate, Test as ApiTest } from "@/lib/api";

// Use the imported Test interface from api.ts
interface Test extends ApiTest {
  // You can add additional properties if needed
}

interface RecentTest {
  id: string;
  testTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  completedAt: string;
}

interface ProgressData {
  statistics: {
    totalTests: number;
    completedTests: number;
    averageScore: number;
    bestScore: number;
  };
  recentTests: RecentTest[];
  progressData: Array<{
    date: string;
    score: number;
  }>;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch tests
        const testsResponse = await apiClient.getTests();
        if (testsResponse.success) {
          setTests(testsResponse.data.tests);
        } else {
          setError(testsResponse.message || "Failed to load tests");
        }

        // Try to fetch progress - handle if endpoint doesn't exist
        try {
          const progressResponse = await apiClient.getProgress();
          if (progressResponse.success) {
            setProgress(progressResponse.data);
          }
        } catch (progressError) {
          console.log("Progress endpoint not available, using fallback data");
          // Set default progress data if endpoint doesn't exist
          setProgress({
            statistics: {
              totalTests: testsResponse.data?.tests?.length || 0,
              completedTests: 0,
              averageScore: 0,
              bestScore: 0
            },
            recentTests: [],
            progressData: []
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartTest = async (testId: string) => {
    try {
      const response = await apiClient.startTest(testId);
      if (response.success) {
        navigate(`/test/${testId}`, { state: { attemptId: response.data.attemptId } });
      } else {
        setError(response.message || "Failed to start test");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start test");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TestReady.pk</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/profile")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back{user?.student?.fullName ? `, ${user.student.fullName}` : '!'}</h1>
          <p className="text-muted-foreground">
            {!user?.profileCompleted 
              ? "Complete your profile to get personalized recommendations"
              : "Ready to continue your test preparation journey?"}
          </p>
          {!user?.profileCompleted && (
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => navigate("/profile/complete")}
            >
              Complete Profile
            </Button>
          )}
        </div>

        {/* Statistics Cards */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Tests</p>
                    <p className="text-2xl font-bold">{tests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{progress.statistics.completedTests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">
                      {progress.statistics.completedTests > 0 
                        ? `${progress.statistics.averageScore.toFixed(1)}%` 
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Best Score</p>
                    <p className="text-2xl font-bold">
                      {progress.statistics.completedTests > 0 
                        ? `${progress.statistics.bestScore.toFixed(1)}%` 
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Available Tests</CardTitle>
              <CardDescription>
                Choose a test to start practicing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tests.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tests available at the moment</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back soon for new tests
                  </p>
                </div>
              ) : (
                tests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{test.title}</h3>
                        {test.description && (
                          <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {test._count?.questions || 0} Questions
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-4 w-4" />
                        <span>{test.totalMarks} marks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{Math.floor(test.timeLimit / 60)} min</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleStartTest(test.id)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>
                {progress?.recentTests && progress.recentTests.length > 0 
                  ? "Recent Performance" 
                  : "Getting Started"}
              </CardTitle>
              <CardDescription>
                {progress?.recentTests && progress.recentTests.length > 0 
                  ? "Your latest test results"
                  : "Take your first test to see your progress"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress?.recentTests && progress.recentTests.length > 0 ? (
                progress.recentTests.slice(0, 5).map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{test.testTitle}</h3>
                      <Badge variant={
                        test.percentage >= 80 ? "default" : 
                        test.percentage >= 60 ? "secondary" : 
                        "destructive"
                      }>
                        {test.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Score: {test.score}/{test.totalMarks}</span>
                        <span>{formatDate(test.completedAt)}</span>
                      </div>
                      <Progress value={test.percentage} className="h-2" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tests completed yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start your first test to track your progress
                  </p>
                  {tests.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => tests.length > 0 && handleStartTest(tests[0].id)}
                    >
                      Start Your First Test
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;