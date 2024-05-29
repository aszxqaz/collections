import { Stack } from '@mantine/core';
import { Item } from '@prisma/client';
import { SerializeFrom } from '@remix-run/node';
import { ValidatedForm } from 'remix-validated-form';
import { createCommentValidator } from '~/common/schemas';
import { ValidatedButton, ValidatedTextarea } from '~/components';

export type CreateItemCommentProps = {
  item: SerializeFrom<Item>;
};

export function CreateItemCommentForm({ item }: CreateItemCommentProps) {
  return (
    <ValidatedForm method="post" validator={createCommentValidator}>
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="intent" value="createComment" />
      <Stack>
        <ValidatedTextarea
          name="content"
          autosize={true}
          minRows={3}
          placeholder="Enter your comment here..."
        />
        <ValidatedButton type="submit" ml="auto">
          Send
        </ValidatedButton>
      </Stack>
    </ValidatedForm>
  );
}
