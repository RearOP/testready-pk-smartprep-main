import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, LogOut, Menu, User, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">TestReady.pk</span>
        </div>

        {!location.pathname.includes('/dashboard') && !location.pathname.includes('/admin') && (
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#subjects" className="text-foreground hover:text-primary transition-colors">
              Subjects
            </a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#leaderboard" className="text-foreground hover:text-primary transition-colors">
              Leaderboard
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </a>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {user ? (
            // Logged in user buttons
            <>
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <User className="h-4 w-4" />
                <span className="text-muted-foreground">{user.student?.fullName || user.email}</span>
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
            </>
          ) : (
            // Guest/Not logged in buttons
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}

          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;