import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGroups } from '../context/GroupContext';

export default function GroupDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { groups } = useGroups();
  const { groupId } = route.params;
  const [isMember, setIsMember] = useState(false);

  const group = groups.find(g => g.id === groupId);

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Group not found</Text>
      </SafeAreaView>
    );
  }

  const handleJoinGroup = () => {
    Alert.alert(
      'Join Group',
      'Would you like to join this group?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Join',
          onPress: () => {
            setIsMember(true);
            Alert.alert('Success', 'You have joined the group!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image Section */}
        <View style={[styles.imageSection, { backgroundColor: theme.card }]}>
          <Image 
            source={{ uri: group.logo }} 
            style={styles.groupImage}
          />
          <View style={styles.headerContent}>
            <Text style={[styles.groupName, { color: theme.text }]}>{group.name}</Text>
            {group.category && (
              <View style={[styles.categoryTag, { backgroundColor: `${theme.primary}15` }]}>
                <Text style={[styles.categoryText, { color: theme.primary }]}>
                  {group.category}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={[styles.statsSection, { backgroundColor: theme.card }]}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{group.members}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Members</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{group.prayerCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Prayers</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          <Text style={[styles.description, { color: theme.text }]}>{group.description}</Text>
        </View>

        {/* Guidelines Section */}
        {group.guidelines && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Guidelines</Text>
            <Text style={[styles.description, { color: theme.text }]}>{group.guidelines}</Text>
          </View>
        )}

        {/* Join Button */}
        {!isMember && (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: theme.primary }]}
            onPress={handleJoinGroup}
          >
            <Text style={styles.joinButtonText}>Join Group</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageSection: {
    padding: 20,
    alignItems: 'center',
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginTop: 1,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  section: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  joinButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 