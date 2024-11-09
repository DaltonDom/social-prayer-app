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
import { GroupProvider } from "./context/GroupContext";

// Screen imports
import HomeScreen from "./screens/HomeScreen";
import GroupsScreen from "./screens/GroupsScreen";
import AddPrayerScreen from "./screens/AddPrayerScreen";
import ProfileScreen from "./screens/ProfileScreen";
import JournalScreen from "./screens/JournalScreen";
import PrayerDetailScreen from "./screens/PrayerDetailScreen";
import JournalDetailScreen from "./screens/JournalDetailScreen";
import FriendsListScreen from "./screens/FriendsListScreen";
import FriendDetailScreen from "./screens/FriendDetailScreen";

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

function MainApp() {
  const { theme, isDarkMode } = useTheme();

  const navigationTheme = isDarkMode
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.background,
          card: theme.card,
          text: theme.text,
          border: theme.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.background,
          card: theme.card,
          text: theme.text,
          border: theme.border,
        },
      };

  return (
    <PrayerProvider>
      <NavigationContainer theme={navigationTheme}>
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
            options={{ title: "New Journal Entry" }}
          />
          <Stack.Screen
            name="JournalDetail"
            component={JournalDetailScreen}
            options={{ title: "Journal Entry" }}
          />
          <Stack.Screen
            name="FriendsList"
            component={FriendsListScreen}
            options={{ title: "Friends" }}
          />
          <Stack.Screen
            name="FriendDetail"
            component={FriendDetailScreen}
            options={{ title: "Friend Profile" }}
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
        </Stack.Navigator>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
      </NavigationContainer>
    </PrayerProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <JournalProvider>
          <GroupProvider>
            <MainApp />
          </GroupProvider>
        </JournalProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
