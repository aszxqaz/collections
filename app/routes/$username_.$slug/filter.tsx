import { Grid, GridCol, Input, RangeSlider, Select, Text } from '@mantine/core';
import { DateInput } from '~/components/DateInput';
import { FilterProps } from './filter-types';

export function Filter({ values, onChange, options, type }: FilterProps) {
  switch (type) {
    case 'Int': {
      const [min, max] = [Math.min(...values), Math.max(...values)];
      const [from, to] = [options.from ?? min, options.to ?? max];
      return (
        <RangeSlider
          mt="xs"
          mb="md"
          w="100%"
          minRange={1}
          min={min}
          max={max}
          step={1}
          marks={[
            { value: min, label: min.toString() },
            { value: max, label: max.toString() },
          ]}
          value={[from, to]}
          onChange={([from, to]) => onChange({ type, from, to })}
        />
      );
    }
    case 'Line':
    case 'Multiline':
      return (
        <Input
          placeholder="Filter"
          value={options.query}
          onChange={e => {
            onChange({ type, query: e.target.value });
          }}
        />
      );
    case 'Bool':
      const mapping = {
        true: 'True',
        false: 'False',
        undefined: 'Any',
      } as const;
      const data = Object.values(mapping);
      data.sort();
      const value = mapping[`${options.query}`];
      return (
        <Select
          value={value}
          data={data}
          onChange={value => {
            const entry = Object.entries(mapping).find(([_, v]) => v == value);
            const query = !entry ? undefined : entry[0] == 'true' ? true : false;
            onChange({ type, query });
          }}
        />
      );
    case 'Date': {
      const tss = values.map(v => v.getTime());
      const [from, to] = [
        options.from?.getTime() ?? Math.min(...tss),
        options.to?.getTime() ?? Math.max(...tss),
      ];
      const [fromDate, toDate] = [new Date(from), new Date(to)];
      return (
        <Grid align="center">
          <GridCol span={4}>
            <Text style={{ textAlign: 'right' }}>From</Text>
          </GridCol>
          <GridCol span={8}>
            <DateInput
              value={options.from}
              onChange={from => onChange({ type, from, to: options.to })}
            />
          </GridCol>
          <GridCol span={4}>
            <Text style={{ textAlign: 'right' }}>To</Text>
          </GridCol>
          <GridCol span={8}>
            <DateInput
              value={options.to}
              onChange={to => onChange({ type, from: options.from, to })}
            />
          </GridCol>
        </Grid>
      );
    }
  }
}
