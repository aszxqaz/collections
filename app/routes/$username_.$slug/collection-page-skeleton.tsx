import { Skeleton } from '@mantine/core';
import { DefaultCard } from '~/components';

export function CollectionPageSkeleton() {
  return (
    <>
      <DefaultCard>
        <Skeleton mt="lg" mb="md" width="20%" height="1.356rem" radius="md" />
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} my="0.8rem" width="100%" height="1.356rem" radius="md" />
          ))}
      </DefaultCard>
    </>
    // <Stack>
    //   <Skeleton width="100%" height="0.875rem" radius="md" />
    // </Stack>
  );
}
