import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ProfileScreen } from "@/screens/ProfileScreen/ProfileScreen";
import { useTheme } from "@/theme";
import { FeedStackNavigator } from "./FeedStackNavigator";
import { IssuesStackNavigator } from "./IssuesStackNavigator";

const Tab = createBottomTabNavigator();

/** @type {Record<string, keyof typeof Ionicons.glyphMap>} */
const TAB_ICONS = {
  FeedTab: { focused: "newspaper", unfocused: "newspaper-outline" },
  IssuesTab: { focused: "alert-circle", unfocused: "alert-circle-outline" },
  ProfileTab: { focused: "person", unfocused: "person-outline" },
};

export function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS.ProfileTab;
          const name = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedStackNavigator}
        options={{ title: "Feed" }}
      />
      <Tab.Screen
        name="IssuesTab"
        component={IssuesStackNavigator}
        options={{ title: "Issues" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
}
