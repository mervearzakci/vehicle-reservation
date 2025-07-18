import React, { useState } from 'react';
import api from '../api/api'; // axios baseURL örneği
import { TextField, Button, Typography, Box, Snackbar, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function AddVehicle() {
  const [plateNumber, setPlateNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vehicleData = {
      PlateNumber: plateNumber,
      Brand: brand,
      Model: model
    };

    try {
      await api.post('/Vehicle', vehicleData);
      setSnackbar({ open: true, message: 'Araç başarıyla eklendi!', severity: 'success' });
      setPlateNumber('');
      setBrand('');
      setModel('');
    } catch (err) {
      setSnackbar({ open: true, message: 'Araç eklenirken hata oluştu', severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Araç Ekle</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Plaka" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Marka" value={brand} onChange={e => setBrand(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Model" value={model} onChange={e => setModel(e.target.value)} fullWidth margin="normal" required />
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
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
