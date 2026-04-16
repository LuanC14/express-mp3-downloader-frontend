import { useState, useRef } from "react";
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

export default function DownloadScreen({ mode, onBack }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState(STATUS.IDLE);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const esRef = useRef(null);

  const handleSubmit = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setStatus(STATUS.LOADING);
    setProgress(0);
    setProgressLabel("");
    setErrorMsg("");

    try {
      const endpoint = mode === "playlist" ? `${API}/playlist` : `${API}/video`;
      const { data } = await axios.post(endpoint, { url: trimmed });
      const { jobId } = data;

      const es = new EventSource(`${API}/progress/${jobId}`);
      esRef.current = es;

      es.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "progress") {
          setProgress(msg.percent ?? 0);
          if (msg.label) setProgressLabel(msg.label);
        } else if (msg.type === "done") {
          es.close();
          setProgress(100);

          const a = document.createElement("a");
          a.href = `${API}/file/${msg.jobId}`;
          a.download = mode === "playlist" ? "playlist.zip" : "audio.mp3";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          setStatus(STATUS.SUCCESS);
          setUrl("");
        } else if (msg.type === "error") {
          es.close();
          setErrorMsg(msg.message);
          setStatus(STATUS.ERROR);
        }
      };

      es.onerror = () => {
        es.close();
        setErrorMsg("Conexão perdida com o servidor.");
        setStatus(STATUS.ERROR);
      };
    } catch (err) {
      const message =
        err.response?.data?.error || "Ocorreu um erro inesperado.";
      setErrorMsg(message);
      setStatus(STATUS.ERROR);
    }
  };

  const handleBack = () => {
    esRef.current?.close();
    esRef.current = null;
    onBack();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isLoading = status === STATUS.LOADING;

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
          <IconButton onClick={handleBack} disabled={isLoading} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 500, color: "#111" }}>
            {mode === "playlist"
              ? "Download de Playlist"
              : "Download Individual"}
          </Typography>
        </Box>

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
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSubmit}
                  disabled={isLoading || !url.trim()}
                  edge="end"
                  sx={{
                    color: "#fff",
                    backgroundColor: "#1976d2",
                    borderRadius: "6px",
                    p: "6px",
                    mr: "-2px",
                    "&:hover": { backgroundColor: "#1565c0" },
                    "&.Mui-disabled": {
                      backgroundColor: "#b0bec5",
                      color: "#fff",
                    },
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: "8px", pr: "8px" },
          }}
        />

        {isLoading && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                {progressLabel ||
                  (progress === 0 ? "Iniciando..." : "Processando...")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress > 0 ? `${progress}%` : ""}
              </Typography>
            </Box>
            <LinearProgress
              variant={progress > 0 ? "determinate" : "indeterminate"}
              value={progress}
              sx={{ borderRadius: 4, height: 6 }}
            />
          </Box>
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
