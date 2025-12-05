import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, School, Calendar, Users, Phone, AlertCircle } from "lucide-react";
import { apiClient, Test as ApiTest } from "@/lib/api";

// Define interfaces for progress data
interface ProgressData {
  statistics: {
    totalTests: number;
    completedTests: number;
    averageScore: number;
    bestScore: number;
  };
  recentTests: any[];
  progressData: any[];
}

const ProfileComplete = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    age: "",
    classGrade: "",
    whatsappNumber: "",
    consentWhatsapp: false
  });
  const [error, setError] = useState("");
  const [tests, setTests] = useState<ApiTest[]>([]); // Fixed: Use ApiTest type
  const [progress, setProgress] = useState<ProgressData | null>(null); // Fixed: Use ProgressData type
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.schoolName.trim()) {
      errors.schoolName = "School name is required";
    }

    if (!formData.age) {
      errors.age = "Age is required";
    } else if (parseInt(formData.age) < 5 || parseInt(formData.age) > 100) {
      errors.age = "Age must be between 5 and 100";
    }

    if (!formData.classGrade.trim()) {
      errors.classGrade = "Class/grade is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // First try the default endpoint
      const response = await apiClient.completeProfile({
        schoolName: formData.schoolName.trim(),
        age: parseInt(formData.age),
        classGrade: formData.classGrade.trim(),
        whatsappNumber: formData.whatsappNumber.trim() || undefined,
        consentWhatsapp: formData.consentWhatsapp
      });

      if (response.success) {
        navigate("/dashboard");
      } else {
        // Handle backend validation errors
        if (response.errors && Array.isArray(response.errors)) {
          const backendErrors: Record<string, string> = {};
          response.errors.forEach((err: any) => {
            if (err.param) {
              backendErrors[err.param] = err.msg;
            }
          });
          setValidationErrors(backendErrors);
        }
        setError(response.message || "Failed to complete profile");
      }
    } catch (err: any) {
      console.error("Complete profile error:", err);

      // If API client fails, try direct fetch with alternative endpoints
      await tryAlternativeEndpoints();
    } finally {
      setLoading(false);
    }
  };

  const tryAlternativeEndpoints = async () => {
    const endpoints = [
      '/student/complete-profile',
      '/student/profile',
      '/students/profile/complete',
      '/profile/complete'
    ];

    const payload = {
      schoolName: formData.schoolName.trim(),
      age: parseInt(formData.age),
      classGrade: formData.classGrade.trim(),
      whatsappNumber: formData.whatsappNumber.trim() || undefined,
      consentWhatsapp: formData.consentWhatsapp
    };

    const token = localStorage.getItem('token');
    
    if (!token) {
      setError("You are not logged in. Please login first.");
      return;
    }

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await fetch(`http://localhost:5000/api${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Response from ${endpoint}:`, data);

          if (data.success) {
            navigate("/dashboard");
            return;
          } else {
            setError(data.message || "Request failed");
          }
        } else {
          console.log(`Endpoint ${endpoint} returned ${response.status}`);
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed:`, error);
      }
    }

    setError("Unable to complete profile. Please check if the server is running and try again.");
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Remove the useEffect - it's not needed for ProfileComplete
  // This useEffect was from the Dashboard component

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Help us personalize your learning experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School/Institute Name</Label>
                <div className="relative">
                  <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="schoolName"
                    type="text"
                    placeholder="Enter your school or institute name"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange("schoolName", e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
                {validationErrors.schoolName && (
                  <p className="text-sm text-destructive">{validationErrors.schoolName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="pl-10"
                    min="5"
                    max="100"
                    disabled={loading}
                    required
                  />
                </div>
                {validationErrors.age && (
                  <p className="text-sm text-destructive">{validationErrors.age}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="classGrade">Class/Grade</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="classGrade"
                    type="text"
                    placeholder="e.g., 10th Grade, F.Sc Pre-Medical"
                    value={formData.classGrade}
                    onChange={(e) => handleInputChange("classGrade", e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
                {validationErrors.classGrade && (
                  <p className="text-sm text-destructive">{validationErrors.classGrade}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +92 for Pakistan)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consentWhatsapp"
                  checked={formData.consentWhatsapp}
                  onCheckedChange={(checked) => handleInputChange("consentWhatsapp", checked as boolean)}
                  disabled={loading}
                />
                <Label htmlFor="consentWhatsapp" className="text-sm">
                  I agree to receive WhatsApp notifications for test results and updates
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Completing Profile..." : "Complete Profile"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Note: You need to complete your profile before taking tests.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileComplete;