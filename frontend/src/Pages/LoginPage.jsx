import React, { useState } from "react";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Link,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock, Business } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [remember, setRemember] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    companyName: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setRegisterError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setRegisterError('');
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.companyName) {
      setRegisterError('Lütfen tüm alanları doldurun.');
      setOpenSnackbar(true);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(registerForm.email)) {
      setRegisterError('Geçerli bir e-posta adresi girin.');
      setOpenSnackbar(true);
      return;
    }
    if (registerForm.password.length < 6) {
      setRegisterError('Şifre en az 6 karakter olmalı.');
      setOpenSnackbar(true);
      return;
    }
    try {
      await api.post('/Auth/register', {
        Username: registerForm.username,
        Email: registerForm.email,
        Password: registerForm.password,
        CompanyName: registerForm.companyName,
      });
      // Kayıt başarılı, otomatik giriş
      const loginRes = await api.post('/Auth/login', {
        identifier: registerForm.email,
        password: registerForm.password,
      });
      localStorage.setItem('token', loginRes.data.token);
      setTimeout(() => {
        navigate('/company-panel');
      }, 200);
    } catch (err) {
      if (err.response?.data) {
        setRegisterError(typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data));
      } else {
        setRegisterError('Kayıt sırasında hata oluştu.');
      }
      setOpenSnackbar(true);
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Lütfen tüm alanları doldurun.");
      setOpenSnackbar(true);
      return;
    }
    try {
      const response = await api.post('/Auth/login', {
        identifier: identifier,
        password: password,
      });
      localStorage.setItem('token', response.data.token);
      if (response.data.role) {
        localStorage.setItem('role', response.data.role);
      }
      // Token kaydedildikten sonra yönlendirme (200ms gecikme ile, tam sayfa yenileme)
      setTimeout(() => {
        if (response.data.role === "Admin") {
          window.location.href = '/admin-panel';
        } else {
          window.location.href = '/company-panel';
        }
      }, 200);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Giriş başarısız. Bilgilerinizi kontrol edin."
      );
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div
      style={{
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
      <div
        style={{
          background: "rgba(24,32,54,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 24,
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)",
          padding: 24,
          width: 380,
          maxWidth: "95vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        {/* Sekmeler */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            mb: 1.5,
            width: '100%',
            borderRadius: 3,
            background: 'rgba(36,48,80,0.18)',
            minHeight: 44,
            '& .MuiTab-root': {
              color: '#cbd5e1',
              fontWeight: 700,
              fontSize: 18,
              minHeight: 44,
              letterSpacing: 0.5,
              textTransform: 'none',
              borderRadius: 3,
              transition: 'all 0.18s',
            },
            '& .Mui-selected': {
              color: '#fff',
              background: 'rgba(99,102,241,0.18)',
            },
            '& .MuiTabs-indicator': {
              background: '#38bdf8',
              height: 4,
              borderRadius: 2,
            },
          }}
        >
          <Tab label="Giriş Yap" />
          <Tab label="Kayıt Ol" />
        </Tabs>
        {/* Formlar */}
        {activeTab === 0 && (
          <>
            {/* Logo ve başlık */}
            <img
              src="/assets/logo-beyaz.svg"
              alt="Logo"
              style={{ width: 180, marginBottom: 6 }}
            />
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>
              Araç Rezervasyon Sistemi
            </div>
            <TextField
              placeholder="E-posta veya Kullanıcı Adı"
              variant="outlined"
              fullWidth
              margin="normal"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person style={{ color: "#60a5fa" }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                style: {
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 500,
                },
                sx: { py: 0.5, px: 1.2, minHeight: 38, height: 42, fontSize: 16 },
              }}
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  '::placeholder': { color: '#e0e7ff', opacity: 1 },
                  fontSize: 16,
                  py: 0.5,
                  px: 1.2,
                },
                mb: 0.7,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px #23294611',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 4px 16px #23294622',
                    border: '2px solid #38bdf8',
                  },
                },
                '& .MuiInputAdornment-root': {
                  transition: 'transform 0.2s',
                },
                '& .Mui-focused .MuiInputAdornment-root': {
                  transform: 'scale(1.08)',
                },
              }}
            />
            <TextField
              placeholder="Şifre"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock style={{ color: "#60a5fa" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ color: "#60a5fa" }}
                      edge="end"
                      aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                disableUnderline: true,
                style: {
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 500,
                },
                sx: { py: 0.5, px: 1.2, minHeight: 38, height: 42, fontSize: 16 },
              }}
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  '::placeholder': { color: '#e0e7ff', opacity: 1 },
                  fontSize: 16,
                  py: 0.5,
                  px: 1.2,
                },
                mb: 0.7,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px #23294611',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 4px 16px #23294622',
                    border: '2px solid #38bdf8',
                  },
                },
                '& .MuiInputAdornment-root': {
                  transition: 'transform 0.2s',
                },
                '& .Mui-focused .MuiInputAdornment-root': {
                  transform: 'scale(1.08)',
                },
              }}
            />
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <FormControlLabel
                control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} sx={{ color: '#60a5fa' }} />}
                label={<span style={{ color: '#e0e7ff', fontSize: 13 }}>Beni hatırla</span>}
                sx={{ m: 0 }}
              />
              <Link underline="none" style={{ color: "#60a5fa", fontSize: 13, cursor: "pointer" }} onClick={() => navigate("/forgot-password")}>Şifremi unuttum</Link>
            </div>
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                mb: 1,
                backgroundColor: '#2563eb',
                color: '#fff',
                border: '2px solid #1e293b',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                minHeight: 48,
                textTransform: 'none',
                boxShadow: '0 2px 8px #23294622',
                letterSpacing: 0.5,
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  boxShadow: '0 2px 8px #2563eb22',
                },
              }}
              onClick={handleLogin}
            >
              Giriş Yap
            </Button>
          </>
        )}
        {activeTab === 1 && (
          <>
            {/* Logo ve başlık */}
            <img
              src="/assets/logo-beyaz.svg"
              alt="Logo"
              style={{ width: 180, marginBottom: 6 }}
            />
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>
              Araç Rezervasyon Sistemi
            </div>
            <TextField
              placeholder="Firma Adı"
              name="companyName"
              variant="outlined"
              fullWidth
              margin="normal"
              value={registerForm.companyName}
              onChange={handleRegisterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business style={{ color: "#60a5fa" }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                style: {
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 500,
                },
                sx: { py: 0.5, px: 1.2, minHeight: 38, height: 42, fontSize: 16 },
              }}
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  '::placeholder': { color: '#e0e7ff', opacity: 1 },
                  fontSize: 16,
                  py: 0.5,
                  px: 1.2,
                },
                mb: 0.7,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px #23294611',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 4px 16px #23294622',
                    border: '2px solid #38bdf8',
                  },
                },
                '& .MuiInputAdornment-root': {
                  transition: 'transform 0.2s',
                },
                '& .Mui-focused .MuiInputAdornment-root': {
                  transform: 'scale(1.08)',
                },
              }}
            />
            <TextField
              placeholder="Kullanıcı Adı"
              name="username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={registerForm.username}
              onChange={handleRegisterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person style={{ color: "#60a5fa" }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                style: {
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 500,
                },
                sx: { py: 0.5, px: 1.2, minHeight: 38, height: 42, fontSize: 16 },
              }}
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  '::placeholder': { color: '#e0e7ff', opacity: 1 },
                  fontSize: 16,
                  py: 0.5,
                  px: 1.2,
                },
                mb: 0.7,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px #23294611',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 4px 16px #23294622',
                    border: '2px solid #38bdf8',
                  },
                },
                '& .MuiInputAdornment-root': {
                  transition: 'transform 0.2s',
                },
                '& .Mui-focused .MuiInputAdornment-root': {
                  transform: 'scale(1.08)',
                },
              }}
            />
            <TextField
              placeholder="E-posta"
              name="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={registerForm.email}
              onChange={handleRegisterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person style={{ color: "#60a5fa" }} />
                  </InputAdornment>
                ),
                disableUnderline: true,
                style: {
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 500,
                },
                sx: { py: 0.5, px: 1.2, minHeight: 38, height: 42, fontSize: 16 },
              }}
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  '::placeholder': { color: '#e0e7ff', opacity: 1 },
                  fontSize: 16,
                  py: 0.5,
                  px: 1.2,
                },
                mb: 0.7,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px #23294611',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 4px 16px #23294622',
                    border: '2px solid #38bdf8',
                  },
                },
                '& .MuiInputAdornment-root': {
                  transition: 'transform 0.2s',
                },
                '& .Mui-focused .MuiInputAdornment-root': {
                  transform: 'scale(1.08)',
                },
              }}
            />
            <TextField
              placeholder="Şifre"
              name="password"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showRegisterPassword ? "text" : "password"}
              value={registerForm.password}
              onChange={handleRegisterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock style={{ color: "#60a5fa" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      style={{ color: "#60a5fa" }}
                      edge="end"
                      aria-label={showRegisterPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                      {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                disableUnderline: true,
                sx: { py: 0.5, px: 1.2, minHeight: 38, height: 42, fontSize: 16 },
              }}
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                input: {
                  color: '#fff',
                  fontWeight: 500,
                  letterSpacing: 0.2,
                  '::placeholder': { color: '#e0e7ff', opacity: 1 },
                  fontSize: 16,
                  py: 0.5,
                  px: 1.2,
                },
                mb: 0.7,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px #23294611',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 4px 16px #23294622',
                    border: '2px solid #38bdf8',
                  },
                },
                '& .MuiInputAdornment-root': {
                  transition: 'transform 0.2s',
                },
                '& .Mui-focused .MuiInputAdornment-root': {
                  transform: 'scale(1.08)',
                },
              }}
            />
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                mb: 1,
                backgroundColor: '#2563eb',
                color: '#fff',
                border: '2px solid #1e293b',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                minHeight: 48,
                textTransform: 'none',
                boxShadow: '0 2px 8px #23294622',
                letterSpacing: 0.5,
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  boxShadow: '0 2px 8px #2563eb22',
                },
              }}
              onClick={handleRegister}
            >
              Kayıt Ol
            </Button>
          </>
        )}
        {/* Admin Kayıt butonu */}
        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 1,
            mb: 1,
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
          onClick={() => navigate('/register-admin')}
        >
          Admin Kayıt
        </Button>
      </div>
      {/* Hafif mavi overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(120deg, #1e293b 0%, #334155 100%)",
          opacity: 0.5,
          zIndex: 0,
        }}
      />
      {/* Hata mesajı */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%", borderRadius: 3, fontSize: 16 }}>
          {activeTab === 0 ? error : registerError}
        </Alert>
      </Snackbar>
      {/* Sayfanın sağ alt köşesine sabit alt bilgi */}
      <div
        style={{
          position: 'fixed',
          right: 24,
          bottom: 18,
          color: '#e0e7ef',
          fontSize: 13,
          opacity: 0.7,
          zIndex: 100,
          pointerEvents: 'none',
          fontFamily: 'inherit',
        }}
      >
        © 2025 Araç Rezervasyon Sistemi
      </div>
    </div>
  );
};

export default LoginPage;
