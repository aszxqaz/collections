import { ActionIcon, Group, Loader, Stack, TagsInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { PropertyType } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { IconMinus } from '@tabler/icons-react';
import { useEffect } from 'react';
import {
  DefaultCard,
  ValidatedCheckbox,
  ValidatedTextInput,
  ValidatedTextarea,
} from '~/components';
import { loader as tagsLoader } from '../resources.tags/route';

type AddItemGroupProps = {
  onDelete: () => void;
  itemIdx: number;
  id: number;
  schemes: {
    name: string;
    type: PropertyType;
  }[];
};

export function AddItemGroup({ onDelete, schemes, itemIdx, id }: AddItemGroupProps) {
  const tagsFetcher = useFetcher<typeof tagsLoader>();

  useEffect(() => {
    tagsFetcher.load('/resources/tags');
  }, []);

  const tagsInputData = tagsFetcher.data?.tags.map(tag => tag.name) || [];

  const loadTagsDebounced = useDebouncedCallback((query?: string) => {
    if (query && !tagsInputData.includes(query)) {
      tagsFetcher.load(`/resources/tags?query=${query}`);
    }
  }, 200);

  const isLaterFetching = tagsFetcher.state == 'loading';

  return (
    <DefaultCard>
      <Group>
        <Stack flex={1}>
          <ValidatedTextInput
            name={`item-${itemIdx}-name`}
            label="Item name"
            placeholder="Item name"
          />
          <TagsInput
            name={`item-${itemIdx}-tags`}
            label="Tags"
            placeholder="Enter a tag"
            splitChars={[',', ' ', '|']}
            data={tagsInputData}
            onSearchChange={loadTagsDebounced}
            rightSection={isLaterFetching ? <Loader size="sm" /> : null}
          />
          {schemes.map((scheme, propIdx) => {
            const name = `item-${itemIdx}-prop-${propIdx}-value`;
            const key = `${propIdx}${id}`;
            switch (scheme.type) {
              case 'Date':
                return (
                  <ValidatedTextInput
                    key={key}
                    name={name}
                    placeholder="1982-11-01"
                    label={scheme.name}
                  />
                );
              case 'Int':
                return (
                  <ValidatedTextInput key={key} name={name} placeholder="1" label={scheme.name} />
                );
              case 'Line':
                return (
                  <ValidatedTextInput
                    key={key}
                    name={name}
                    placeholder="Text"
                    label={scheme.name}
                  />
                );
              case 'Multiline':
                return (
                  <ValidatedTextarea
                    key={key}
                    name={name}
                    placeholder="Multiline text"
                    label={scheme.name}
                  />
                );
              case 'Bool':
                return <ValidatedCheckbox key={key} name={name} label={scheme.name} />;
            }
          })}
        </Stack>
        <ActionIcon aria-label="Delete" bg="red" onClick={onDelete}>
          <IconMinus />
        </ActionIcon>
      </Group>
    </DefaultCard>
  );
}
