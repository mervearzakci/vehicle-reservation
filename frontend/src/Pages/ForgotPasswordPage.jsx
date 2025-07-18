import React, { useState } from "react";
import { Box, TextField, Button, Typography, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

// AdminRegisterVerify.jsx'ten alınan PinInput componenti
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
    <Box display="flex" justifyContent="center" alignItems="center" gap={0.5} mb={2} sx={{ width: '100%' }}>
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
            width: 40,
            height: 40,
            fontSize: 18,
            textAlign: "center",
            borderRadius: 8,
            border: "2px solid #e0e7ef",
            background: "#fff",
            marginRight: 0,
            outline: "none",
            transition: "border 0.2s, box-shadow 0.2s",
            boxShadow: "0 2px 8px #23294611",
            fontWeight: 600,
            color: "#232946",
            verticalAlign: 'middle',
            display: 'inline-block',
            marginLeft: idx === 0 ? 0 : 4,
            padding: 0,
          }}
          onFocus={e => e.target.style.border = '2px solid #6366f1'}
          onBlur={e => e.target.style.border = '2px solid #e0e7ef'}
        />
      ))}
    </Box>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: mail gönder, 2: kod ve yeni şifre
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setSnackbar({ open: true, message: "Lütfen e-posta adresinizi girin.", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      await api.post('/Auth/forgot-password', { email });
      setSnackbar({ open: true, message: "Şifre sıfırlama kodu e-posta adresinize gönderildi.", severity: "success" });
      setStep(2);
    } catch (err) {
      setSnackbar({ open: true, message: "Bir hata oluştu. Lütfen tekrar deneyin.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !newPassword) {
      setSnackbar({ open: true, message: "Lütfen kodu ve yeni şifrenizi girin.", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      await api.post('/Auth/reset-password', { email, code, newPassword });
      setSnackbar({ open: true, message: "Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.", severity: "success" });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      let msg = err.response?.data;
      if (typeof msg !== 'string' || (msg && msg.includes('System.'))) {
        msg = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
      }
      if (msg && (msg.includes('Kod yanlış') || msg.includes('süresi doldu'))) {
        msg = 'Kod yanlış veya süresi doldu! Lütfen e-posta adresinize gelen kodu kontrol edin.';
      }
      setSnackbar({ open: true, message: msg || "Şifre sıfırlanırken hata oluştu.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "url('/assets/login-bg.jpg') no-repeat center center fixed, linear-gradient(120deg, #1e293b 0%, #334155 100%)",
        backgroundSize: "cover",
        fontFamily: "Inter, Arial, sans-serif",
        position: "relative",
      }}
    >
      <Box
        sx={{
          background: "rgba(24,32,54,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)",
          p: 5,
          width: 370,
          maxWidth: "95vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <img src="/assets/logo-beyaz.svg" alt="Logo" style={{ width: 120, marginBottom: 18 }} />
        <Typography variant="h5" fontWeight={700} color="#fff" mb={2} letterSpacing={0.5}>
          Şifremi Unuttum
        </Typography>
        <Typography color="#cbd5e1" fontSize={15} mb={3} textAlign="center">
          {step === 1
            ? "Kayıtlı e-posta adresinizi girin. Şifre sıfırlama kodu gönderilecektir."
            : `E-posta adresinize gelen 6 haneli kodu ve yeni şifrenizi girin.`}
        </Typography>
        {step === 1 ? (
          <form style={{ width: '100%' }} onSubmit={handleSubmit}>
            <TextField
              placeholder="E-posta adresiniz"
              variant="filled"
              fullWidth
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              InputProps={{
                disableUnderline: true,
                style: {
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 500,
                },
              }}
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  '::placeholder': { color: '#e0e7ff', opacity: 1 },
                },
                mb: 2,
                '& .MuiFilledInput-root': {
                  borderRadius: 2,
                  boxShadow: '0 2px 8px #23294611',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 4px 16px #23294622',
                    border: '2px solid #38bdf8',
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                backgroundColor: '#2563eb',
                color: '#fff',
                border: '2px solid #1e293b',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                minHeight: 48,
                textTransform: 'none',
                boxShadow: '0 2px 8px #2563eb22',
                letterSpacing: 0.5,
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  boxShadow: '0 2px 8px #2563eb22',
                },
              }}
            >
              Şifre Sıfırlama Kodu Gönder
            </Button>
          </form>
        ) : (
          <form style={{ width: '100%' }} onSubmit={handleResetPassword}>
            <TextField
              placeholder="E-posta adresiniz"
              variant="filled"
              fullWidth
              margin="normal"
              value={email}
              disabled
              InputProps={{
                disableUnderline: true,
                style: {
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 500,
                },
              }}
              sx={{ mb: 2 }}
            />
            <PinInput length={6} onComplete={setCode} />
            <TextField
              placeholder="Yeni şifre"
              variant="filled"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              InputProps={{
                disableUnderline: true,
                style: {
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 500,
                },
              }}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                backgroundColor: '#2563eb',
                color: '#fff',
                border: '2px solid #1e293b',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                minHeight: 48,
                textTransform: 'none',
                boxShadow: '0 2px 8px #2563eb22',
                letterSpacing: 0.5,
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  boxShadow: '0 2px 8px #2563eb22',
                },
              }}
            >
              Şifreyi Sıfırla
            </Button>
          </form>
        )}
        <Button
          variant="text"
          fullWidth
          sx={{ mt: 2, color: "#60a5fa", fontWeight: 600, fontSize: 15, textTransform: 'none' }}
          onClick={() => navigate("/login")}
        >
          Giriş sayfasına dön
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%", borderRadius: 3, fontSize: 16 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
