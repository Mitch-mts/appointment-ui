'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  if (!user) return null;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
      <Toolbar>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <CalendarIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Appointment Booking
            </Typography>
          </Box>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={Link}
            href="/dashboard"
            startIcon={<DashboardIcon />}
            sx={{ color: 'text.secondary' }}
          >
            Dashboard
          </Button>

          <Button
            component={Link}
            href="/appointments"
            startIcon={<EventIcon />}
            sx={{ color: 'text.secondary' }}
          >
            Appointments
          </Button>

          {isAdmin && (
            <Button
              component={Link}
              href="/admin"
              startIcon={<AdminIcon />}
              sx={{ color: 'text.secondary' }}
            >
              Admin
            </Button>
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user.name}
              </Typography>
              {isAdmin && (
                <Chip
                  label="Admin"
                  size="small"
                  color="secondary"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: 0.5 }}
            >
              <ArrowDownIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
              },
            }}
          >
            <MenuItem
              component={Link}
              href="/profile"
              onClick={handleMenuClose}
              startIcon={<SettingsIcon />}
            >
              Profile Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick} startIcon={<LogoutIcon />}>
              Logout
            </MenuItem>
          </Menu>

          {/* Logout Confirmation Dialog */}
          <Dialog
            open={logoutDialogOpen}
            onClose={handleLogoutCancel}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 400,
              },
            }}
          >
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <span style={{ fontSize: '2rem' }}>🤔</span>
                <Typography variant="h6" component="span">
                  Are you sure you want to logout?
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
              <Typography variant="body1" color="text.secondary">
                You'll need to sign in again to access your account.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
              <Button
                onClick={handleLogoutCancel}
                variant="outlined"
                sx={{ minWidth: 100 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogoutConfirm}
                variant="contained"
                color="primary"
                sx={{ minWidth: 100 }}
                startIcon={<LogoutIcon />}
              >
                Logout
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
