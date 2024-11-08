import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function FriendDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { friend } = route.params;

  const handleUnfriend = () => {
    Alert.alert(
      "Unfriend",
      `Are you sure you want to unfriend ${friend.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unfriend",
          style: "destructive",
          onPress: () => {
            // Add unfriend logic here
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderPrayerItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.prayerCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate("PrayerDetail", { prayerId: item.id })}
    >
      <Text style={[styles.prayerTitle, { color: theme.text }]}>
        {item.title}
      </Text>
      <Text
        style={[styles.prayerDescription, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>
      <Text style={[styles.prayerDate, { color: theme.textSecondary }]}>
        {item.date}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Image
          source={{ uri: friend.profileImage }}
          style={styles.profileImage}
        />
        <Text style={[styles.name, { color: theme.text }]}>{friend.name}</Text>
        <TouchableOpacity
          style={[styles.unfriendButton, { backgroundColor: "#FF3B3020" }]}
          onPress={handleUnfriend}
        >
          <Ionicons name="person-remove" size={20} color="#FF3B30" />
          <Text style={styles.unfriendText}>Unfriend</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Prayer Requests
        </Text>
        <FlatList
          data={[]} // Add friend's prayers data here
          renderItem={renderPrayerItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.prayersList}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No prayer requests yet
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  unfriendButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
    gap: 8,
  },
  unfriendText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  prayersList: {
    gap: 12,
  },
  prayerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  prayerDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  prayerDate: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
  },
});
