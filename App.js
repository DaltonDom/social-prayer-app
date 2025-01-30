import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PrayerProvider } from "./context/PrayerContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { JournalProvider } from "./context/JournalContext";
import AddJournalScreen from "./screens/AddJournalScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GroupDetailScreen from "./screens/GroupDetailScreen";
import CreateGroupScreen from "./screens/CreateGroupScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import { GroupProvider } from "./context/GroupContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import AuthScreen from "./screens/AuthScreen";
import { View, ActivityIndicator } from "react-native";
import { FriendshipProvider } from "./context/FriendshipContext";
import { PaperProvider } from "react-native-paper";

// Screen imports
import HomeScreen from "./screens/HomeScreen";
import GroupsScreen from "./screens/GroupsScreen";
import AddPrayerScreen from "./screens/AddPrayerScreen";
import ProfileScreen from "./screens/ProfileScreen";
import JournalScreen from "./screens/JournalScreen";
import PrayerDetailScreen from "./screens/PrayerDetailScreen";
import JournalDetailScreen from "./screens/JournalDetailScreen";
import FriendsListScreen from "./screens/FriendsListScreen";
import MyPrayersScreen from "./screens/MyPrayersScreen";
import FriendDetailScreen from "./screens/FriendDetailScreen";
import GroupMembersScreen from "./screens/GroupMembersScreen";
import AddGroupPrayerScreen from "./screens/AddGroupPrayerScreen";
import UserProfileScreen from "./screens/UserProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Groups") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Add") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Journal") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Add" component={AddPrayerScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        // Your existing app stack
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.card,
            },
            headerTintColor: theme.primary,
            headerTitleStyle: {
              fontWeight: "600",
              color: theme.text,
            },
          }}
        >
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PrayerDetail"
            component={PrayerDetailScreen}
            options={{
              title: "Prayer Details",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="AddJournal"
            component={AddJournalScreen}
            options={{ title: "New Journal Entry", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="JournalDetail"
            component={JournalDetailScreen}
            options={{ title: "Journal Entry", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="MyPrayersList"
            component={MyPrayersScreen}
            options={{ title: "My Prayers", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="FriendsList"
            component={FriendsListScreen}
            options={{ title: "Friends", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="FriendDetail"
            component={FriendDetailScreen}
            options={{ title: "Friend Profile", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroupScreen}
            options={{
              title: "New Group",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="GroupDetail"
            component={GroupDetailScreen}
            options={{
              title: "Group Details",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerShown: false,
              presentation: "modal",
              animationEnabled: true,
              gestureEnabled: true,
              gestureDirection: "horizontal",
              cardStyle: { backgroundColor: "transparent" },
              cardOverlayEnabled: true,
            }}
          />
          <Stack.Screen
            name="GroupMembers"
            component={GroupMembersScreen}
            options={{
              title: "Group Members",
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="AddGroupPrayer"
            component={AddGroupPrayerScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="UserProfileScreen"
            component={UserProfileScreen}
            options={{
              title: "Profile",
              headerBackTitle: "Back",
            }}
          />
        </Stack.Navigator>
      ) : (
        // Auth stack
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <AuthProvider>
            <UserProvider>
              <PrayerProvider>
                <JournalProvider>
                  <GroupProvider>
                    <FriendshipProvider>
                      <Navigation />
                    </FriendshipProvider>
                  </GroupProvider>
                </JournalProvider>
              </PrayerProvider>
            </UserProvider>
          </AuthProvider>
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
