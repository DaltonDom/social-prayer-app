import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const { width, height } = Dimensions.get("window");
const BUBBLE_SIZE = 55; // Smaller bubbles like Apple Watch
const BUBBLE_RADIUS = BUBBLE_SIZE / 2;

const FRIENDS = [
  { id: "1", name: "John", color: "#FF2D55", prayers: 12 },
  { id: "2", name: "Sarah", color: "#5856D6", prayers: 8 },
  { id: "3", name: "Mike", color: "#FF9500", prayers: 15 },
  { id: "4", name: "Emma", color: "#4CD964", prayers: 6 },
  { id: "5", name: "David", color: "#007AFF", prayers: 10 },
  { id: "6", name: "Lisa", color: "#5856D6", prayers: 9 },
  { id: "7", name: "Tom", color: "#FF3B30", prayers: 7 },
  { id: "8", name: "Anna", color: "#FF9500", prayers: 11 },
  { id: "9", name: "James", color: "#4CD964", prayers: 5 },
  { id: "10", name: "Mary", color: "#007AFF", prayers: 13 },
];

// Calculate initial positions in a tighter cluster
const calculateInitialPositions = () => {
  const centerX = width / 2;
  const centerY = height / 2;
  const positions = [];
  const radius = Math.min(width, height) / 4;

  FRIENDS.forEach((_, index) => {
    const angle = (index / FRIENDS.length) * 2 * Math.PI;
    const distance = radius * (0.6 + Math.random() * 0.4); // Vary distance from center
    const x = centerX + distance * Math.cos(angle) - BUBBLE_SIZE / 2;
    const y = centerY + distance * Math.sin(angle) - BUBBLE_SIZE / 2;
    positions.push(new Animated.ValueXY({ x, y }));
  });

  return positions;
};

export default function FriendsScreen({ navigation }) {
  const [scale] = useState(new Animated.Value(1));
  const positions = useRef(calculateInitialPositions()).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        Animated.spring(scale, {
          toValue: 0.95,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gesture) => {
        positions.forEach((position, index) => {
          const dx = gesture.dx * (1 - index * 0.05);
          const dy = gesture.dy * (1 - index * 0.05);
          position.setValue({
            x: position._value.x + dx / 10,
            y: position._value.y + dy / 10,
          });
        });
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();

        // Return bubbles to original positions with spring effect
        positions.forEach((position, index) => {
          const centerX = width / 2;
          const centerY = height / 2;
          const angle = (index / FRIENDS.length) * 2 * Math.PI;
          const radius = Math.min(width, height) / 4;
          const distance = radius * (0.6 + Math.random() * 0.4);

          Animated.spring(position, {
            toValue: {
              x: centerX + distance * Math.cos(angle) - BUBBLE_SIZE / 2,
              y: centerY + distance * Math.sin(angle) - BUBBLE_SIZE / 2,
            },
            friction: 4,
            tension: 40,
            useNativeDriver: false,
          }).start();
        });
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.bubblesContainer, { transform: [{ scale }] }]}
        {...panResponder.panHandlers}
      >
        {FRIENDS.map((friend, index) => (
          <Animated.View
            key={friend.id}
            style={[
              styles.bubble,
              {
                backgroundColor: friend.color,
                transform: [
                  { translateX: positions[index].x },
                  { translateY: positions[index].y },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.bubbleContent}
              onPress={() =>
                navigation.navigate("PrayerDetail", { friendId: friend.id })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.bubbleName}>{friend.name}</Text>
              <Text style={styles.bubblePrayers}>{friend.prayers}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  bubblesContainer: {
    flex: 1,
  },
  bubble: {
    position: "absolute",
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_RADIUS,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bubbleContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BUBBLE_RADIUS,
  },
  bubbleName: {
    color: "white",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  bubblePrayers: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
});
