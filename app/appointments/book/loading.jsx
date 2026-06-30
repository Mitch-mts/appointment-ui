import { Box, Container, Skeleton } from '@mui/material';

export default function BookAppointmentLoading() {
  return (
    <Container maxWidth="xl" sx={{ py: 4, px: 2 }}>
      <Skeleton variant="rounded" width={180} height={36} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" width="60%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" width="40%" height={24} sx={{ mb: 4 }} />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { md: '1fr 1fr' } }}>
        <Skeleton variant="rounded" height={320} />
        <Skeleton variant="rounded" height={320} />
      </Box>
    </Container>
  );
}
