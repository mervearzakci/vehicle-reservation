import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../api/api"; // axios instance

export default function ReservationHistory() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    api
      .get("/Reservation")
      .then((res) => setReservations(res.data))
      .catch(() => setSnackbar({ open: true, message: "Rezervasyon geçmişi yüklenemedi", severity: "error" }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>
        Rezervasyon Geçmişi
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : reservations.length === 0 ? (
        <Typography>Henüz rezervasyon bulunmamaktadır.</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Araç Plakası</TableCell>
                <TableCell>Marka</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Şoför</TableCell>
                <TableCell>Rezervasyon Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.vehicle?.plateNumber || "-"}</TableCell>
                  <TableCell>{r.vehicle?.brand || "-"}</TableCell>
                  <TableCell>{r.vehicle?.model || "-"}</TableCell>
                  <TableCell>{r.driver?.fullName || "-"}</TableCell>
                  <TableCell>{new Date(r.reservationDate).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

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
