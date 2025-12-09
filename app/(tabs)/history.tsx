import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import {
  Pressable,
  RefreshControl,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useMealSwipeData } from '@/hooks/use-meal-swipe-data';

// ---------- Utilities ----------
const CURRENCY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});
const prettyDate = (dateStr:string) => {
  // Handle various date formats from FHU website (e.g., "12/07/2024" or "2024-12-07")
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return dateStr; // Return original if parsing fails
  }
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};
const sectionTotal = (section) => section.data.reduce((sum, t) => sum + (t.amount || 0), 0);

// ---------- Styling ----------
const TAG_STYLES = {
  Starbucks: { bg: '#F3E8FF', text: '#6B21A8' },
  LP:        { bg: '#FFE8EC', text: '#8B2635' },
  CFA:       { bg: '#FEF3C7', text: '#92400E' },
  Jones:     { bg: '#E8E8E8', text: '#4A4A4A' },
  'MPA 14 Weekly Meals': { bg: '#FFE8EC', text: '#8B2635' },
  'MPB 10 Weekly Meals': { bg: '#FFE8EC', text: '#8B2635' },
  'MPC 80 Meals': { bg: '#FFE8EC', text: '#8B2635' },
  'MPU 19 Meals': { bg: '#FFE8EC', text: '#8B2635' },
  'Guest Meals': { bg: '#E8E8E8', text: '#4A4A4A' },
  'DD': { bg: '#FFE8EC', text: '#8B2635' },
};
const ALL_TAGS = ['All', 'Starbucks', 'LP', 'CFA', 'Jones'];

