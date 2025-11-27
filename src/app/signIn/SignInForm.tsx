"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Divider,
  Typography,
  Modal,
  Paper,
  CircularProgress,
  Snackbar,
} from "@mui/material";

import { auth, googleProvider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return showToast("נא למלא אימייל וסיסמה");

    setLoading(true);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        showToast("התחברת בהצלחה!");
        setTimeout(() => (window.location.href = "/home"), 900);
      } else {
        showToast(data.error || "שגיאת התחברות");
      }
    } catch {
      showToast("שגיאה בשרת");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const checkRes = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const checkData = await checkRes.json();

      if (checkData.exists) {
        localStorage.setItem("currentUser", JSON.stringify(checkData.user));
        showToast("ברוך הבא בחזרה! 😊");
        setTimeout(() => (window.location.href = "/home"), 900);
      } else {
        setGoogleUser(user);
        setShowRoleModal(true);
      }
    } catch (err) {
      console.error(err);
      showToast("שגיאה בהתחברות");
    }
  };

  const handleRoleSelected = (role: "user" | "company") => {
    googleUser.role = role;
    setShowRoleModal(false);
  };

  return (
    <>
      {/* Toast */}
      <Snackbar
        open={Boolean(toast)}
        message={toast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />

      {/* FORM */}
      <Box
        component="form"
        onSubmit={handleEmailSignIn}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            bgcolor: "green",
            "&:hover": { bgcolor: "darkgreen" },
            height: 45,
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={26} sx={{ color: "white" }} /> : "Sign in"}
        </Button>

        <Typography variant="caption" sx={{ color: "#666", textAlign: "left" }}>
          I allow my information to be used in accordance with utility providers in Israel.
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }}>or continue with</Divider>

      <Button
        variant="outlined"
        fullWidth
        onClick={handleGoogleSignIn}
        sx={{
          py: 1.2,
          borderRadius: 2,
          display: "flex",
          gap: 1.5,
          textTransform: "none",
        }}
      >
        <img src="/images/google.png" width={22} height={22} />
        Continue with Google
      </Button>

      {/* ROLE MODAL */}
      <Modal open={showRoleModal} onClose={() => setShowRoleModal(false)}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Paper
            sx={{
              p: 4,
              width: 350,
              borderRadius: 3,
              textAlign: "center",
              animation: "popIn 0.25s ease",
            }}
          >
            <Typography variant="h6">מה סוג המשתמש שלך?</Typography>

            <Box mt={3} display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                sx={{ bgcolor: "green", "&:hover": { bgcolor: "darkgreen" } }}
                onClick={() => handleRoleSelected("user")}
              >
                משתמש רגיל
              </Button>

              <Button
                variant="contained"
                sx={{ bgcolor: "green", "&:hover": { bgcolor: "darkgreen" } }}
                onClick={() => handleRoleSelected("company")}
              >
                חברה
              </Button>
            </Box>
          </Paper>
        </Box>
      </Modal>
    </>
  );
}
