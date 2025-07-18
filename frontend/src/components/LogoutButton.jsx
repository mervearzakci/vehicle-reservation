// src/components/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

export default function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  return (
    <Button
      variant="contained"
      startIcon={<PowerSettingsNewIcon sx={{ fontSize: 22 }} />}
      sx={{
        background: 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)',
        color: '#fff',
        borderRadius: 3,
        px: 2.2,
        py: 1,
        fontWeight: 700,
        fontSize: 15,
        boxShadow: '0 2px 8px #ef444422',
        letterSpacing: 0.1,
        minWidth: 0,
        minHeight: 38,
        transition: 'all 0.18s',
        '&:hover': {
          background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
          color: '#fff',
          boxShadow: '0 4px 16px #ef444422',
        },
        ml: 0,
        mt: 0,
      }}
      onClick={handleLogout}
    >
      Çıkış
    </Button>
  );
}
