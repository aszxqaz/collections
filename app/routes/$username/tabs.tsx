import { Tabs, Text } from '@mantine/core';
import { useSearchParams } from '@remix-run/react';
import { ReactNode, useState } from 'react';

type UserPageTabsProps = {
  tabs: {
    name: string;
    left?: ReactNode;
    right?: ReactNode;
    component: ReactNode;
  }[];
};

export function UserPageTabs({ tabs }: UserPageTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  const onChangeTab = (tab: string | null) => {
    if (tab) {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams);
      params.set('tab', tab);
      setSearchParams(params, {
        replace: true,
      });
    }
  };

  return (
    <Tabs
      radius="xs"
      defaultValue="overview"
      // keepMounted={false}
      value={activeTab}
      onChange={onChangeTab}
    >
      <Tabs.List>
        {tabs.map(({ name, left, right }) => (
          <Tabs.Tab key={name} value={name} leftSection={left} rightSection={right}>
            <Text>{name}</Text>
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {tabs.map(({ name, component }) => (
        <Tabs.Panel key={name} value={name}>
          {component}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
