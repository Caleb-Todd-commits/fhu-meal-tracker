import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useMealSwipeData } from '@/hooks/use-meal-swipe-data';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { mealPlan, credentials, logout } = useMealSwipeData();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(tabs)/login');
          },
        },
      ]
    );
  };

  const handleContact = () => {
    const email = 'ttenon@fhu.edu';
    const subject = 'FHU Meal Tracker Support';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open email app');
        }
      })
      .catch((err) => {
        console.error('Error opening email:', err);
        Alert.alert('Error', 'Unable to open email app');
      });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{credentials?.username || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Password</Text>
            <Text style={styles.value}>{'•'.repeat(8)}</Text>
          </View>
        </View>
      </View>

      {mealPlan && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Plan</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Plan Name</Text>
              <Text style={styles.value}>{mealPlan.name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Total Meals</Text>
              <Text style={styles.value}>{mealPlan.totalMeals} per week</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.label}>Dining Dollars</Text>
              <Text style={styles.value}>${mealPlan.totalDiningDollars} per semester</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.button} onPress={handleContact}>
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>
        <Text style={styles.contactEmail}>ttenon@fhu.edu</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>FHU Meal Tracker v1.0.0</Text>
        <Text style={styles.footerText}>Freed-Hardeman University</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#D1D5DB',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#1F2937',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonText: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '600',
  },
  contactEmail: {
    fontSize: 14,
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#7F1D1D',
    borderColor: '#991B1B',
  },
  logoutButtonText: {
    color: '#FEE2E2',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginVertical: 2,
  },
});
