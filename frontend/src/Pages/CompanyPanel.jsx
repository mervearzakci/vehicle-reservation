import React, { useState, useEffect } from "react";
import AddVehicle from "./AddVehicle";
import AddDriver from "./AddDriver";
import CreateReservation from "./CreateReservation";
import ReservationHistory from "./ReservationHistory";
import LogoutButton from "../components/LogoutButton";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HistoryIcon from '@mui/icons-material/History';
import DomainIcon from '@mui/icons-material/Domain';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationPanel from './NotificationPanel';
import api from '../api/api';

export default function CompanyPanel() {
  const [activePage, setActivePage] = useState("drivers");
  const [companyName, setCompanyName] = useState('');

  const menu = [
    { key: "drivers", label: "Şoför Ekle", icon: <PeopleAltIcon /> },
    { key: "vehicles", label: "Araç Ekle", icon: <DirectionsCarIcon /> },
    { key: "reservation", label: "Rezervasyon Oluştur", icon: <EventAvailableIcon /> },
    { key: "history", label: "Rezervasyon Geçmişi", icon: <HistoryIcon /> },
    { key: "notifications", label: "Bildirimler", icon: <NotificationsIcon /> },
  ];

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setCompanyName(res.data.companyName || 'Firma');
      })
      .catch(() => setCompanyName('Firma'));
  }, []);

  // Menüde sayfa değişiminde animasyon yönünü belirle
  const handleMenuClick = (key) => {
    setActivePage(key);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #232946 0%, #3a3c6c 100%)",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        py: 6,
        px: 1,
      }}
    >
      {/* Sol Menü */}
      <Box sx={{
        width: 260,
        minWidth: 200,
        bgcolor: '#fff',
        borderRadius: 6,
        boxShadow: '0 8px 32px 0 #23294622',
        p: 3,
        mr: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2.5,
        position: 'relative',
        height: 'auto',
        transition: 'all 0.18s',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, width: '100%' }}>
          <DomainIcon sx={{ fontSize: 54, color: '#2563eb', mb: 1 }} />
          <Typography sx={{ fontWeight: 900, fontSize: 32, color: '#232946', letterSpacing: 0.5, textAlign: 'center', lineHeight: 1.1, textShadow: '0 2px 12px #2563eb22' }}>{companyName || 'Orion Teknoloji'}</Typography>
        </Box>
        {menu.map((item) => (
          <Button
            key={item.key}
            onClick={() => handleMenuClick(item.key)}
            startIcon={React.cloneElement(item.icon, { sx: { fontSize: 22, color: activePage === item.key ? '#fff' : '#232946' } })}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              minWidth: 180,
              maxWidth: 220,
              width: '100%',
              height: 44,
              px: 2,
              py: 0,
              borderRadius: 3,
              color: activePage === item.key ? '#fff' : '#232946',
              background: activePage === item.key ? 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)' : '#f1f5f9',
              fontWeight: 600,
              fontSize: 15,
              boxShadow: activePage === item.key ? '0 2px 8px #2563eb22' : '0 2px 8px #23294611',
              border: 'none',
              mb: 1.1,
              mx: 0.5,
              gap: 0,
              textTransform: 'none',
              letterSpacing: 0.05,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'left',
              transition: 'all 0.18s',
              '& .MuiButton-startIcon': {
                marginRight: 2,
                marginLeft: 0,
                display: 'flex',
                alignItems: 'center',
              },
              '&:hover': {
                background: activePage === item.key ? 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)' : '#e0e7ef',
                color: activePage === item.key ? '#fff' : '#2563eb',
                boxShadow: '0 4px 16px #2563eb22',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
        <LogoutButton sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minWidth: 180,
          maxWidth: 220,
          width: '100%',
          height: 44,
          px: 2,
          py: 0,
          borderRadius: 3,
          color: '#fff',
          background: 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)',
          fontWeight: 700,
          fontSize: 15,
          boxShadow: '0 2px 8px #ef444422',
          letterSpacing: 0.1,
          mb: 1.1,
          mx: 0.5,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'left',
          transition: 'all 0.18s',
          '&:hover': {
            background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
            color: '#fff',
            boxShadow: '0 4px 16px #ef444422',
          },
        }} />
      </Box>
      {/* Sağ İçerik */}
      <Box sx={{ width: "100%", maxWidth: 700, px: 0, overflowX: 'auto' }}>
        <Card elevation={5} sx={{ borderRadius: 6, bgcolor: "#fff", boxShadow: "0 8px 32px 0 #23294618", mx: 0, border: '1.5px solid #e0e7ef' }}>
          <CardContent sx={{ px: 4, py: 3 }}>
            {activePage === "drivers" && <AddDriver />}
            {activePage === "vehicles" && <AddVehicle />}
            {activePage === "reservation" && <CreateReservation />}
            {activePage === "history" && <ReservationHistory />}
            {activePage === "notifications" && <NotificationPanel />}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
