import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserDashboard from "./UserDashboard";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      navigate("/login", { state: { redirect: "/painel" } });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <UserDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
