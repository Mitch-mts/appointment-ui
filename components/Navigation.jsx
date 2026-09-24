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
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Group as UsersIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ColorModeToggle from './ColorModeToggle.jsx';

const PREFETCH_ROUTES = [
  '/dashboard',
  '/appointments',
  '/appointments/book',
  '/profile',
  '/admin',
  '/admin/users',
  '/admin/providers',
];

export default function Navigation() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    PREFETCH_ROUTES.forEach((href) => router.prefetch(href));
    if (isAdmin) {
      router.prefetch('/admin/users');
      router.prefetch('/admin/providers');
    }
  }, [router, isAdmin]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (!user) return null;

  const navLinkSx = {
    color: 'text.secondary',
    whiteSpace: 'nowrap',
    minWidth: 0,
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setDrawerOpen(false);
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const displayName =
    user.fullName ||
    user.name ||
    user.firstName ||
    user.displayName ||
    (user.email ? user.email.split('@')[0] : '') ||
    'Account';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { href: '/appointments', label: 'Appointments', icon: <EventIcon /> },
    ...(isAdmin
      ? [
          { href: '/admin/users', label: 'Users', icon: <UsersIcon /> },
          { href: '/admin/providers', label: 'Providers', icon: <SettingsIcon /> },
        ]
      : []),
  ];

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={(theme) => ({
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(15,23,42,0.92)'
            : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        color: 'text.primary',
        borderBottom:
          theme.palette.mode === 'dark'
            ? '1px solid rgba(51,65,85,0.6)'
            : '1px solid rgba(148,163,184,0.25)',
      })}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
          gap: 0.5,
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 0.5 }}
        >
          <MenuIcon />
        </IconButton>

        <Link href="/dashboard" prefetch style={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', minWidth: 0 }}>
            <CalendarIcon sx={{ color: 'primary.main', mr: { xs: 0.75, sm: 1 }, fontSize: { xs: 24, sm: 28 }, flexShrink: 0 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '0.95rem', sm: '1.15rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Appointment Booking
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                Booking
              </Box>
            </Typography>
          </Box>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              prefetch
              startIcon={item.icon}
              sx={navLinkSx}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <ColorModeToggle sx={{ ml: { xs: 0, md: 0.5 } }} />

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 1, display: { xs: 'none', sm: 'block' } }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              display: { xs: 'none', sm: 'block' },
              maxWidth: 140,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            aria-label="Account menu"
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
            prefetch
            onClick={handleMenuClose}
          >
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
            Profile Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogoutClick}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: 'min(320px, 86vw)' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Menu
            </Typography>
            <IconButton aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List sx={{ pt: 1 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                prefetch
                selected={pathname === item.href}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            <ListItemButton
              component={Link}
              href="/profile"
              prefetch
              selected={pathname === '/profile'}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
            <ListItemButton onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Drawer>

        <Dialog
          open={logoutDialogOpen}
          onClose={handleLogoutCancel}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: 2,
              mx: 2,
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
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3, flexWrap: 'wrap', gap: 1 }}>
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
      </Toolbar>
    </AppBar>
  );
}
