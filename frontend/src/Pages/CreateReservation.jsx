import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../api/api"; // axios baseURL ve token ayarlı api
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function CreateReservation() {
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [reservationDate, setReservationDate] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [companyName, setCompanyName] = useState("");

  // Araç ve şoför listesini çek
  useEffect(() => {
    api.get("/auth/me").then(res => setCompanyName(res.data.companyName || "")).catch(() => setCompanyName(""));
    api
      .get("/Vehicle")
      .then((res) => setVehicles(res.data))
      .catch(() => setSnackbar({ open: true, message: "Araçlar yüklenemedi", severity: "error" }));
    api
      .get("/Driver")
      .then((res) => setDrivers(res.data))
      .catch(() => setSnackbar({ open: true, message: "Şoförler yüklenemedi", severity: "error" }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehicleId || !driverId || !reservationDate) {
      setSnackbar({ open: true, message: "Lütfen tüm alanları doldurun.", severity: "error" });
      return;
    }

    try {
      await api.post("/Reservation", {
        vehicleId: Number(vehicleId),
        driverId: Number(driverId),
        reservationDate,
      });
      setSnackbar({ open: true, message: "Randevu başarıyla oluşturuldu!", severity: "success" });

      // Formu temizle
      setVehicleId("");
      setDriverId("");
      setReservationDate("");
    } catch (error) {
      setSnackbar({ open: true, message: "Randevu oluşturulurken hata oluştu.", severity: "error" });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>
        Randevu Oluştur
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Araç Seç"
          value={vehicleId || ""}
          onChange={(e) => setVehicleId(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          {vehicles.map((vehicle) => (
            <MenuItem key={vehicle.id} value={vehicle.id}>
              {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Şoför Seç"
          value={driverId || ""}
          onChange={(e) => setDriverId(e.target.value)}
          fullWidth
          margin="normal"
          required
        >
          {drivers.filter(driver => !companyName || driver.companyName === companyName).map((driver) => (
            <MenuItem key={driver.id} value={driver.id}>
              {driver.fullName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Randevu Tarihi"
          type="datetime-local"
          value={reservationDate || ""}
          onChange={(e) => setReservationDate(e.target.value)}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{
            shrink: true,
          }}
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
          Oluştur
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
