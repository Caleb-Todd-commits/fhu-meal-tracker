import { useEffect } from "react";
import { StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import ProgressBar from "@/components/ProgressBar";
import { Text, View } from "@/components/Themed";
import { useMealSwipeData } from "@/hooks/use-meal-swipe-data";

export default function DashboardScreen() {
  const {
    mealSwipes,
    diningDollars,
    lionBucks,
    guestSwipes,
    mealPlan,
    isLoading,
    isAuthenticated,
    refresh
  } = useMealSwipeData();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(tabs)/login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading && !mealSwipes) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your meal data...</Text>
      </View>
    );
  }

  if (!mealSwipes && !diningDollars) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No data available</Text>
      </View>
    );
  }

  // Parse the string values
  const mealsRemaining = parseInt(mealSwipes || '0');
  const mealsTotal = mealPlan?.totalMeals || 14;
  const diningDollarsRemaining = parseFloat(diningDollars?.replace('$', '') || '0');
  const diningDollarsTotal = mealPlan?.totalDiningDollars || 175;
  const lionBucksRemaining = parseFloat(lionBucks?.replace('$', '') || '0');
  const guestSwipesRemaining = parseInt(guestSwipes || '0');
  const guestSwipesTotal = mealPlan?.totalGuestSwipes || 5;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refresh} />
      }
    >
      <View style={[styles.header, { backgroundColor: '#0B1220' }]}>
        <Text style={styles.title}>Dashboard</Text>
        {mealPlan && (
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{mealPlan.name}</Text>
          </View>
        )}
      </View>

      <View style={[styles.cardsContainer, { backgroundColor: '#0B1220' }]}>
        <View style={[styles.card, { backgroundColor: '#111827' }]}>
          <View style={[styles.cardHeader, { backgroundColor: '#111827' }]}>
            <Text style={styles.cardTitle}>Meal Swipes</Text>
            <Text style={styles.cardAmount}>{mealsRemaining}/{mealsTotal}</Text>
          </View>
          <ProgressBar
            title=""
            percentage={(mealsRemaining / mealsTotal) * 100}
          />
        </View>

        <View style={[styles.card, { backgroundColor: '#111827' }]}>
          <View style={[styles.cardHeader, { backgroundColor: '#111827' }]}>
            <Text style={styles.cardTitle}>Dining Dollars</Text>
            <Text style={styles.cardAmount}>${diningDollarsRemaining.toFixed(2)}/${diningDollarsTotal}</Text>
          </View>
          <ProgressBar
            title=""
            percentage={(diningDollarsRemaining / diningDollarsTotal) * 100}
          />
        </View>

        <View style={[styles.card, { backgroundColor: '#111827' }]}>
          <View style={[styles.cardHeader, { backgroundColor: '#111827' }]}>
            <Text style={styles.cardTitle}>Guest Swipes</Text>
            <Text style={styles.cardAmount}>{guestSwipesRemaining}/{guestSwipesTotal}</Text>
          </View>
          <ProgressBar
            title=""
            percentage={(guestSwipesRemaining / guestSwipesTotal) * 100}
          />
        </View>

        {lionBucks && (
          <View style={[styles.card, { backgroundColor: '#111827' }]}>
            <View style={[styles.cardHeader, { backgroundColor: '#111827' }]}>
              <Text style={styles.cardTitle}>Lion Bucks</Text>
              <Text style={styles.cardAmount}>${lionBucksRemaining.toFixed(2)}</Text>
            </View>
            <ProgressBar
              title=""
              percentage={lionBucksRemaining > 0 ? 100 : 0}
            />
          </View>
        )}
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
    backgroundColor: '#0B1220',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1220',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: '#FFFFFF',
  },
  planBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  planBadgeText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    letterSpacing: 0.3,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#D1D5DB',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
  },
});
