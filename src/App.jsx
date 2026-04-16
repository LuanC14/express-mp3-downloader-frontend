import { useState } from 'react';
import { Box, Fade } from '@mui/material';
import SelectScreen from './components/SelectScreen';
import DownloadScreen from './components/DownloadScreen';

export default function App() {
  const [screen, setScreen] = useState('select');
  const [mode, setMode] = useState(null);

  const handleSelect = (selectedMode) => {
    setMode(selectedMode);
    setScreen('download');
  };

  const handleBack = () => {
    setScreen('select');
    setMode(null);
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', backgroundColor: '#fff', overflow: 'hidden' }}>
      <Fade in={screen === 'select'} timeout={300} unmountOnExit>
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <SelectScreen onSelect={handleSelect} />
        </Box>
      </Fade>

      <Fade in={screen === 'download'} timeout={300} unmountOnExit>
        <Box sx={{ position: 'absolute', inset: 0 }}>
          {mode && <DownloadScreen mode={mode} onBack={handleBack} />}
        </Box>
      </Fade>
    </Box>
  );
}
