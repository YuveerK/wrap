import { createStackNavigator } from "@react-navigation/stack";
import { CreatePostScreen } from "@/screens/CreatePostScreen/CreatePostScreen";
import { FeedScreen } from "@/screens/FeedScreen/FeedScreen";
import { SCREENS } from "./params";

const Stack = createStackNavigator();

export function FeedStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: "slide_from_right",
        headerShown: true,
      }}
    >
      <Stack.Screen
        name={SCREENS.Feed}
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={SCREENS.CreatePost}
        component={CreatePostScreen}
        options={{ title: "New post" }}
      />
    </Stack.Navigator>
  );
}
