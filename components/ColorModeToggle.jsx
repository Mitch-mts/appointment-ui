'use client';

import { IconButton, Tooltip } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useColorMode } from '../contexts/ColorModeContext.jsx';

export default function ColorModeToggle({ sx }) {
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        size="small"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        sx={sx}
      >
        {isDark ? (
          <LightModeOutlined fontSize="small" />
        ) : (
          <DarkModeOutlined fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
