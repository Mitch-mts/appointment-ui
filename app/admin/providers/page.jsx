'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Navigation from '../../../components/Navigation.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import {
  addProvider,
  getProviders,
  removeProvider,
  updateProvider,
} from '../../../lib/providers.js';

const EMPTY_FORM = {
  name: '',
  location: '',
  service: '',
  availability: '',
};

export default function AdminProvidersPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [editingProvider, setEditingProvider] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    setProviders(getProviders());
  }, []);

  const sortedProviders = useMemo(
    () => [...providers].sort((a, b) => a.name.localeCompare(b.name)),
    [providers]
  );

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (values) => {
    if (
      !values.name.trim() ||
      !values.location.trim() ||
      !values.service.trim() ||
      !values.availability.trim()
    ) {
      return 'Name, location, service, and availability are required.';
    }
    return '';
  };

  const handleAddProvider = () => {
    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newProvider = {
      id: `p${Date.now()}`,
      name: form.name.trim(),
      location: form.location.trim(),
      service: form.service.trim(),
      availability: form.availability.trim(),
    };

    const next = addProvider(newProvider);
    setProviders(next);
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleOpenEdit = (provider) => {
    setEditingProvider(provider);
    setError('');
  };

  const handleEditFieldChange = (field, value) => {
    setEditingProvider((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = () => {
    if (!editingProvider) return;
    const validationError = validate(editingProvider);
    if (validationError) {
      setError(validationError);
      return;
    }

    const next = updateProvider(editingProvider.id, {
      name: editingProvider.name.trim(),
      location: editingProvider.location.trim(),
      service: editingProvider.service.trim(),
      availability: editingProvider.availability.trim(),
    });
    setProviders(next);
    setEditingProvider(null);
    setError('');
  };

  const handleDeleteProvider = (providerId) => {
    const shouldDelete = window.confirm(
      'Are you sure you want to remove this provider? This action cannot be undone.'
    );
    if (!shouldDelete) return;
    const next = removeProvider(providerId);
    setProviders(next);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        <div className="absolute bottom-[-80px] left-12 h-72 w-72 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
      </div>

      <Navigation />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Manage Providers
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Admin only: view provider details and availability, then add, edit, or remove providers.
          </Typography>
        </div>

        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Add Provider
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Provider name"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Location"
                value={form.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Service"
                value={form.service}
                onChange={(e) => handleFormChange('service', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Availability"
                placeholder="e.g. Mon-Fri, 09:00-17:00"
                value={form.availability}
                onChange={(e) => handleFormChange('availability', e.target.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleAddProvider}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              Add provider
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {sortedProviders.map((provider) => (
            <Grid item xs={12} md={6} lg={4} key={provider.id}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {provider.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Location:</strong> {provider.location}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>Service:</strong> {provider.service}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>Availability:</strong> {provider.availability || 'Not set'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenEdit(provider)}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    Edit provider
                  </Button>
                  <Button
                    color="error"
                    variant="text"
                    onClick={() => handleDeleteProvider(provider.id)}
                    sx={{ ml: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    Remove
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </main>

      <Dialog
        open={Boolean(editingProvider)}
        onClose={() => setEditingProvider(null)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 460 } }}
      >
        <DialogTitle>Edit provider</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Provider name"
              value={editingProvider?.name || ''}
              onChange={(e) => handleEditFieldChange('name', e.target.value)}
            />
            <TextField
              fullWidth
              label="Location"
              value={editingProvider?.location || ''}
              onChange={(e) => handleEditFieldChange('location', e.target.value)}
            />
            <TextField
              fullWidth
              label="Service"
              value={editingProvider?.service || ''}
              onChange={(e) => handleEditFieldChange('service', e.target.value)}
            />
            <TextField
              fullWidth
              label="Availability"
              value={editingProvider?.availability || ''}
              onChange={(e) => handleEditFieldChange('availability', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditingProvider(null)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

