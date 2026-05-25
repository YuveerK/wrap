import { createStackNavigator } from "@react-navigation/stack";
import { CreateIssueScreen } from "@/screens/CreateIssueScreen/CreateIssueScreen";
import { IssueDetailScreen } from "@/screens/IssueDetailScreen/IssueDetailScreen";
import { IssuesListScreen } from "@/screens/IssuesListScreen/IssuesListScreen";
import { SCREENS } from "./params";

const Stack = createStackNavigator();

export function IssuesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: "slide_from_right",
        headerShown: true,
      }}
    >
      <Stack.Screen
        name={SCREENS.IssuesList}
        component={IssuesListScreen}
        options={{ title: "Issues" }}
      />
      <Stack.Screen
        name={SCREENS.IssueDetail}
        component={IssueDetailScreen}
        options={{ title: "Issue" }}
      />
      <Stack.Screen
        name={SCREENS.CreateIssue}
        component={CreateIssueScreen}
        options={{ title: "Report issue" }}
      />
    </Stack.Navigator>
  );
}
