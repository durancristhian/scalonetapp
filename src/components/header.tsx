import { Container, Typography } from "@mui/material";

export const Header = () => {
  return (
    <Container
      component="main"
      sx={(theme) => ({
        backgroundColor: theme.palette.success.light,
        boxShadow: 2,
        py: 1,
      })}
    >
      <Typography component="h1" variant="h4">
        Scalonetapp
      </Typography>
    </Container>
  );
};
