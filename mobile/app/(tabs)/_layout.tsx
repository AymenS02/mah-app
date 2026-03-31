import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "../components/TabBar";

export default function TabLayout() {
  return (
    <Tabs tabBar={props => <TabBar {...props} />}>
      <Tabs.Screen name='index' options={{ title: "Home" }} />
      <Tabs.Screen name='events' options={{ title: "Events" }} />
      <Tabs.Screen name='volunteering' options={{ title: "Volunteering" }} />
      <Tabs.Screen name='account' options={{ title: "Account" }} />
    </Tabs>
  );
}

