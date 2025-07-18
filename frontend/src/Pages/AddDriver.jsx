import React, { useState } from "react";
import { Box, TextField, Button, Typography, Snackbar, Alert } from "@mui/material";
import api from "../api/api";  // axios baseURL ayarlı api dosyan varsa
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AddDriver() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [tckimlikNo, setTCKimlikNo] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basit validasyon
    if (!fullName || !phoneNumber || !licenseNumber || !tckimlikNo) {
      setSnackbar({ open: true, message: "Lütfen tüm alanları doldurun.", severity: "error" });
      return;
    }

    const driverData = {
      fullName,
      phoneNumber,
      licenseNumber,
      tckimlikNo,
    };

    try {
      await api.post("/Driver", driverData);
      setSnackbar({ open: true, message: "Şoför başarıyla eklendi!", severity: "success" });

      // Formu temizle
      setFullName("");
      setPhoneNumber("");
      setLicenseNumber("");
      setTCKimlikNo("");
    } catch (error) {
      setSnackbar({ open: true, message: "Şoför eklenirken hata oluştu.", severity: "error" });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>
        Şoför Ekle
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Ad Soyad"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Telefon Numarası"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          fullWidth
          margin="normal"
          required
          type="tel"
        />
        <TextField
          label="Ehliyet Numarası"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="TCKimlik No"
          value={tckimlikNo}
          onChange={(e) => setTCKimlikNo(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" fullWidth
          startIcon={<CheckCircleIcon sx={{ fontSize: 22 }} />}
          sx={{
            mt: 3,
            background: 'linear-gradient(90deg, #38bdf8 0%, #6366f1 100%)',
            color: '#fff',
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 17,
            minHeight: 42,
            boxShadow: 3,
            letterSpacing: 0.1,
            textTransform: 'none',
            transition: 'all 0.18s',
            '&:hover': {
              background: 'linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)',
              color: '#fff',
              boxShadow: 6,
            },
          }}
        >
          Kaydet
        </Button>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 24, sm: 40 } }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 3, bgcolor: '#f1f5f9', color: '#232946', fontWeight: 500, boxShadow: '0 4px 24px 0 #23294611', fontSize: 16, letterSpacing: 0.2, border: '1px solid #e0e7ef' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
