import { Stack, Text } from '@mantine/core';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { useActionData, useSearchParams } from '@remix-run/react';
import bcrypt from 'bcryptjs';
import { ValidatedForm } from 'remix-validated-form';
import { findUserWithPassword } from '~/.server/models/user.server';
import { createUserSession } from '~/.server/session';
import { safeRedirect } from '~/.server/utils';
import { loginValidator } from '~/common/schemas';
import { ValidatedButton, ValidatedTextInput } from '../components/validated-form';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const remember = formData.get('remember') == 'on' ? true : false;
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/');
  const user = await findUserWithPassword(username);
  if (!user || !user.password) return createInvalidCredentialsResponse();
  const isValid = await bcrypt.compare(password, user.password.hash);
  if (!isValid) return createInvalidCredentialsResponse();
  return createUserSession({
    redirectTo,
    remember,
    request,
    username,
  });
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const actionData = useActionData<typeof action>();
  const errors = {
    server: actionData?.errors?.server,
  };

  return (
    <ValidatedForm validator={loginValidator} method="post">
      <Stack gap="md">
        <ValidatedTextInput
          label="Username"
          placeholder="Username"
          required
          autoFocus={true}
          name="username"
        />
        <ValidatedTextInput
          type="password"
          label="Password"
          placeholder="Password"
          required
          name="password"
        />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        {errors.server && <Text c="red">{errors.server}</Text>}
        <ValidatedButton type="submit" mt="md">
          Sign In
        </ValidatedButton>
      </Stack>
    </ValidatedForm>
  );
}

function createInvalidCredentialsResponse() {
  return json({ errors: { server: 'Invalid email or password' } }, { status: 400 });
}
