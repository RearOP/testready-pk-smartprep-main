import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Download,
    LogOut
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";


const Adminheader = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();


    const handleExportStudents = async () => {
        try {
            const blob = await apiClient.exportStudents();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'students.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };


    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={handleExportStudents}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Students
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </header>

    );
};

export default Adminheader;
