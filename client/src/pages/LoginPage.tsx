import { useState } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000/auth/login", { email, password });
      console.log(res.data); 
    } catch (error) {
      console.error("Помилка входу", error);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4">Вхід</Typography>
      <TextField fullWidth label="Email" margin="normal" onChange={(e) => setEmail(e.target.value)} />
      <TextField fullWidth label="Пароль" type="password" margin="normal" onChange={(e) => setPassword(e.target.value)} />
      <Button fullWidth variant="contained" color="primary" onClick={handleLogin}>
        Увійти
      </Button>
    </Container>
  );
};

export default LoginPage;
