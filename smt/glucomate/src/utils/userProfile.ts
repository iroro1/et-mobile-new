import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_NAME_KEY = "user_name";

/**
 * Get user's name from storage
 */
export const getUserName = async (): Promise<string | null> => {
  try {
    const name = await AsyncStorage.getItem(USER_NAME_KEY);
    return name;
  } catch (error) {
    console.error("Error getting user name:", error);
    return null;
  }
};

/**
 * Save user's name to storage
 */
export const saveUserName = async (name: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(USER_NAME_KEY, name.trim());
    return true;
  } catch (error) {
    console.error("Error saving user name:", error);
    return false;
  }
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

/**
 * Get personalized greeting with name
 */
export const getPersonalizedGreeting = async (): Promise<string> => {
  const greeting = getGreeting();
  const name = await getUserName();

  if (name) {
    return `${greeting}, ${name}! 👋`;
  }

  return `${greeting}! 👋`;
};
