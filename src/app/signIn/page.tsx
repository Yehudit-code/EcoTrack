"use client";

import { Box, Typography, Paper } from "@mui/material";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #eaf4e6, #ffffff)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: 400,
          borderRadius: 4,
          textAlign: "center",
          backdropFilter: "blur(6px)",
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Sign in to{" "}
          <Box component="span" sx={{ color: "green" }}>
            EcoTrack
          </Box>
        </Typography>

        <Box mt={3}>
          <SignInForm />
        </Box>
      </Paper>
    </Box>
  );
}
