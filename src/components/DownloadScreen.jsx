import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  LinearProgress,
  Typography,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axios from "axios";

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

const API = import.meta.env.VITE_API_URL;
const HEALTH_URL = API.replace(/\/api$/, "") + "/health";

export default function DownloadScreen({ mode, onBack }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const [serverReady, setServerReady] = useState(false);

  useEffect(() => {
    axios.get(HEALTH_URL).finally(() => setServerReady(true));
  }, []);

  const handleSubmit = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setStatus(STATUS.LOADING);
    setErrorMsg("");

    try {
      const endpoint = mode === "playlist" ? `${API}/playlist` : `${API}/video`;
      const response = await axios.post(endpoint, { url: trimmed }, { responseType: "blob" });

      const blobUrl = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = mode === "playlist" ? "playlist.zip" : "audio.mp3";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setStatus(STATUS.SUCCESS);
      setUrl("");
    } catch (err) {
      const message = err.response?.data?.error || "Ocorreu um erro inesperado.";
      setErrorMsg(message);
      setStatus(STATUS.ERROR);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isLoading = status === STATUS.LOADING;
  const isDisabled = isLoading || !serverReady;

  const placeholder =
    mode === "playlist"
      ? "Cole o link da playlist do YouTube aqui"
      : "Cole o link do vídeo do YouTube aqui";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 560 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
          <IconButton onClick={onBack} disabled={isLoading} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 500, color: "#111" }}>
            {mode === "playlist" ? "Download de Playlist" : "Download Individual"}
          </Typography>
        </Box>

        {!serverReady && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Conectando ao servidor...
          </Typography>
        )}

        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (status !== STATUS.LOADING) setStatus(STATUS.IDLE);
          }}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSubmit}
                  disabled={isDisabled || !url.trim()}
                  edge="end"
                  sx={{
                    color: "#fff",
                    backgroundColor: "#1976d2",
                    borderRadius: "6px",
                    p: "6px",
                    mr: "-2px",
                    "&:hover": { backgroundColor: "#1565c0" },
                    "&.Mui-disabled": { backgroundColor: "#b0bec5", color: "#fff" },
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", pr: "8px" } }}
        />

        {isLoading && (
          <LinearProgress sx={{ mt: 2, borderRadius: 4, height: 6 }} />
        )}

        {status === STATUS.SUCCESS && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Download iniciado com sucesso!
          </Alert>
        )}

        {status === STATUS.ERROR && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMsg}
          </Alert>
        )}
      </Box>
    </Box>
  );
}
