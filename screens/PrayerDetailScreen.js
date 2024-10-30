import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PrayerDetailScreen({ route }) {
  const { prayerId } = route.params;

  return (
    <View style={styles.container}>
      <Text>Prayer Detail Screen - Prayer ID: {prayerId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
