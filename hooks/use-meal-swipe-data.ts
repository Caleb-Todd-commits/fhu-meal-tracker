import type { CheerioAPI } from "cheerio";
import * as cheerio from "cheerio/slim";
import { useCallback, useState, useEffect } from "react";
import * as SecureStore from 'expo-secure-store';

const CREDENTIALS_KEY = 'fhu_credentials';
const USERNAME_KEY = 'fhu_username';

interface MealPlan {
  name: string;
  totalMeals: number;
  totalDiningDollars: number;
  totalGuestSwipes: number;
}

interface MealTransaction {
  date: string;
  time: string;
  description: string;
  account: string;
  amount: string;
}

interface RawMealSwipeData {
  diningDollars: string | null;
  lionBucks: string | null;
  mealSwipes: string | null;
  guestSwipes: string | null;
  transactions: MealTransaction[];
  mealPlan: MealPlan;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface UseMealSwipeDataReturn {
  diningDollars: string | null;
  lionBucks: string | null;
  mealSwipes: string | null;
  guestSwipes: string | null;
  transactions: MealTransaction[];
  mealPlan: MealPlan | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  fetchMealData: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  credentials: Credentials | null;
}

export function useMealSwipeData(): UseMealSwipeDataReturn {
  const [diningDollars, setDiningDollars] = useState<string | null>(null);
  const [lionBucks, setLionBucks] = useState<string | null>(null);
  const [mealSwipes, setMealSwipes] = useState<string | null>(null);
  const [guestSwipes, setGuestSwipes] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [transactions, setTransactions] = useState<MealTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  // Load saved credentials on mount
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      // Retrieve encrypted credentials from SecureStore
      const storedUsername = await SecureStore.getItemAsync(USERNAME_KEY);
      const storedPassword = await SecureStore.getItemAsync(CREDENTIALS_KEY);

      if (storedUsername && storedPassword) {
        const creds = { username: storedUsername, password: storedPassword };
        setCredentials(creds);
        setIsAuthenticated(true);
        // Auto-fetch data if credentials exist
        await fetchMealData(creds.username, creds.password);
      }
    } catch (err) {
      console.error('Error loading credentials:', err);
    }
  };

  const scrapeWithLogin = useCallback(
    async (username: string, password: string): Promise<string> => {
      try {
        const URLParametersString = new URLSearchParams({
          username: `${username}`,
          password: `${password}`,
          action: "Login",
        }).toString();

        const baseURL = "https://fhu.campuscardcenter.com/ch/";
        const fullURL =
          baseURL +
          `login.html?username=${username}&password=${password}&action=Login`;

        // Step 1: Login
        const loginResponse = await fetch(fullURL, {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: URLParametersString,
        });

        if (!loginResponse.ok) {
          const responseText = await loginResponse.text();
          console.log("Response body:", responseText);
          throw new Error(`Login failed with status: ${loginResponse.status}`);
        }

        // Step 2: Reload the homepage
        const reloadResponse = await fetch(baseURL, {
          method: "GET",
        });

        const htmlText = await reloadResponse.text();
        return htmlText;
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.name);
          console.error(error.message);
        }
        throw error;
      }
    },
    []
  );

  const extractData = (htmlString: string): RawMealSwipeData => {
    const $: CheerioAPI = cheerio.load(htmlString);
    const data = $("div[align=right]")
      .map((_, el) =>
        $(el)
          .text()
          .replace(/\u00A0/g, " ") // replace non-breaking space char with space
          .trim()
      )
      .get();

    // Find all tr elements that have a td with a div that has align="right"
    const rows = $('tr:has(td div[align="right"])');

    let lionBucks = null;
    let diningDollars = null;
    let mealSwipes = null;
    let guestSwipes = null;
    let mealPlan: MealPlan = {
      name: "",
      totalMeals: 0,
      totalDiningDollars: 0,
      totalGuestSwipes: 0,
    };

    // iterate over each tr
    rows.each((index, row) => {
      // only process the first 4 rows
      if (index > 3) {
        return;
      }

      const tds = $(row)
        .children("td")
        .toArray()
        .map((td) => $(td).text().trim());

      const titleIndex = 1;
      const dataIndex = 3;

      // Safety check: make sure the array has enough elements
      if (!tds[titleIndex] || !tds[dataIndex]) {
        return;
      }

      if (tds[titleIndex].includes("Lion Bucks")) {
        lionBucks = tds[dataIndex];
      } else if (tds[titleIndex].includes("Guest Meals")) {
        guestSwipes = tds[dataIndex];
      } else if (tds[titleIndex].includes("DD")) {
        diningDollars = tds[dataIndex];
      } else if (tds[titleIndex].includes("MPA 14 Weekly Meals")) {
        mealSwipes = tds[dataIndex];
        mealPlan.name = "Meal Plan A";
        mealPlan.totalDiningDollars = 175;
        mealPlan.totalMeals = 14;
        mealPlan.totalGuestSwipes = 5;
      } else if (tds[titleIndex].includes("MPB 10 Weekly Meals")) {
        mealSwipes = tds[dataIndex];
        mealPlan.name = "Meal Plan B";
        mealPlan.totalDiningDollars = 275;
        mealPlan.totalMeals = 10;
        mealPlan.totalGuestSwipes = 10;
      } else if (tds[titleIndex].includes("MPC 80 Meals")) {
        mealSwipes = tds[dataIndex];
        mealPlan.name = "Meal Plan C";
        mealPlan.totalDiningDollars = 125;
        mealPlan.totalMeals = 80;
        mealPlan.totalGuestSwipes = 5;
      } else if (tds[titleIndex].includes("MPU 19 Meals")) {
        mealSwipes = tds[dataIndex];
        mealPlan.name = "Meal Plan U";
        mealPlan.totalDiningDollars = 300;
        mealPlan.totalMeals = 19;
        mealPlan.totalGuestSwipes = 15;
      }
    });

    console.log(
      `${JSON.stringify(
        mealPlan
      )} ${mealSwipes} | ${guestSwipes} | ${diningDollars} | ${lionBucks}`
    );

    const transactions = $("tr#EntryRow")
      .toArray()
      .map((tr) => {
        const tds = $(tr)
          .children("td")
          .toArray()
          .map((td) => $(td).text().trim());

        return {
          date: tds[0] ?? "",
          time: tds[1] ?? "",
          description: tds[2] ?? "",
          account: tds[3] ?? "",
          amount: tds[5] ?? "",
        };
      });

    return {
      diningDollars,
      lionBucks,
      mealSwipes,
      guestSwipes,
      transactions,
      mealPlan,
    };
  };

  const fetchMealData = useCallback(
    async (username: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const html = await scrapeWithLogin(username, password);
        const {
          diningDollars,
          lionBucks,
          mealSwipes,
          guestSwipes,
          transactions,
          mealPlan,
        } = extractData(html);
        setDiningDollars(diningDollars);
        setLionBucks(lionBucks);
        setMealSwipes(mealSwipes);
        setGuestSwipes(guestSwipes);
        setTransactions(transactions);
        setMealPlan(mealPlan);
        setIsAuthenticated(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error(err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    },
    [scrapeWithLogin]
  );

  const login = async (username: string, password: string): Promise<boolean> => {
    if (!username || !password) {
      setError('Username and password are required');
      return false;
    }

    const creds: Credentials = { username, password };

    try {
      // Save credentials securely using SecureStore (hardware-backed encryption on supported devices)
      await SecureStore.setItemAsync(USERNAME_KEY, username);
      await SecureStore.setItemAsync(CREDENTIALS_KEY, password);
      setCredentials(creds);

      // Fetch data
      await fetchMealData(username, password);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Securely delete stored credentials
      await SecureStore.deleteItemAsync(USERNAME_KEY);
      await SecureStore.deleteItemAsync(CREDENTIALS_KEY);

      // Clear all state
      setCredentials(null);
      setDiningDollars(null);
      setLionBucks(null);
      setMealSwipes(null);
      setGuestSwipes(null);
      setMealPlan(null);
      setTransactions([]);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const refresh = async (): Promise<void> => {
    if (credentials) {
      await fetchMealData(credentials.username, credentials.password);
    }
  };

  return {
    diningDollars,
    lionBucks,
    mealSwipes,
    guestSwipes,
    transactions,
    mealPlan,
    isLoading,
    error,
    isAuthenticated,
    fetchMealData,
    login,
    logout,
    refresh,
    credentials,
  };
}
