import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@expo/vector-icons";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {

  const icon = {
    index: (props: any) => <Ionicons name="home" size={24} color={props.color} />,
    events: (props: any) => <Ionicons name="calendar" size={24} color={props.color} />,
    volunteering: (props: any) => <Ionicons name="people" size={24} color={props.color} />,
    account: (props: any) => <Ionicons name="person" size={24} color={props.color} />,
  }
  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            {icon[route.name]({ color: isFocused ? '#003837' : '#78dcca' })}
            <Text style={{ color: isFocused ? '#003837' : '#78dcca' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 30,

    width: '90%',              // responsive width
    alignSelf: 'center',       // center horizontally

    justifyContent: 'space-between', // clean spacing between items
    alignItems: 'center',

    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,     // add inner spacing

    borderRadius: 35,

    boxShadow: '0px 10px 10px rgba(0,0,0,0.1)',
  },

  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabBar;