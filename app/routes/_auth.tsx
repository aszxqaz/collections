import { Container } from '@mantine/core';
import { Outlet } from '@remix-run/react';

export default function AuthLayout() {
  return (
    <Container maw="30rem" p="md">
      <Outlet />
    </Container>
  );
}
