'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  ChevronLeft,
  ChevronRight,
  DeleteOutline,
} from '@mui/icons-material';
import Navigation from '../../../components/Navigation.jsx';
import ProviderAvailabilityPicker from '../../../components/ProviderAvailabilityPicker.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import {
  providerAPI,
  providerDisplayName,
} from '../../../lib/providers.js';

const EMPTY_FORM = {
  title: '',
  fullName: '',
  service: '',
  availability: '',
};

function chunkList(items, size) {
  if (size < 1) return [];
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export default function AdminProvidersPage() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const slidePageSize = isXs ? 1 : isMdDown ? 2 : 3;
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [editingProvider, setEditingProvider] = useState(null);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [providerSlideIndex, setProviderSlideIndex] = useState(0);

  const loadProviders = useCallback(async () => {
    setListLoading(true);
    setError('');
    try {
      const res = await providerAPI.listProviders();
      if (res?.success && Array.isArray(res.data)) {
        setProviders(res.data);
      } else {
        setError(res?.message || 'Could not load providers.');
        setProviders([]);
      }
    } catch {
      setError('Could not load providers. Please try again.');
      setProviders([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      loadProviders();
    }
  }, [user, isAdmin, loadProviders]);

  const sortedProviders = useMemo(
    () =>
      [...providers].sort((a, b) =>
        (a.fullName || '').localeCompare(b.fullName || '')
      ),
    [providers]
  );

  const providerPages = useMemo(
    () => chunkList(sortedProviders, slidePageSize),
    [sortedProviders, slidePageSize]
  );

  useEffect(() => {
    setProviderSlideIndex((prev) =>
      Math.min(prev, Math.max(0, providerPages.length - 1))
    );
  }, [providerPages.length]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (values) => {
    if (
      !values.title?.trim() ||
      !values.fullName?.trim() ||
      !values.service?.trim() ||
      !values.availability?.trim()
    ) {
      return 'Title, full name, service, and availability are required.';
    }
    return '';
  };

  const handleAddProvider = async () => {
    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        fullName: form.fullName.trim(),
        service: form.service.trim(),
        availability: form.availability.trim(),
      };
      const res = await providerAPI.createProvider(payload);
      if (res?.success && res.data) {
        setProviders((prev) => [...prev, res.data]);
        setForm(EMPTY_FORM);
      } else {
        setError(res?.message || 'Failed to add provider.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to add provider. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (provider) => {
    const str = (v) => (v == null ? '' : typeof v === 'string' ? v : String(v));
    setEditingProvider({
      ...provider,
      title: str(provider.title),
      fullName: str(provider.fullName),
      service: str(provider.service),
      availability: str(provider.availability),
    });
    setError('');
  };

  const handleEditFieldChange = (field, value) => {
    setEditingProvider((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingProvider) return;
    const validationError = validate(editingProvider);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const id = editingProvider.id;
      const payload = {
        title: (editingProvider.title ?? '').trim(),
        fullName: (editingProvider.fullName ?? '').trim(),
        service: (editingProvider.service ?? '').trim(),
        availability: (editingProvider.availability ?? '').trim(),
      };
      const res = await providerAPI.updateProvider(id, payload);
      if (res?.success) {
        if (res.data) {
          setProviders((prev) =>
            prev.map((p) =>
              String(p.id) === String(id) ? res.data : p
            )
          );
        } else {
          setProviders((prev) =>
            prev.map((p) =>
              String(p.id) === String(id) ? { ...p, ...payload } : p
            )
          );
        }
        setEditingProvider(null);
      } else {
        setError(res?.message || 'Failed to update provider.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update provider. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!saving) setProviderToDelete(null);
  };

  const handleConfirmDeleteProvider = async () => {
    if (!providerToDelete) return;
    const providerId = providerToDelete.id;

    setSaving(true);
    setError('');
    try {
      const res = await providerAPI.deleteProvider(providerId);
      if (res?.success) {
        setProviders((prev) =>
          prev.filter((p) => String(p.id) !== String(providerId))
        );
        setProviderToDelete(null);
      } else {
        setError(res?.message || 'Failed to remove provider.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to remove provider. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-sky-600 dark:border-cyan-400" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-blue-100 blur-3xl dark:bg-sky-900/40" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-cyan-100 blur-3xl dark:bg-indigo-900/30" />
        <div className="absolute bottom-[-80px] left-12 h-72 w-72 rounded-full bg-indigo-100 blur-3xl dark:bg-blue-900/25" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Title"
                placeholder="e.g. Dr."
                value={form.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Full name"
                value={form.fullName}
                onChange={(e) => handleFormChange('fullName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Service"
                value={form.service}
                onChange={(e) => handleFormChange('service', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <ProviderAvailabilityPicker
                idPrefix="add-provider"
                value={form.availability}
                onChange={(next) => handleFormChange('availability', next)}
                disabled={saving}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleAddProvider}
              disabled={saving}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {saving ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Add provider'
              )}
            </Button>
          </Box>
        </Paper>

        {listLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : sortedProviders.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4 }}>
            No providers yet. Add one above.
          </Typography>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Provider directory
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {slidePageSize} per slide · use arrows or dots to move between pages
            </Typography>

            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              <IconButton
                aria-label="Previous providers"
                onClick={() =>
                  setProviderSlideIndex((i) => Math.max(0, i - 1))
                }
                disabled={providerSlideIndex <= 0 || saving}
                sx={{
                  flexShrink: 0,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ChevronLeft />
              </IconButton>

              <Box
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  borderRadius: 3,
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    transition: theme.transitions.create('transform', {
                      duration: theme.transitions.duration.standard,
                      easing: theme.transitions.easing.easeOut,
                    }),
                    transform: `translateX(-${providerSlideIndex * 100}%)`,
                  }}
                >
                  {providerPages.map((group, pageIdx) => (
                    <Box
                      key={pageIdx}
                      sx={{
                        minWidth: '100%',
                        flexShrink: 0,
                        display: 'grid',
                        gap: 2,
                        px: { xs: 0.5, sm: 1 },
                        boxSizing: 'border-box',
                        alignItems: 'stretch',
                        gridTemplateColumns: `repeat(${slidePageSize}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: slidePageSize }, (_, slotIdx) => {
                        const provider = group[slotIdx];
                        if (!provider) {
                          return (
                            <Box
                              key={`slot-${pageIdx}-${slotIdx}`}
                              aria-hidden
                              sx={{ minWidth: 0, minHeight: 0 }}
                            />
                          );
                        }

                        const statusLabel = provider.status?.trim() || 'Active';
                        const serviceLabel =
                          (provider.service || 'Service').trim() || '—';
                        const availRaw =
                          (provider.availability || 'Not set').trim();

                        return (
                          <Paper
                            key={provider.id}
                            elevation={2}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              minWidth: 0,
                              height: '100%',
                              minHeight: { xs: 260, sm: 280 },
                              display: 'flex',
                              flexDirection: 'column',
                              boxSizing: 'border-box',
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 700, lineHeight: 1.3 }}
                            >
                              {providerDisplayName(provider)}
                            </Typography>

                            <Stack
                              direction="column"
                              spacing={1.25}
                              sx={{
                                mt: 1.5,
                                flex: '1 1 auto',
                                alignItems: 'stretch',
                                minWidth: 0,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                                >
                                  Status
                                </Typography>
                                <Chip
                                  size="small"
                                  label={statusLabel}
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 600,
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    height: 'auto',
                                    minHeight: 32,
                                    '& .MuiChip-label': {
                                      textAlign: 'left',
                                      whiteSpace: 'normal',
                                      py: 0.5,
                                    },
                                  }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                                >
                                  Service
                                </Typography>
                                <Chip
                                  size="small"
                                  label={serviceLabel}
                                  variant="filled"
                                  sx={{
                                    fontWeight: 600,
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    height: 'auto',
                                    minHeight: 32,
                                    '& .MuiChip-label': {
                                      textAlign: 'left',
                                      whiteSpace: 'normal',
                                      py: 0.5,
                                    },
                                  }}
                                />
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                                >
                                  Availability
                                </Typography>
                                <Chip
                                  size="small"
                                  label={availRaw}
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 600,
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    height: 'auto',
                                    minHeight: 32,
                                    alignItems: 'flex-start',
                                    '& .MuiChip-label': {
                                      textAlign: 'left',
                                      whiteSpace: 'normal',
                                      py: 0.5,
                                      overflow: 'visible',
                                    },
                                  }}
                                />
                              </Box>
                            </Stack>

                            <Box sx={{ mt: 'auto', pt: 2 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleOpenEdit(provider)}
                                disabled={saving}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                }}
                              >
                                Edit provider
                              </Button>
                              <Button
                                color="error"
                                variant="text"
                                size="small"
                                onClick={() => setProviderToDelete(provider)}
                                disabled={saving}
                                sx={{
                                  ml: 1,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                }}
                              >
                                Remove
                              </Button>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  ))}
                </Box>
              </Box>

              <IconButton
                aria-label="Next providers"
                onClick={() =>
                  setProviderSlideIndex((i) =>
                    Math.min(providerPages.length - 1, i + 1)
                  )
                }
                disabled={
                  providerSlideIndex >= providerPages.length - 1 || saving
                }
                sx={{
                  flexShrink: 0,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>

            {providerPages.length > 1 && (
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                {providerPages.map((_, dotIdx) => (
                  <Box
                    key={dotIdx}
                    component="button"
                    type="button"
                    aria-label={`Go to page ${dotIdx + 1}`}
                    onClick={() => setProviderSlideIndex(dotIdx)}
                    sx={{
                      p: 0,
                      border: 'none',
                      cursor: 'pointer',
                      width: dotIdx === providerSlideIndex ? 10 : 8,
                      height: dotIdx === providerSlideIndex ? 10 : 8,
                      borderRadius: '50%',
                      bgcolor:
                        dotIdx === providerSlideIndex
                          ? 'primary.main'
                          : 'action.disabledBackground',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor:
                          dotIdx === providerSlideIndex
                            ? 'primary.dark'
                            : 'action.hover',
                      },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}
      </main>

      <Dialog
        open={Boolean(providerToDelete)}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-provider-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 440,
            width: '100%',
            overflow: 'hidden',
            ...(theme.palette.mode === 'dark'
              ? {
                  background:
                    'linear-gradient(165deg, rgba(30, 41, 59, 0.98) 0%, #0f172a 42%, #1e293b 100%)',
                  border: '1px solid',
                  borderColor: 'rgba(51, 65, 85, 0.9)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.55)',
                }
              : {
                  background:
                    'linear-gradient(165deg, rgba(224, 242, 254, 0.95) 0%, #ffffff 42%, #f8fafc 100%)',
                  border: '1px solid',
                  borderColor: 'rgba(14, 165, 233, 0.22)',
                  boxShadow:
                    '0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255,255,255,0.6) inset',
                }),
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(15, 23, 42, 0.35)',
              backdropFilter: 'blur(4px)',
            },
          },
        }}
      >
        <DialogTitle
          id="delete-provider-dialog-title"
          sx={{
            pt: 3,
            pb: 1.5,
            px: 3,
            borderBottom: '1px solid',
            borderColor:
              theme.palette.mode === 'dark'
                ? 'rgba(51, 65, 85, 0.7)'
                : 'rgba(14, 165, 233, 0.12)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                flexShrink: 0,
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(145deg, rgba(254, 226, 226, 0.95) 0%, rgba(252, 165, 165, 0.35) 100%)',
                border: '1px solid',
                borderColor: 'rgba(239, 68, 68, 0.25)',
              }}
            >
              <DeleteOutline sx={{ fontSize: 28, color: 'error.main' }} />
            </Box>
            <Box sx={{ pt: 0.25 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Remove this provider?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.5 }}>
                They will be removed from the directory and will no longer appear when booking
                appointments.
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(15, 23, 42, 0.75)'
                  : 'rgba(255, 255, 255, 0.7)',
              border: '1px solid',
              borderColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(71, 85, 105, 0.6)'
                  : 'rgba(148, 163, 184, 0.35)',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Provider
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.25 }}>
              {providerToDelete ? providerDisplayName(providerToDelete) : ''}
            </Typography>
            {providerToDelete?.service && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {providerToDelete.service}
              </Typography>
            )}
          </Paper>
          <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            pt: 0,
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseDeleteDialog}
            disabled={saving}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              borderColor: 'rgba(14, 165, 233, 0.45)',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(14, 165, 233, 0.06)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeleteProvider}
            disabled={saving}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
            }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : 'Remove provider'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(editingProvider)}
        onClose={() => !saving && setEditingProvider(null)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: { xs: '100%', sm: 520 } } }}
      >
        <DialogTitle>Edit provider</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={editingProvider?.title || ''}
              onChange={(e) => handleEditFieldChange('title', e.target.value)}
            />
            <TextField
              fullWidth
              label="Full name"
              value={editingProvider?.fullName || ''}
              onChange={(e) => handleEditFieldChange('fullName', e.target.value)}
            />
            <TextField
              fullWidth
              label="Service"
              value={editingProvider?.service || ''}
              onChange={(e) => handleEditFieldChange('service', e.target.value)}
            />
            <ProviderAvailabilityPicker
              idPrefix="edit-provider"
              value={editingProvider?.availability || ''}
              onChange={(next) => handleEditFieldChange('availability', next)}
              disabled={saving}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setEditingProvider(null)}
            variant="outlined"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={22} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
