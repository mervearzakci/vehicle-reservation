import React, { useState, useEffect } from "react";
import api from "../api/api"; // ortak axios instance
import {
  Button,
  Table, TableBody, TableCell, TableHead, TableRow, Typography,
  CircularProgress, Snackbar, Alert, Box, useMediaQuery, IconButton, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DeleteIcon from '@mui/icons-material/Delete';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const isMobile = useMediaQuery('(max-width:600px)');
  const [reservationTab, setReservationTab] = useState(0);
  const navigate = useNavigate();
  const [usersOpen, setUsersOpen] = useState(false);
  const [reservationsOpen, setReservationsOpen] = useState(false);

  // Kullanıcıları çek
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/Auth/users");
        setUsers(response.data);
      } catch (err) {
        setSnackbar({ open: true, message: "Kullanıcılar alınamadı!", severity: "error" });
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Rezervasyonları çek
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get("/Reservation");
        setReservations(response.data);
      } catch (err) {
        setSnackbar({ open: true, message: "Rezervasyonlar alınamadı!", severity: "error" });
      }
      setLoadingReservations(false);
    };
    fetchReservations();
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "Admin") {
      navigate("/company-panel");
    }
  }, [navigate]);

  const handleDelete = async (email) => {
    try {
      await api.delete(`/Auth/users/${email}`);
      setUsers(users.filter((user) => user.email !== email));
      setSnackbar({ open: true, message: "Kullanıcı başarıyla silindi.", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Kullanıcı silinirken hata oluştu!", severity: "error" });
    }
  };

  const handleReservationTabChange = (e, newValue) => setReservationTab(newValue);

  // Onayla butonu
  const handleApprove = async (id) => {
    try {
      await api.post(`/Reservation/approve/${id}`);
      setReservations((prev) => prev.map(r => r.id === id ? { ...r, isApproved: true } : r));
      setSnackbar({ open: true, message: 'Rezervasyon onaylandı.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Onaylama başarısız.', severity: 'error' });
    }
  };

  // Sil butonu
  const handleDeleteReservation = async (id) => {
    try {
      await api.delete(`/Reservation/${id}`);
      setReservations((prev) => prev.filter(r => r.id !== id));
      setSnackbar({ open: true, message: 'Rezervasyon silindi.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Silme başarısız.', severity: 'error' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #232946 0%, #3a3c6c 100%)",
        py: isMobile ? 1 : 6,
        px: isMobile ? 0.5 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Üst Bar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", maxWidth: isMobile ? '100vw' : 900, mb: isMobile ? 2 : 4, px: isMobile ? 1 : 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: isMobile ? 28 : 40, color: "#6366f1", filter: "drop-shadow(0 2px 8px #6366f1aa)" }} />
          <Typography variant={isMobile ? "h6" : "h4"} fontWeight={800} sx={{ color: "#f7fafc", letterSpacing: 1 }}>
            Admin Paneli
          </Typography>
        </Box>
        {/* Modern Çıkış Butonu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
          <Box
            component="button"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              window.location.href = '/';
            }}
            sx={{
              color: '#2563eb',
              background: 'rgba(255,255,255,0.85)',
              borderRadius: '50%',
              width: isMobile ? 32 : 44,
              height: isMobile ? 32 : 44,
              boxShadow: 3,
              border: '2px solid #2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                background: '#2563eb',
                color: '#fff',
                boxShadow: 6,
                border: '2px solid #2563eb',
              },
            }}
          >
            <PowerSettingsNewIcon fontSize={isMobile ? "small" : "medium"} />
          </Box>
          <Typography
            sx={{
              color: '#f7fafc',
              fontWeight: 600,
              fontSize: isMobile ? 14 : 18,
              ml: 1,
              letterSpacing: 0.5,
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'color 0.2s',
              '&:hover': {
                color: '#38bdf8',
              },
            }}
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              window.location.href = '/';
            }}
          >
            Çıkış Yap
          </Typography>
        </Box>
      </Box>

      {/* Kullanıcılar Accordion */}
      <Accordion expanded={usersOpen} onChange={() => setUsersOpen(!usersOpen)} sx={{ mb: isMobile ? 1.5 : 3, borderRadius: 4, boxShadow: '0 8px 32px 0 #23294622', bgcolor: '#f7fafc', border: '1.5px solid #e0e7ef', maxWidth: isMobile ? '100vw' : 900, width: '100%', mx: 'auto' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#e0e7ff', borderRadius: 4, px: isMobile ? 1 : 3, py: isMobile ? 1 : 2 }}>
          <Typography variant={isMobile ? "body1" : "h6"} fontWeight={700} sx={{ color: "#232946" }}>
            Kullanıcılar
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: isMobile ? 1 : 3, py: isMobile ? 1 : 2, overflowX: isMobile ? 'auto' : 'unset' }}>
          {loading ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ width: isMobile ? '90vw' : '100%' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#e0e7ff" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Firma</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Kullanıcı Adı</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#232946" }}>Sil</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#e0e7ff55' } }}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.companyName}</TableCell>
                      <TableCell>{user.userName}</TableCell>
                      <TableCell align="right">
                        <IconButton color="error" onClick={() => handleDelete(user.email)} sx={{ bgcolor: '#fff', borderRadius: '50%', boxShadow: 1, '&:hover': { bgcolor: '#fee2e2' } }}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Rezervasyonlar Accordion */}
      <Accordion expanded={reservationsOpen} onChange={() => setReservationsOpen(!reservationsOpen)} sx={{ mb: isMobile ? 1.5 : 3, borderRadius: 4, boxShadow: '0 8px 32px 0 #23294622', bgcolor: '#f7fafc', border: '1.5px solid #e0e7ef', maxWidth: isMobile ? '100vw' : 900, width: '100%', mx: 'auto' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#e0e7ff', borderRadius: 4, px: isMobile ? 1 : 3, py: isMobile ? 1 : 2 }}>
          <Typography variant={isMobile ? "body1" : "h6"} fontWeight={700} sx={{ color: "#232946" }}>
            Rezervasyonlar
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: isMobile ? 1 : 3, py: isMobile ? 1 : 2, overflowX: isMobile ? 'auto' : 'unset' }}>
          <Tabs value={reservationTab} onChange={handleReservationTabChange} sx={{ mb: 2 }} variant={isMobile ? "scrollable" : "standard"} scrollButtons={isMobile ? "auto" : false}>
            <Tab label="Bekleyenler" />
            <Tab label="Onaylananlar" />
          </Tabs>
          {loadingReservations ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ width: isMobile ? '90vw' : '100%' }}>
              {reservationTab === 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#e0e7ff" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Araç</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Şoför</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Firma</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Tarih</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservations.filter(r => !r.isApproved).map((r) => (
                      <TableRow key={r.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#e0e7ff55' } }}>
                        <TableCell>{r.vehicle ? `${r.vehicle.plateNumber} - ${r.vehicle.brand} ${r.vehicle.model}` : '-'}</TableCell>
                        <TableCell>{r.driver ? r.driver.fullName : '-'}</TableCell>
                        <TableCell>{r.vehicle && r.vehicle.company ? r.vehicle.company.name : '-'}</TableCell>
                        <TableCell>{r.reservationDate ? new Date(r.reservationDate).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <Button size="small" color="success" variant="contained" sx={{ mr: 1, borderRadius: 2 }} onClick={() => handleApprove(r.id)}>Onayla</Button>
                          <Button size="small" color="error" variant="outlined" sx={{ borderRadius: 2 }} onClick={() => handleDeleteReservation(r.id)}>Reddet</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {reservationTab === 1 && (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#e0e7ff" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Araç</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Şoför</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Firma</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Tarih</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#232946" }}>Durum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reservations.filter(r => r.isApproved).map((r) => (
                      <TableRow key={r.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#e0e7ff55' } }}>
                        <TableCell>{r.vehicle ? `${r.vehicle.plateNumber} - ${r.vehicle.brand} ${r.vehicle.model}` : '-'}</TableCell>
                        <TableCell>{r.driver ? r.driver.fullName : '-'}</TableCell>
                        <TableCell>{r.vehicle && r.vehicle.company ? r.vehicle.company.name : '-'}</TableCell>
                        <TableCell>{r.reservationDate ? new Date(r.reservationDate).toLocaleString() : '-'}</TableCell>
                        <TableCell><span style={{ color: '#22c55e', fontWeight: 700 }}>Onaylandı</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

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
