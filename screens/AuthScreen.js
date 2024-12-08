import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { supabase } from "../lib/supabase";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function AuthScreen() {
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (isLoading) return;

    if (!isLogin && (!formData.firstName.trim() || !formData.lastName.trim())) {
      Alert.alert("Error", "Please enter your first and last name");
      return;
    }

    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            },
          },
        });
        if (signUpError) throw signUpError;

        Alert.alert(
          "Success",
          "Please check your email to verify your account"
        );
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInUp.delay(200).duration(1000).springify()}
            style={styles.header}
          >
            <Text style={[styles.title, { color: theme.text }]}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {isLogin
                ? "Sign in to continue"
                : "Sign up to start your journey"}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(1000).springify()}
            style={styles.form}
          >
            {!isLogin && (
              <>
                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: theme.card },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="First Name"
                    placeholderTextColor={theme.textSecondary}
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, firstName: text })
                    }
                    autoCapitalize="words"
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: theme.card },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Last Name"
                    placeholderTextColor={theme.textSecondary}
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lastName: text })
                    }
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

            <View
              style={[styles.inputContainer, { backgroundColor: theme.card }]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View
              style={[styles.inputContainer, { backgroundColor: theme.card }]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View
                style={[styles.inputContainer, { backgroundColor: theme.card }]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.textSecondary}
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  secureTextEntry={!showPassword}
                />
              </View>
            )}

            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text
                  style={[styles.forgotPasswordText, { color: theme.primary }]}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? "Sign In" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchAuth}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text
                style={[styles.switchAuthText, { color: theme.textSecondary }]}
              >
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Text style={{ color: theme.primary, fontWeight: "600" }}>
                  {isLogin ? "Sign Up" : "Sign In"}
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  switchAuth: {
    marginTop: 24,
    alignItems: "center",
  },
  switchAuthText: {
    fontSize: 14,
  },
});
