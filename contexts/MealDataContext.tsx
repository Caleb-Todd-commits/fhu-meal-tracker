import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const CREDENTIALS_KEY = '@fhu_credentials';
const FHU_BASE_URL = 'https://fhu.campuscardcenter.com';

export interface MealSwipeData {
  mealPlan: {
    name: string;
    totalMeals: number;
    totalDiningDollars: number;
  };
  diningDollars: {
    remaining: number;
    total: number;
    renewal: string;
  };
  meals: {
    remaining: number;
    total: number;
    renewal: string;
  };
  lionBucks?: {
    remaining: number;
    total: number;
  };
  lionsPrideExpress: {
    remaining: number;
    total: number;
    renewal: string;
  };
  chickFilA: {
    remaining: number;
    total: number;
    renewal: string;
  };
  guestMeals: {
    remaining: number;
    total: number;
    renewal: string;
  };
  transactions?: Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
    location: string;
  }>;
}

export interface Credentials {
  username: string;
  password: string;
}

interface MealDataContextType {
  data: MealSwipeData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  credentials: Credentials | null;
}

const MealDataContext = createContext<MealDataContextType | undefined>(undefined);

export function MealDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MealSwipeData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [sessionCookie, setSessionCookie] = useState<string | null>(null);

  // Load saved credentials on mount
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const stored = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (stored) {
        const creds = JSON.parse(stored);
        setCredentials(creds);
        // Auto-fetch data if credentials exist
        await fetchDataWithCredentials(creds);
      }
    } catch (err) {
      console.error('Error loading credentials:', err);
    }
  };

  const fetchDataWithCredentials = async (creds: Credentials) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Login to get session
      const loginResponse = await axios.post(
        `${FHU_BASE_URL}/login.php`,
        new URLSearchParams({
          username: creds.username,
          password: creds.password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true,
        }
      );

      // Extract session cookie
      const cookies = loginResponse.headers['set-cookie'];
      if (cookies && cookies.length > 0) {
        setSessionCookie(cookies[0]);
      }

      // Step 2: Fetch account data
      const accountResponse = await axios.get(`${FHU_BASE_URL}/account.php`, {
        headers: {
          Cookie: sessionCookie || '',
        },
        withCredentials: true,
      });

      // Step 3: Parse the HTML response to extract meal data
      const parsedData = parseAccountData(accountResponse.data);

      if (parsedData) {
        setData(parsedData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Failed to parse account data');
      }
    } catch (err) {
      console.error('Error fetching meal data:', err);

      // For now, use mock data if real API fails
      // This allows development to continue while we work on proper API integration
      console.log('Using mock data for development');
      const mockData: MealSwipeData = {
        mealPlan: {
          name: "Meal Plan A",
          totalMeals: 14,
          totalDiningDollars: 175
        },
        diningDollars: {
          remaining: 43.98,
          total: 175,
          renewal: "semester"
        },
        meals: {
          remaining: 6,
          total: 14,
          renewal: "week"
        },
        lionBucks: {
          remaining: 125.50,
          total: 200
        },
        lionsPrideExpress: {
          remaining: 4,
          total: 5,
          renewal: "week"
        },
        chickFilA: {
          remaining: 0,
          total: 2,
          renewal: "week"
        },
        guestMeals: {
          remaining: 4,
          total: 5,
          renewal: "semester"
        },
        transactions: [
          {
            id: '1',
            date: '2025-12-08',
            amount: 12.50,
            description: 'Lunch at Starbucks',
            location: 'Starbucks'
          },
          {
            id: '2',
            date: '2025-12-07',
            amount: 8.75,
            description: 'Coffee and pastry',
            location: 'Starbucks'
          },
          {
            id: '3',
            date: '2025-12-07',
            amount: 15.25,
            description: 'Dinner',
            location: 'LP'
          },
          {
            id: '4',
            date: '2025-12-06',
            amount: 10.00,
            description: 'Chicken sandwich',
            location: 'CFA'
          },
          {
            id: '5',
            date: '2025-12-06',
            amount: 7.50,
            description: 'Snacks',
            location: 'Jones'
          }
        ]
      };

      setData(mockData);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const parseAccountData = (html: string): MealSwipeData | null => {
    try {
      // This function will parse the HTML from the FHU website
      // You'll need to inspect the actual HTML structure to implement this properly
      // For now, return null to fall back to mock data

      // Example parsing logic (adjust based on actual HTML structure):
      // const $ = cheerio.load(html);
      // const mealsRemaining = parseInt($('.meals-remaining').text());
      // const diningDollars = parseFloat($('.dining-dollars').text());
      // etc.

      return null;
    } catch (err) {
      console.error('Error parsing account data:', err);
      return null;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    if (!username || !password) {
      setError('Username and password are required');
      return false;
    }

    const creds: Credentials = { username, password };

    try {
      // Save credentials
      await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
      setCredentials(creds);

      // Fetch data
      await fetchDataWithCredentials(creds);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CREDENTIALS_KEY);
      setCredentials(null);
      setData(null);
      setIsAuthenticated(false);
      setError(null);
      setSessionCookie(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const refresh = async (): Promise<void> => {
    if (credentials) {
      await fetchDataWithCredentials(credentials);
    }
  };

  const value: MealDataContextType = {
    data,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refresh,
    credentials,
  };

  return (
    <MealDataContext.Provider value={value}>
      {children}
    </MealDataContext.Provider>
  );
}

export function useMealData(): MealDataContextType {
  const context = useContext(MealDataContext);
  if (context === undefined) {
    throw new Error('useMealData must be used within a MealDataProvider');
  }
  return context;
}