// ---------- Sample Data (10 days, 3–6 txns/day) ----------
const BASE_SECTIONS = [
  { date: '2025-09-29', data: [
    { id: '0929-1', amount: 6.45,  description: 'Iced latte', tag: 'Starbucks' },
    { id: '0929-2', amount: 42.18, description: 'Groceries (fill-in trip)', tag: 'LP' },
    { id: '0929-3', amount: 12.00, description: 'Chicken sandwich combo', tag: 'CFA' },
    { id: '0929-4', amount: 85.00, description: 'Dry cleaning pickup', tag: 'Jones' },
  ]},
  { date: '2025-09-28', data: [
    { id: '0928-1', amount: 5.15,  description: 'Americano', tag: 'Starbucks' },
    { id: '0928-2', amount: 9.76,  description: 'Breakfast biscuit + tea', tag: 'CFA' },
    { id: '0928-3', amount: 31.49, description: 'Household odds & ends', tag: 'Jones' },
  ]},
  { date: '2025-09-27', data: [
    { id: '0927-1', amount: 7.10,  description: 'Pumpkin cream cold brew', tag: 'Starbucks' },
    { id: '0927-2', amount: 58.89, description: 'Weekly groceries', tag: 'LP' },
    { id: '0927-3', amount: 14.20, description: 'Spicy deluxe + fries', tag: 'CFA' },
    { id: '0927-4', amount: 22.00, description: 'Hardware store run', tag: 'Jones' },
    { id: '0927-5', amount: 4.25,  description: 'Espresso shot', tag: 'Starbucks' },
  ]},
  { date: '2025-09-26', data: [
    { id: '0926-1', amount: 4.95,  description: 'Drip coffee', tag: 'Starbucks' },
    { id: '0926-2', amount: 11.75, description: 'Nuggets + lemonade', tag: 'CFA' },
    { id: '0926-3', amount: 19.99, description: 'Laundry detergent', tag: 'LP' },
    { id: '0926-4', amount: 13.60, description: 'Picture frames', tag: 'Jones' },
  ]},
  { date: '2025-09-25', data: [
    { id: '0925-1', amount: 6.85,  description: 'Caramel macchiato', tag: 'Starbucks' },
    { id: '0925-2', amount: 38.22, description: 'Produce + dairy', tag: 'LP' },
    { id: '0925-3', amount: 10.75, description: 'Grilled chicken wrap', tag: 'CFA' },
  ]},
  { date: '2025-09-24', data: [
    { id: '0924-1', amount: 5.45,  description: 'Flat white', tag: 'Starbucks' },
    { id: '0924-2', amount: 27.19, description: 'Kitchen towels', tag: 'Jones' },
    { id: '0924-3', amount: 62.14, description: 'Big grocery haul', tag: 'LP' },
    { id: '0924-4', amount: 8.50,  description: 'Waffle fries + shake', tag: 'CFA' },
    { id: '0924-5', amount: 3.95,  description: 'Brewed refill', tag: 'Starbucks' },
  ]},
  { date: '2025-09-23', data: [
    { id: '0923-1', amount: 4.65,  description: 'Pike Place', tag: 'Starbucks' },
    { id: '0923-2', amount: 16.30, description: 'Desk organizer', tag: 'Jones' },
    { id: '0923-3', amount: 54.02, description: 'Mid-week groceries', tag: 'LP' },
    { id: '0923-4', amount: 9.10,  description: 'Chicken minis', tag: 'CFA' },
  ]},
  { date: '2025-09-22', data: [
    { id: '0922-1', amount: 5.95,  description: 'Cappuccino', tag: 'Starbucks' },
    { id: '0922-2', amount: 7.89,  description: 'Kids meal', tag: 'CFA' },
    { id: '0922-3', amount: 29.40, description: 'Plant & pot', tag: 'Jones' },
    { id: '0922-4', amount: 45.70, description: 'Groceries', tag: 'LP' },
    { id: '0922-5', amount: 2.95,  description: 'Refill', tag: 'Starbucks' },
  ]},
  { date: '2025-09-21', data: [
    { id: '0921-1', amount: 6.15,  description: 'Mocha', tag: 'Starbucks' },
    { id: '0921-2', amount: 33.10, description: 'Light grocery top-up', tag: 'LP' },
    { id: '0921-3', amount: 21.00, description: 'Photo frames', tag: 'Jones' },
    { id: '0921-4', amount: 12.40, description: 'Spicy sandwich', tag: 'CFA' },
  ]},
  { date: '2025-09-20', data: [
    { id: '0920-1', amount: 4.25,  description: 'Cold brew', tag: 'Starbucks' },
    { id: '0920-2', amount: 59.84, description: 'Weekly groceries', tag: 'LP' },
    { id: '0920-3', amount: 15.60, description: 'Nuggets + fries', tag: 'CFA' },
    { id: '0920-4', amount: 18.50, description: 'Extension cord + bulbs', tag: 'Jones' },
    { id: '0920-5', amount: 3.75,  description: 'Espresso', tag: 'Starbucks' },
    { id: '0920-6', amount: 9.25,  description: 'Milkshake', tag: 'CFA' },
  ]},
];

// ---------- UI Bits ----------
const TagChip = memo(function TagChip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
});

const Tag = memo(function Tag({ value }: { value: string }) {
  const style = TAG_STYLES[value as keyof typeof TAG_STYLES] || { bg: '#E5E7EB', text: '#111827' };
  return (
    <View style={[styles.tag, { backgroundColor: style.bg }]}>
      <Text style={[styles.tagText, { color: style.text }]}>{value}</Text>
    </View>
  );
});

const TransactionRow = memo(function TransactionRow({ item }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
        <Tag value={item.tag} />
      </View>
      <Text style={styles.amount}>{CURRENCY.format(item.amount)}</Text>
    </View>
  );
});

const SectionHeader = memo(function SectionHeader({ title, total }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionTotal}>{CURRENCY.format(total)}</Text>
    </View>
  );
});

