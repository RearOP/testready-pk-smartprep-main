import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  Plus,
  Settings
} from "lucide-react";
import { apiClient, formatDate } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Adminheader from "@/components/Adminheader";


const AdminPanel = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, studentsResponse, testsResponse] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getStudents(),
          apiClient.getAdminTests()
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
          // console.log(statsResponse.data);
          
        }

        if (studentsResponse.success) {
          setStudents(studentsResponse.data.students);
        }

        if (testsResponse.success) {
          setTests(testsResponse.data.tests);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

 

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Adminheader />

      <div className="container py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.statistics.totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.statistics.totalTests}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.statistics.completedAttempts} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.statistics.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.statistics.totalAttempts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.statistics.completedAttempts} completed
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Students */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{student.fullName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student.schoolName} • {student.classGrade}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={student.profileCompleted ? "default" : "secondary"}>
                        {student.profileCompleted ? "Complete" : "Incomplete"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(student.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Test Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentAttempts.slice(0, 5).map((attempt: any) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{attempt.studentName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {attempt.testTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{attempt.percentage.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">
                        {attempt.score}/{attempt.totalMarks}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tests Management */}
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tests Management</CardTitle>
            <Link to="/createtest">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Test
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{test.title}</h3>
                    <Badge variant={test.isActive ? "default" : "secondary"}>
                      {test.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{test.questions.length} questions</span>
                    <span>{test.totalMarks} marks</span>
                    <span>{Math.floor(test.timeLimit / 60)} min</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/admin/tests/edit/${test.id}`)} >
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button onClick={() => navigate(`/admin/tests/view/${test.id}`)} variant="outline" size="sm" className="flex-1">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
