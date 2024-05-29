import { Skeleton, SkeletonProps, Stack, StackProps } from '@mantine/core';

export function DefaultSkeleton({ ...skeletonProps }: SkeletonProps) {
  return <Skeleton width="100%" height="1.356rem" radius="md" {...skeletonProps} />;
}

type RepeatSkeleton = {
  count: number;
  skeletonProps?: SkeletonProps;
} & StackProps;

export function RepeatSkeleton({ count, skeletonProps, ...stackProps }: RepeatSkeleton) {
  return (
    <Stack {...stackProps}>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <DefaultSkeleton key={i} {...skeletonProps} />
        ))}
    </Stack>
  );
}
