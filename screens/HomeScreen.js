import React from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";

const DUMMY_PRAYERS = [
  {
    id: "1",
    userName: "John Doe",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-15",
    description: "Please pray for my upcoming surgery next week.",
    comments: 5,
    updates: 2,
  },
  {
    id: "2",
    userName: "Sarah Wilson",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-14",
    description:
      "Requesting prayers for my mom's recovery from COVID-19. She's been in the hospital for a week now.",
    comments: 12,
    updates: 3,
  },
  {
    id: "3",
    userName: "Michael Chen",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-14",
    description:
      "Need prayers for my job interview tomorrow. Really hoping this opportunity works out.",
    comments: 8,
    updates: 1,
  },
  {
    id: "4",
    userName: "Emily Rodriguez",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-13",
    description:
      "Please pray for my sister's pregnancy. She's in her third trimester and experiencing complications.",
    comments: 15,
    updates: 4,
  },
  {
    id: "5",
    userName: "David Kim",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-13",
    description:
      "Grateful for this community. Please pray for my marriage restoration.",
    comments: 20,
    updates: 5,
  },
  {
    id: "6",
    userName: "Lisa Thompson",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-12",
    description:
      "Need wisdom for an important decision about moving to a new city for work.",
    comments: 7,
    updates: 2,
  },
  {
    id: "7",
    userName: "James Wilson",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-12",
    description:
      "Please pray for my son's college applications. Waiting to hear back from universities.",
    comments: 9,
    updates: 1,
  },
  {
    id: "8",
    userName: "Maria Garcia",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-11",
    description:
      "Requesting prayer for our church's upcoming mission trip to South America.",
    comments: 25,
    updates: 6,
  },
  {
    id: "9",
    userName: "Robert Johnson",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-11",
    description:
      "Need prayer for strength and peace. Going through a difficult season in life.",
    comments: 18,
    updates: 3,
  },
  {
    id: "10",
    userName: "Anna Lee",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-10",
    description:
      "Please pray for my dad's cancer treatment. Starting chemotherapy next week.",
    comments: 30,
    updates: 7,
  },
  {
    id: "11",
    userName: "Thomas Brown",
    userImage: "https://via.placeholder.com/50",
    date: "2024-03-10",
    description:
      "Seeking prayers for our small group ministry. We're launching new groups next month.",
    comments: 6,
    updates: 2,
  },
];

export default function HomeScreen({ navigation }) {
  const renderPrayerCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PrayerDetail", { prayerId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.userImage }} style={styles.profileImage} />
        <View style={styles.headerText}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>{item.comments} Comments</Text>
        <Text style={styles.footerText}>{item.updates} Updates</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={DUMMY_PRAYERS}
        renderItem={renderPrayerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
  },
});