// ---------- Main Component ----------
export default function TransactionsSectionList() {
  const { transactions, isLoading, refresh } = useMealSwipeData();
  const [sections, setSections] = useState(BASE_SECTIONS);
  const [activeTag, setActiveTag] = useState('All');

  // Update sections when data changes
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Group transactions by date
      const grouped = transactions.reduce((acc: any, txn: any) => {
        const date = txn.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        // Parse amount string to number
        const amountNum = parseFloat(txn.amount.replace('$', '').replace('-', ''));
        acc[date].push({
          id: `${date}-${txn.time}`,
          amount: amountNum,
          description: txn.description,
          tag: txn.account,
        });
        return acc;
      }, {});

      // Convert to sections array
      const newSections = Object.keys(grouped)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map(date => ({
          date,
          data: grouped[date],
        }));

      setSections(newSections.length > 0 ? newSections : BASE_SECTIONS);
    }
  }, [transactions]);

  // Filter sections by tag (and drop empty sections)
  const filtered = useMemo(() => {
    const tag = activeTag === 'All' ? null : activeTag;
    const mapped = sections.map((s) => {
      const data = tag ? s.data.filter((t) => t.tag === tag) : s.data;
      return { ...s, data, title: prettyDate(s.date), _total: data.reduce((sum, t) => sum + t.amount, 0) };
    });
    return mapped.filter((s) => s.data.length > 0);
  }, [sections, activeTag]);

  const grandTotal = useMemo(
    () => filtered.reduce((sum, s) => sum + s._total, 0),
    [filtered]
  );

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  // Memoized renderers to reduce re-renders
  const renderItem = useCallback(({ item }) => <TransactionRow item={item} />, []);
  const renderSectionHeader = useCallback(
    ({ section }) => <SectionHeader title={section.title} total={section._total} />,
    []
  );
  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.listHeader}>
        <Text style={styles.h1}>Transactions</Text>
        <Text style={styles.subtitle}>
          {activeTag === 'All' ? 'Last 10 days' : `${activeTag} • Last 10 days`}
        </Text>

        {/* Tag filter row */}
        <View style={styles.chipsRow}>
          {ALL_TAGS.map((label) => (
            <TagChip
              key={label}
              label={label}
              active={activeTag === label}
              onPress={() => setActiveTag(label)}
            />
          ))}
        </View>
      </View>

      {/* List */}
      <SectionList
        sections={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={() => <View style={styles.itemSep} />}
        SectionSeparatorComponent={() => <View style={styles.sectionSep} />}

        // Pull-to-refresh
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#E5E7EB"  />
        }

        // Perf knobs
        initialNumToRender={24}
        maxToRenderPerBatch={24}
        updateCellsBatchingPeriod={16}
        windowSize={8}
        removeClippedSubviews
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}

        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {`Total (${filtered.length} day${filtered.length === 1 ? '' : 's'}): `}
              <Text style={styles.footerStrong}>{CURRENCY.format(grandTotal)}</Text>
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1220' },

  listContent: { paddingBottom: 24 },

  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  h1: { color: 'white', fontSize: 24, fontWeight: '700', letterSpacing: 0.2 },
  subtitle: { marginTop: 2, color: '#9CA3AF', fontSize: 13 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#111827',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#374151',
  },
  chipActive: { backgroundColor: '#1F2937', borderColor: '#6B7280' },
  chipText: { color: '#D1D5DB', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#F9FAFB' },

  sectionHeader: {
    backgroundColor: '#0B1220',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: { color: 'white', fontSize: 15, fontWeight: '700' },
  sectionTotal: { color: '#D1D5DB', fontSize: 13, fontVariant: ['tabular-nums'] },

  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: { flex: 1, paddingRight: 12 },
  desc: { color: 'white', fontSize: 16, marginBottom: 6 },
  amount: { color: 'white', fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },

  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  tagText: { fontSize: 12, fontWeight: '700' },

  itemSep: { height: StyleSheet.hairlineWidth, backgroundColor: '#1F2937', marginLeft: 16 },
  sectionSep: { height: 10 },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1F2937',
    marginTop: 8,
  },
  footerText: { color: '#9CA3AF', fontSize: 14 },
  footerStrong: { color: '#E5E7EB', fontWeight: '700' },
});