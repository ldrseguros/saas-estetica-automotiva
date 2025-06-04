
import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import SelectService from './SelectService';
import SelectDateTime from './SelectDateTime';
import SelectVehicle from './SelectVehicle';
import SelectLocation from './SelectLocation';
import ConfirmBooking from './ConfirmBooking';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BookingLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in when accessing any booking page
  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      // If not logged in, redirect to login page
      navigate('/login', { state: { redirect: location.pathname } });
    }
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 bg-background">
        <Routes>
          <Route index element={<SelectService />} />
          <Route path="data-hora" element={<SelectDateTime />} />
          <Route path="veiculo" element={<SelectVehicle />} />
          <Route path="local" element={<SelectLocation />} />
          <Route path="confirmar" element={<ConfirmBooking />} />
          <Route path="*" element={<Navigate to="/agendar" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default BookingLayout;
