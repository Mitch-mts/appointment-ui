'use client';

import AppPageShell from '../../components/AppPageShell.jsx';

/** Keeps nav + background mounted while switching between appointments routes. */
export default function AppointmentsLayout({ children }) {
  return <AppPageShell>{children}</AppPageShell>;
}
