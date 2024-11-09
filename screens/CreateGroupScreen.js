import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useGroups } from '../context/GroupContext';

export default function CreateGroupScreen({ navigation }) {
  const { theme } = useTheme();
  const { addGroup } = useGroups();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [groupImage, setGroupImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to change the group image!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setGroupImage(result.assets[0].uri);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a group description');
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      logo: groupImage || 'https://via.placeholder.com/50',
      members: 1,
      description: description,
      lastActive: 'Just now',
      prayerCount: 0,
      category: category,
      guidelines: guidelines,
      isPrivate: isPrivate,
    };

    // Add the new group using the context
    addGroup(newGroup);

    Alert.alert('Success', 'Group created successfully', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.imageSection, { backgroundColor: theme.card }]}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {groupImage ? (
                <Image source={{ uri: groupImage }} style={styles.groupImage} />
              ) : (
                <View style={[styles.placeholderImage, { backgroundColor: theme.searchBg }]}>
                  <Ionicons name="image-outline" size={40} color={theme.textSecondary} />
                </View>
              )}
              <View style={[styles.editImageButton, { backgroundColor: theme.primary }]}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.label, { color: theme.text }]}>Group Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.searchBg,
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Enter group name"
              placeholderTextColor={theme.textSecondary}
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.searchBg,
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Describe your group's purpose"
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.searchBg,
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Enter group category"
              placeholderTextColor={theme.textSecondary}
              value={category}
              onChangeText={setCategory}
            />

            <Text style={[styles.label, { color: theme.text }]}>Guidelines</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.searchBg,
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Enter group guidelines (optional)"
              placeholderTextColor={theme.textSecondary}
              value={guidelines}
              onChangeText={setGuidelines}
              multiline
              numberOfLines={4}
            />

            <View style={styles.privacyContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Private Group</Text>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: '#767577', true: theme.primary }}
              />
            </View>
            
            <Text style={[styles.privacyNote, { color: theme.textSecondary }]}>
              {isPrivate 
                ? 'Only approved members can see and join this group'
                : 'Anyone can see and request to join this group'}
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.primary }]}
            onPress={handleCreateGroup}
          >
            <Text style={styles.createButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageSection: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  groupImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  section: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  privacyNote: {
    fontSize: 14,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 