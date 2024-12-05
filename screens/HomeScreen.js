import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  RefreshControl,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { usePrayers } from "../context/PrayerContext";
import { useTheme } from "../context/ThemeContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Modal from "react-native-modal";

export default function HomeScreen({ navigation }) {
  const { prayers, fetchPrayers } = usePrayers();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] =
    useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPrayers();
    } catch (error) {
      console.error("Error refreshing prayers:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPrayers]);

  const renderPrayerCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PrayerDetail", { prayerId: item.id })}
    >
      <LinearGradient
        colors={[theme.card, "#F8F7FF"]}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Image
              source={{ uri: item.userImage }}
              style={[styles.profileImage, styles.profileImageRing]}
            />
            <View style={styles.headerText}>
              <Text style={[styles.userName, { color: theme.text }]}>
                {item.userName}
              </Text>
              <Text style={[styles.date, { color: theme.textSecondary }]}>
                {item.date}
              </Text>
            </View>
          </View>
          <LinearGradient
            colors={
              theme.dark
                ? ["#581C87", "#1E3A8A"] // dark mode: purple-900 to blue-900
                : ["#E9D5FF", "#BFDBFE"] // light mode: purple-200 to blue-200
            }
            style={styles.categoryTag}
          >
            <Ionicons
              name={getCategoryIcon(item.category)}
              size={14}
              color={theme.dark ? "#E9D5FF" : "#6B21A8"} // dark: purple-200, light: purple-800
              style={styles.categoryIcon}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color: theme.dark ? "#E9D5FF" : "#6B21A8", // dark: purple-200, light: purple-800
                },
              ]}
            >
              {item.category}
            </Text>
          </LinearGradient>
        </View>

        <Text style={[styles.description, { color: theme.text }]}>
          {item.description}
        </Text>

        <View
          style={[
            styles.cardFooter,
            { backgroundColor: `${theme.background}50` },
          ]}
        >
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons
              name="chatbubble-outline"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.footerText, { color: theme.primary }]}>
              {item.comments} Comments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton}>
            <Ionicons name="refresh-outline" size={16} color={theme.primary} />
            <Text style={[styles.footerText, { color: theme.primary }]}>
              {item.updates} Updates
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Helper function to get category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Health":
        return "fitness";
      case "Family":
        return "home";
      case "Work":
        return "briefcase";
      case "Spiritual Growth":
        return "leaf";
      case "Relationships":
        return "heart";
      default:
        return "bookmark";
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={["top"]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            Tefillah
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[
                styles.notificationButton,
                { backgroundColor: `${theme.primary}10` },
              ]}
              onPress={() => setNotificationModalVisible(true)}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={prayers}
          renderItem={renderPrayerCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        />

        <Modal
          isVisible={isNotificationModalVisible}
          onBackdropPress={() => setNotificationModalVisible(false)}
          backdropOpacity={0.5}
          style={styles.modal}
          animationIn="slideInUp"
          animationOut="slideOutDown"
        >
          <View
            style={[styles.notificationModal, { backgroundColor: theme.card }]}
          >
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, { color: theme.text }]}>
                Notifications
              </Text>
              <TouchableOpacity
                onPress={() => setNotificationModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Example notification items */}
            <ScrollView style={styles.notificationList}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Ionicons name="person" size={20} color={theme.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <Text
                    style={[styles.notificationText, { color: theme.text }]}
                  >
                    John Doe commented on your prayer
                  </Text>
                  <Text style={styles.notificationTime}>2 hours ago</Text>
                </View>
              </View>

              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Ionicons name="heart" size={20} color={theme.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <Text
                    style={[styles.notificationText, { color: theme.text }]}
                  >
                    Sarah Smith prayed for you
                  </Text>
                  <Text style={styles.notificationTime}>5 hours ago</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 24,
    top: 10,
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingLeft: 40,
    paddingRight: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  profileImageRing: {
    borderWidth: 2,
    borderColor: "#6B4EFF",
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B21A8", // purple-800
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  notificationModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  notificationList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#6B7280",
  },
});
