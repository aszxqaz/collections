import { Accordion, Box, Menu, SimpleGrid, Stack, Text, rem } from '@mantine/core';
import { useClickOutside, useDebouncedCallback } from '@mantine/hooks';
import { PropertyType } from '@prisma/client';
import { SerializeFrom } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { IconEdit, IconFile, IconFilter, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { ItemsTable } from '~/components/ItemsTable';
import { CollectionFull, ItemWithProperties } from '~/types/models';
import { parseItemValue } from '~/utils';
import { Filter } from './filter';
import {
  BoolFilterOptions,
  DateFilterOptions,
  FilterOptions,
  IntFilterOptions,
  TextFilterOptions,
} from './filter-types';

type CollectionItemsTableImplProps = {
  collection: SerializeFrom<CollectionFull>;
  items: SerializeFrom<ItemWithProperties>[];
};

export function CollectionItemsTableImpl({ collection, items }: CollectionItemsTableImplProps) {
  const { schemes } = collection;
  const [filterOptions, _setFilterOptions] = useState<FilterOptions[]>([
    { type: PropertyType.Int },
    { type: PropertyType.Line },
    ...schemes.map(({ type }) => ({ type })),
  ]);
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const [pos, setPos] = useState([0, 0]);
  const ref = useClickOutside(() => setOpened(false));
  const [selectedItem, setSelectedItem] = useState<(typeof items)[number] | null>(null);
  const getFilteredItems = () =>
    items.filter(item =>
      filterOptions.every((fopt, i) => {
        const propValue =
          i == 0 ? item.id.toString() : i == 1 ? item.name : item.properties[i - 2].value;
        switch (fopt.type) {
          case 'Int': {
            const [from, to] = [
              fopt.from ?? Number.MIN_SAFE_INTEGER,
              fopt.to ?? Number.MAX_SAFE_INTEGER,
            ];
            const prop = parseItemValue(propValue, fopt.type);
            return prop >= from && prop <= to;
          }
          case 'Date': {
            const [from, to] = [
              fopt.from?.getTime() ?? Number.MIN_SAFE_INTEGER,
              fopt.to?.getTime() ?? Number.MAX_SAFE_INTEGER,
            ];
            const timestamp = parseItemValue(propValue, fopt.type).getTime();
            return timestamp >= from && timestamp <= to;
          }
          case 'Line':
          case 'Multiline': {
            if (!fopt.query) return true;
            const regex = new RegExp(`(^\\s*${fopt.query})|(\\s+${fopt.query})`, 'mi');
            return regex.test(propValue);
          }
          case 'Bool': {
            if (!fopt.query) return true;
            const prop = parseItemValue(propValue, fopt.type);
            return fopt.query == prop;
          }
        }
      }),
    );
  const [filteredItems, setFilteredItems] = useState(getFilteredItems());
  const setFilteredItemsDebounced = useDebouncedCallback(setFilteredItems, 200);
  useEffect(() => {
    setFilteredItemsDebounced(getFilteredItems());
  }, [items, filterOptions]);

  function setFilterOptions(index: number, options: IntFilterOptions): void;
  function setFilterOptions(index: number, options: TextFilterOptions): void;
  function setFilterOptions(index: number, options: DateFilterOptions): void;
  function setFilterOptions(index: number, options: BoolFilterOptions): void;
  function setFilterOptions(index: number, options: FilterOptions) {
    _setFilterOptions(prev => [...prev.slice(0, index), options, ...prev.slice(index + 1)]);
  }

  const filters = [
    {
      key: 'f_head_id',
      node: (
        <Stack gap="0.2rem" key="f_head_id">
          <Text>Id</Text>
          <Filter
            type="Int"
            options={filterOptions[0] as IntFilterOptions}
            values={items.map(item => item.id)}
            onChange={opts => setFilterOptions(0, opts)}
          />
        </Stack>
      ),
    },
    {
      key: 'f_head_name',
      node: (
        <Stack gap="0.2rem" key="f_head_name">
          <Text>Item name</Text>
          <Filter
            type="Line"
            options={filterOptions[1] as TextFilterOptions}
            values={items.map(item => item.name)}
            onChange={opts => setFilterOptions(1, opts)}
          />
        </Stack>
      ),
    },
    ...schemes.map((scheme, i) => ({
      key: `f_${scheme.id}`,
      node: (
        <Stack gap="0.2rem" key={`f_${scheme.id}`}>
          <Text>{scheme.name}</Text>
          {/* @ts-ignore */}
          <Filter
            type={scheme.type}
            options={filterOptions[i + 2]}
            values={items.map(item => item.properties[i].value)}
            // @ts-ignore
            onChange={opts => setFilterOptions(i + 2, opts)}
          />
        </Stack>
      ),
    })),
  ];

  return (
    <Stack>
      <Accordion variant="contained" radius="md" chevronPosition="left">
        <Accordion.Item value="Filter">
          <Accordion.Control icon={<IconFilter size={16} />}>Filters</Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }}>
              {filters.map(filter => filter.node)}
            </SimpleGrid>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <ItemsTable
        items={filteredItems}
        schemes={collection.schemes}
        onRowClick={(pos, index) => {
          setPos(pos);
          setOpened(true);
          setSelectedItem(filteredItems[index]);
        }}
      />
      <Box pos="fixed" left={`${pos[0]}px`} bottom={`${pos[1]}px`}>
        <Box ref={ref}>
          <Menu withinPortal={false} shadow="md" width={200} opened={opened} onChange={setOpened}>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconFile style={{ width: rem(14), height: rem(14) }} />}
                onClick={() => {
                  if (selectedItem) {
                    navigate(`/${collection.username}/${collection.slug}/${selectedItem.slug}`);
                  }
                }}
              >
                Open
              </Menu.Item>
              <Menu.Item leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}>
                Edit
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      </Box>
    </Stack>
  );
}
