import { createStackNavigator } from "@react-navigation/stack";
import { CreatePostScreen } from "@/screens/CreatePostScreen/CreatePostScreen";
import { FeedScreen } from "@/screens/FeedScreen/FeedScreen";
import { PostCommentScreen } from "@/screens/PostCommentScreen/PostCommentScreen";
import { PostDetailScreen } from "@/screens/PostDetailScreen/PostDetailScreen";
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
        name={SCREENS.PostDetail}
        component={PostDetailScreen}
        options={{ title: "Post" }}
      />
      <Stack.Screen
        name={SCREENS.PostComment}
        component={PostCommentScreen}
        options={{ title: "Comment" }}
      />
      <Stack.Screen
        name={SCREENS.CreatePost}
        component={CreatePostScreen}
        options={{ title: "New post" }}
      />
    </Stack.Navigator>
  );
}
