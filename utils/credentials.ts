import { users } from '../data/user_data';

/**
 * Utility function to retrieve user credentials based on the user type. It fetches the username from a predefined users object and retrieves the password from environment variables, defaulting
 * @param userType - The type of user for which to retrieve credentials (e.g., 'standard_user', 'locked_out_user', etc.). The user types should be defined in the users object imported from '../data/user_data'.
 * @returns An object containing the username and password for the specified user type. The password is retrieved from environment variables (SAUCE_DEMO_PASSWORD) or defaults
 */
export const getUserCredentials = (userType: keyof typeof users) => {
    const username = users[userType].username;
    const password = process.env.SAUCE_DEMO_PASSWORD || '';

    return { username, password };
}
