import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  InputAdornment
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function PinInput({ length = 6, onComplete }) {
  const [values, setValues] = React.useState(Array(length).fill(""));
  const inputsRef = React.useRef([]);

  const focusInput = (index) => {
    if (inputsRef.current[index]) inputsRef.current[index].focus();
  };

  const handleChange = (e, idx) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;
    const newValues = [...values];
    newValues[idx] = val;
    setValues(newValues);
    if (val && idx < length - 1) focusInput(idx + 1);
    if (newValues.every((v) => v !== "")) onComplete(newValues.join(""));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      focusInput(idx - 1);
    }
  };

  React.useEffect(() => {
    focusInput(0);
  }, []);

  return (
    <Box display="flex" justifyContent="center" gap={2} mb={3}>
      {values.map((val, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          style={{
            width: 48,
            height: 56,
            fontSize: 28,
            textAlign: "center",
            borderRadius: 12,
            border: "2px solid #e0e7ef",
            background: "#f7fafc",
            marginRight: 4,
            outline: "none",
            transition: "border 0.2s, box-shadow 0.2s",
            boxShadow: "0 2px 8px #23294611",
            fontWeight: 700,
            color: "#232946",
          }}
          onFocus={e => e.target.style.border = '2px solid #6366f1'}
          onBlur={e => e.target.style.border = '2px solid #e0e7ef'}
        />
      ))}
    </Box>
  );
}

export default function AdminRegisterVerify() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("info");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCodeComplete = (completeCode) => {
    setCode(completeCode);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const sendVerificationCode = async () => {
    setMessage("");
    if (!form.email || !form.username || !form.password) {
      setMessage("Lütfen tüm alanları doldurun.");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }
    setCodeSent(true);
    try {
      await api.post("/Auth/register-admin", {
        Username: form.username,
        Email: form.email,
        Password: form.password,
      });
      setMessage("Onay kodu e-posta adresinize gönderildi.");
      setSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      let errMsg = error.response?.data;
      if (typeof errMsg !== 'string' || (errMsg && errMsg.includes('System.'))) {
        errMsg = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
      }
      setMessage(errMsg || "Onay kodu gönderilirken hata oluştu.");
      setSeverity("error");
      setOpenSnackbar(true);
      setCodeSent(false);
    }
  };

  const verifyCodeAndRegister = async () => {
    if (code.length !== 6) {
      setMessage("Lütfen 6 haneli kodu eksiksiz girin.");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }
    try {
      await api.post("/Auth/verify-admin", {
        Username: form.username,
        Email: form.email,
        Password: form.password,
        Code: code,
      });
      setMessage("Admin kaydınız başarıyla tamamlandı. Giriş yapabilirsiniz.");
      setSeverity("success");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data || "Kod doğrulamada hata oluştu.");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #232946 0%, #3a3c6c 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        py: isMobile ? 2 : 6,
        px: 1,
        position: 'relative',
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          position: 'absolute',
          top: isMobile ? 12 : 32,
          left: isMobile ? 8 : 32,
          color: '#fff',
          background: 'rgba(36,48,80,0.32)',
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 16,
          px: 2,
          py: 0.5,
          zIndex: 10,
          boxShadow: '0 2px 8px #23294622',
          textTransform: 'none',
          '&:hover': {
            background: 'rgba(99,102,241,0.18)',
            color: '#38bdf8',
          },
          transition: 'all 0.18s',
        }}
      >
        Geri
      </Button>
      <Box
        sx={{
          backgroundColor: "#f7fafc",
          borderRadius: 4,
          p: isMobile ? 2 : 5,
          width: isMobile ? '100%' : 400,
          maxWidth: '100vw',
          textAlign: "center",
          color: "#232946",
          boxShadow: "0 8px 32px 0 #23294622",
          border: "1.5px solid #e0e7ef",
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 48, color: '#6366f1', mb: 1, filter: 'drop-shadow(0 2px 8px #6366f1aa)' }} />
          <Typography variant="h5" fontWeight="bold" mb={1} sx={{ color: '#232946', letterSpacing: 1 }}>
            Admin Kayıt & Doğrulama
          </Typography>
        </Box>

        <TextField
          label="Kurumsal E-posta"
          name="email"
          variant="outlined"
          fullWidth
          sx={{ mb: 2, borderRadius: 2, bgcolor: '#fff' }}
          value={form.email}
          onChange={handleFormChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">@</InputAdornment>,
            style: { borderRadius: 8 },
          }}
        />
        <TextField
          label="Kullanıcı Adı"
          name="username"
          variant="outlined"
          fullWidth
          sx={{ mb: 2, borderRadius: 2, bgcolor: '#fff' }}
          value={form.username}
          onChange={handleFormChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">👤</InputAdornment>,
            style: { borderRadius: 8 },
          }}
        />
        <TextField
          label="Şifre"
          name="password"
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: codeSent ? 2 : 3, borderRadius: 2, bgcolor: '#fff' }}
          value={form.password}
          onChange={handleFormChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">🔒</InputAdornment>,
            style: { borderRadius: 8 },
          }}
        />

        {codeSent && (
          <>
            <Typography mb={1} sx={{ color: '#232946', fontSize: 15 }}>
              E-posta adresinize gelen 6 haneli onay kodunu girin:
            </Typography>
            <PinInput length={6} onComplete={handleCodeComplete} />
          </>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{
            fontWeight: "bold",
            borderRadius: 3,
            background: "linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)",
            color: '#fff',
            boxShadow: 3,
            py: 1.2,
            fontSize: 18,
            letterSpacing: 0.5,
            mb: 1,
            '&:hover': {
              background: "linear-gradient(90deg, #818cf8 0%, #67e8f9 100%)",
              color: '#fff',
              boxShadow: 6,
            },
            transition: 'all 0.2s',
          }}
          onClick={codeSent ? verifyCodeAndRegister : sendVerificationCode}
        >
          {codeSent ? 'Kodu Onayla' : 'Onay Kodu Gönder'}
        </Button>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          sx={{ bottom: { xs: 24, sm: 40 } }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={severity}
            sx={{ 
              width: "100%", 
              borderRadius: 3, 
              bgcolor: '#f1f5f9', 
              color: '#232946', 
              fontWeight: 600, 
              boxShadow: '0 4px 24px 0 #23294611', 
              fontSize: 20, 
              letterSpacing: 0.2, 
              border: '2px solid #e0e7ef',
              py: 2.5,
              px: 3,
              minWidth: 340,
              maxWidth: 480,
              textAlign: 'center',
            }}
          >
            {message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
