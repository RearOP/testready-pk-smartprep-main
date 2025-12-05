import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Smartphone, 
  Download, 
  Users, 
  Target, 
  BarChart3,
  MessageSquare,
  Trophy
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Get personalized question suggestions based on your weak topics and learning patterns",
    badge: "Smart",
    color: "text-purple-600 bg-purple-100"
  },
  {
    icon: Smartphone,
    title: "SMS-Based Testing",
    description: "Practice even with low internet connectivity through our innovative SMS system",
    badge: "Innovative",
    color: "text-blue-600 bg-blue-100"
  },
  {
    icon: Download,
    title: "Offline PDFs",
    description: "Download practice sets and study materials for offline preparation",
    badge: "Offline",
    color: "text-green-600 bg-green-100"
  },
  {
    icon: Users,
    title: "Live Competitions",
    description: "Weekly live MCQ battles with students from across Pakistan",
    badge: "Live",
    color: "text-red-600 bg-red-100"
  },
  {
    icon: Target,
    title: "Topic-wise Practice",
    description: "Focused practice sessions for specific topics and chapters",
    badge: "Focused",
    color: "text-orange-600 bg-orange-100"
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Track your progress with comprehensive performance analytics",
    badge: "Analytics",
    color: "text-indigo-600 bg-indigo-100"
  },
  {
    icon: MessageSquare,
    title: "Expert Support",
    description: "Get help from subject experts and clarify your doubts instantly",
    badge: "Support",
    color: "text-teal-600 bg-teal-100"
  },
  {
    icon: Trophy,
    title: "Scholarship Program",
    description: "Win scholarships and cash prizes based on your performance",
    badge: "Rewards",
    color: "text-yellow-600 bg-yellow-100"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose TestReady.pk?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced features designed specifically for Pakistani students' needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">🇵🇰 Built for Pakistan</h3>
              <p className="text-muted-foreground mb-6">
                Our platform understands the Pakistani education system, local exam patterns, 
                and the unique challenges faced by students in different regions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Urdu language support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Local exam patterns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Regional accessibility</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;