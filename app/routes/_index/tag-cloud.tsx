import { Flex, Text } from '@mantine/core';
import { AwaitedLoaderData } from '~/.server/utils';
import { DefaultCard } from '~/components';
import { loader } from './route';

type TagCloudProps = {
  tags: AwaitedLoaderData<typeof loader, 'tags'>;
};

export function TagCloud({ tags }: TagCloudProps) {
  const minFz = 1;
  const maxFz = 3;
  const avgCount = tags.reduce((total, tag) => total + tag._count.items, 0) / tags.length;
  return (
    <DefaultCard>
      <Flex gap="1rem" align="center">
        {tags.map(tag => {
          const fz = Math.max(minFz, Math.min(maxFz, tag._count.items / avgCount));
          return (
            <Text key={tag.name} fz={`${fz}rem`} tt="lowercase">
              #{tag.name}
            </Text>
          );
        })}
      </Flex>
    </DefaultCard>
  );
}
