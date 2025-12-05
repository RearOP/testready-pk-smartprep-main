import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calculator, FlaskConical, Briefcase, Scale } from "lucide-react";
import { Link } from "react-router-dom";

const subjects = [
  {
    id: "matric",
    title: "Matriculation",
    description: "Complete MCQ practice for 9th & 10th grade",
    icon: BookOpen,
    subjects: ["Physics", "Chemistry", "Biology", "Mathematics", "English"],
    color: "bg-blue-500",
    students: "15,000+"
  },
  {
    id: "fsc",
    title: "F.Sc (Pre-Medical/Engineering)",
    description: "Comprehensive practice for intermediate students",
    icon: Calculator,
    subjects: ["Physics", "Chemistry", "Biology", "Mathematics"],
    color: "bg-green-500",
    students: "12,000+"
  },
  {
    id: "mdcat",
    title: "MDCAT",
    description: "Medical College Admission Test preparation",
    icon: FlaskConical,
    subjects: ["Biology", "Chemistry", "Physics", "English"],
    color: "bg-red-500",
    students: "8,000+"
  },
  {
    id: "ecat",
    title: "ECAT",
    description: "Engineering College Admission Test",
    icon: Briefcase,
    subjects: ["Physics", "Chemistry", "Mathematics", "English"],
    color: "bg-purple-500",
    students: "6,000+"
  },
  {
    id: "css",
    title: "CSS",
    description: "Central Superior Services examination",
    icon: Scale,
    subjects: ["General Knowledge", "Current Affairs", "English", "Essay"],
    color: "bg-yellow-500",
    students: "3,000+"
  }
];

const SubjectGrid = () => {
  return (
    <section id="subjects" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Path</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your exam category and start practicing with thousands of carefully crafted MCQs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const IconComponent = subject.icon;
            return (
              <Card key={subject.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg ${subject.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {subject.students} students
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{subject.title}</CardTitle>
                  <CardDescription>{subject.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Subjects covered:</p>
                    <div className="flex flex-wrap gap-1">
                      {subject.subjects.map((sub) => (
                        <Badge key={sub} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to={`/test?subject=${subject.subjects[0].toLowerCase()}`}>Start Practice</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubjectGrid;