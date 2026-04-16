import { Box, Button, Typography } from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";

export default function SelectScreen({ onSelect }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: 500, color: "#111", letterSpacing: "-0.3px" }}
      >
        YouTube para MP3
      </Typography>

      <Button
        variant="outlined"
        size="large"
        startIcon={<MusicNoteIcon />}
        onClick={() => onSelect("video")}
        sx={{
          width: 240,
          py: 1.5,
          borderRadius: "10px",
          textTransform: "none",
          fontSize: "1rem",
        }}
      >
        Individual
      </Button>

      <Button
        variant="outlined"
        size="large"
        startIcon={<QueueMusicIcon />}
        onClick={() => onSelect("playlist")}
        sx={{
          width: 240,
          py: 1.5,
          borderRadius: "10px",
          textTransform: "none",
          fontSize: "1rem",
        }}
      >
        Playlist
      </Button>
    </Box>
  );
}
