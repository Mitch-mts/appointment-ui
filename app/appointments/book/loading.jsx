'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';

export default function BookAppointmentLoading() {
  return (
    <Container maxWidth="md" sx={{ py: 4, px: 2 }}>
      <Skeleton variant="rounded" width={180} height={36} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" width="55%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" width="40%" height={24} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={72} sx={{ mb: 3 }} />
      <Skeleton variant="rounded" height={420} />
    </Container>
  );
}
