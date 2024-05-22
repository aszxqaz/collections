import { Checkbox, Stack, Text } from '@mantine/core';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { ValidatedForm } from 'remix-validated-form';
import { createUser, findUser } from '~/.server/models/user.server';
import { createUserSession } from '~/.server/session';
import { registerValidator } from '~/common/schemas';
import { ValidatedButton, ValidatedTextInput } from './_components/validated-form';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const remember = formData.get('remember') == 'on' ? true : false;
  const existing = await findUser(username);
  if (existing) return createUsernameOccupiedResponse();
  const user = await createUser(username, password);
  if (!user) return createUnknownError();
  return createUserSession({
    redirectTo: '/',
    remember,
    request,
    username,
  });
}

export default function RegisterPage() {
  const actionData = useActionData<typeof action>();
  const errors = {
    username: actionData?.errors?.username,
    server: actionData?.errors?.server,
  };

  return (
    <ValidatedForm validator={registerValidator} method="post">
      <Stack gap="md">
        <ValidatedTextInput
          label="Username"
          placeholder="Username"
          required
          autoFocus={true}
          name="username"
          error={errors.username}
        />
        <ValidatedTextInput
          type="password"
          label="Password"
          placeholder="Password"
          required
          name="password"
        />
        <ValidatedTextInput
          type="password"
          label="Confirm password"
          placeholder="Confirm password"
          required
          name="confirmPassword"
        />
        <Checkbox label="Remember me" name="remember" />
        {errors.server && <Text c="red">{errors.server}</Text>}
        <ValidatedButton type="submit" mt="md">
          Sign Up
        </ValidatedButton>
      </Stack>
    </ValidatedForm>
  );
}

function createUsernameOccupiedResponse() {
  return json(
    {
      errors: {
        username: 'Username already registered, try another',
        server: null,
      },
    },
    { status: 400 },
  );
}

function createUnknownError() {
  return json(
    {
      errors: {
        username: null,
        server: 'Unknown error occured, try later',
      },
    },
    { status: 500 },
  );
}
