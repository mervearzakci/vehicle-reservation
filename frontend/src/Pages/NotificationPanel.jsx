import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Chip, CircularProgress, Button, Alert } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import api from '../api/api';

const iconMap = {
  success: <CheckCircleIcon color="success" />, // yeşil
  warning: <WarningAmberIcon color="warning" />, // turuncu
  error: <ErrorIcon color="error" />, // kırmızı
  info: <InfoIcon color="info" /> // mavi
};

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    api.get('/Notification')
      .then(res => setNotifications(res.data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={800} color="#232946">
          Bildirimler
        </Typography>
        {notifications.length > 0 && (
          <Button
            variant="contained"
            startIcon={<DeleteOutlineIcon />}
            onClick={async () => {
              setDeleteLoading(true);
              setDeleteError(null);
              try {
                await api.delete('/Notification/all');
                setNotifications([]);
              } catch (err) {
                setDeleteError('Bildirimler silinirken bir hata oluştu.');
              } finally {
                setDeleteLoading(false);
              }
            }}
            disabled={deleteLoading}
            sx={{
              bgcolor: '#fbe9e7',
              color: '#d84315',
              borderRadius: 3,
              boxShadow: 1,
              fontWeight: 600,
              px: 2.5,
              py: 1,
              ml: 2,
              '&:hover': {
                bgcolor: '#ffccbc',
                color: '#b71c1c',
                boxShadow: 2
              },
              transition: 'all 0.2s'
            }}
          >
            {deleteLoading ? <CircularProgress size={22} color="inherit" /> : 'Tüm Bildirimleri Sil'}
          </Button>
        )}
      </Box>
      {loading ? (
        <CircularProgress />
      ) : notifications.length === 0 ? (
        <Typography color="text.secondary">Henüz bir bildirim yok.</Typography>
      ) : (
        <List>
          {notifications.map(n => (
            <ListItem key={n.id} alignItems="flex-start" sx={{ mb: 1, borderRadius: 2, bgcolor: n.isRead ? '#f1f5f9' : '#e0e7ef', boxShadow: n.isRead ? 0 : 2 }}>
              <ListItemIcon>
                {iconMap[n.type] || <NotificationsIcon color="primary" />}
              </ListItemIcon>
              <ListItemText
                primary={<span style={{ fontWeight: n.isRead ? 500 : 700 }}>{n.message}</span>}
                secondary={new Date(n.createdAt).toLocaleString('tr-TR')}
              />
              {!n.isRead && <Chip label="Yeni" color="primary" size="small" sx={{ ml: 1 }} />}
            </ListItem>
          ))}
        </List>
      )}
      {deleteError && (
        <Alert severity="error" sx={{ my: 2 }}>{deleteError}</Alert>
      )}
    </Box>
  );
} 