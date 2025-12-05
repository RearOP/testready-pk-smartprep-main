import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  School, 
  Calendar, 
  Users, 
  Phone, 
  AlertCircle,
  Save
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface StudentProfile {
  id: string;
  fullName: string;
  schoolName: string | null;
  age: number | null;
  classGrade: string | null;
  whatsappNumber: string | null;
  consentWhatsapp: boolean;
  profileCompleted: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState({
    schoolName: "",
    age: "",
    classGrade: "",
    whatsappNumber: "",
    consentWhatsapp: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.getProfile();
        if (response.success) {
          setProfile(response.data);
          setFormData({
            schoolName: response.data.schoolName || "",
            age: response.data.age?.toString() || "",
            classGrade: response.data.classGrade || "",
            whatsappNumber: response.data.whatsappNumber || "",
            consentWhatsapp: response.data.consentWhatsapp
          });
        } else {
          setError(response.message || "Failed to load profile");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await apiClient.updateProfile({
        schoolName: formData.schoolName || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        classGrade: formData.classGrade || undefined,
        whatsappNumber: formData.whatsappNumber || undefined,
        consentWhatsapp: formData.consentWhatsapp
      });

      if (response.success) {
        setSuccess("Profile updated successfully!");
        setProfile(response.data.student);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4" variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {profile && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Current Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Full Name:</span>
                      <p className="text-muted-foreground">{profile.fullName}</p>
                    </div>
                    <div>
                      <span className="font-medium">School:</span>
                      <p className="text-muted-foreground">{profile.schoolName || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Age:</span>
                      <p className="text-muted-foreground">{profile.age || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Class/Grade:</span>
                      <p className="text-muted-foreground">{profile.classGrade || "Not provided"}</p>
                    </div>
                  </div>
                </div>
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
                      disabled={saving}
                    />
                  </div>
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
                      disabled={saving}
                    />
                  </div>
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
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      placeholder="+92 300 1234567"
                      value={formData.whatsappNumber}
                      onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                      className="pl-10"
                      disabled={saving}
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
                    disabled={saving}
                  />
                  <Label htmlFor="consentWhatsapp" className="text-sm">
                    I agree to receive WhatsApp notifications for test results and updates
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
