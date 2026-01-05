// LoginService.jsx
import axios from 'axios';

const API_URL = 'http://localhost:9191/invent';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - completely remove CSRF requirements
api.interceptors.request.use(async (config) => {
  // Skip CSRF for all endpoints - completely remove CSRF requirements
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Removed automatic redirect to login on 403 error
    return Promise.reject(error);
  }
);

// Authentication functions
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('user');
  return api.post('/logout');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const isAuthenticated = () => {
  return !!getCurrentUser();
};

export const getRole = () => {
  return api.get('/role');
};

export const validateUser = (userId, password) => {
  return api.get(`/login/${userId}/${password}`).then(response => {
    if (response.data) {
      localStorage.setItem('userRole', response.data);
    }
    return response;
  });
};

// ADD THIS FUNCTION - It was missing
export const getUserId = () => {
  // Get user ID from localStorage or current user object
  const user = getCurrentUser();
  if (user && user.userId) {
    return Promise.resolve({ data: user.userId });
  }
  
  // Alternative: Get from localStorage directly
  const userId = localStorage.getItem('userId');
  if (userId) {
    return Promise.resolve({ data: userId });
  }
  
  // If no user is logged in, you might want to handle this differently
  // For now, return a default or throw an error
  console.warn('No user ID found, returning default');
  return Promise.resolve({ data: "default-user-id" });
};

export const registerNewUser = (user) => {
  return api.post('/register', user);
};

export const updateUser = (userId, userData) => {
  return api.put(`/user/${userId}`, userData);
};

export const deleteUser = (userId) => {
  return api.delete(`/user/${userId}`);
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const getCurrentUserRole = () => {
  return localStorage.getItem('userRole');
};

export const getUserByRole = async (role) => {
  try {
    console.log(`Fetching users with role: ${role}`);
    const response = await api.get(`/role/${role}`);
    
    console.log('API Response:', response.data);
    
    if (Array.isArray(response.data)) {
      // Handle string array response (like ['java', 'rohit'])
      if (response.data.length > 0 && typeof response.data[0] === 'string') {
        const usersFromStrings = response.data.map((name, index) => ({
          id: index + 1,
          username: name,
          fullName: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
          role: role
        }));
        
        console.log('Processed users from string array:', usersFromStrings);
        return usersFromStrings;
      }
      
      // Handle object array response
      const usersWithNames = response.data.map(user => ({
        ...user,
        id: user.id || user.userId || Math.random(),
        username: user.username || user.email?.split('@')[0] || `user${Math.random()}`,
        fullName: user.fullName || user.name || user.displayName || user.username || `User ${user.id || 'Unknown'}`,
        role: user.role || role
      }));
      
      console.log('Processed users with names:', usersWithNames);
      return usersWithNames;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
};

// Get all users from backend
export const getAllUsers = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    // Return comprehensive test data if API fails
    return [
      { 
        id: 1, 
        username: 'admin1',
        email: 'admin1@example.com',
        role: 'Admin',
        status: 'Active',
        createdAt: '2023-01-01',
        lastLogin: '2023-10-01T10:30:00Z',
        phone: '+1234567890',
        department: 'IT Administration',
        fullName: 'Admin User',
        address: '123 Admin Street, Tech City',
        profileImage: 'https://picsum.photos/seed/admin1/100/100.jpg'
      },
      { 
        id: 2, 
        username: 'vendor1',
        email: 'vendor1@example.com',
        role: 'Vendor',
        status: 'Active',
        createdAt: '2023-02-15',
        lastLogin: '2023-10-05T14:20:00Z',
        phone: '+1234567891',
        department: 'Sales',
        fullName: 'Vendor One',
        address: '456 Vendor Avenue, Business Park',
        profileImage: 'https://picsum.photos/seed/vendor1/100/100.jpg'
      },
      { 
        id: 3, 
        username: 'vendor2',
        email: 'vendor2@example.com',
        role: 'Vendor',
        status: 'Active',
        createdAt: '2023-03-20',
        lastLogin: '2023-10-06T09:15:00Z',
        phone: '+1234567892',
        department: 'Marketing',
        fullName: 'Vendor Two',
        address: '789 Market Lane, Commerce District',
        profileImage: 'https://picsum.photos/seed/vendor2/100/100.jpg'
      },
      { 
        id: 4, 
        username: 'vendor3',
        email: 'vendor3@example.com',
        role: 'Vendor',
        status: 'Inactive',
        createdAt: '2023-04-10',
        lastLogin: '2023-09-15T16:45:00Z',
        phone: '+1234567893',
        department: 'Operations',
        fullName: 'Vendor Three',
        address: '321 Operations Blvd, Industrial Zone',
        profileImage: 'https://picsum.photos/seed/vendor3/100/100.jpg'
      }
    ];
  }
};

// Get user count by role
export const getUserCountByRole = async (role) => {
  try {
    const users = await getUserByRole(role);
    return users.length;
  } catch (error) {
    console.error('Error getting user count by role:', error);
    return 0;

    
  }
};

// Get total user count
export const getTotalUserCount = async () => {
  try {
    const [adminCount, vendorCount] = await Promise.all([
      getUserCountByRole('Admin'),
      getUserCountByRole('Vendor')
    ]);
    return adminCount + vendorCount;
  } catch (error) {
    console.error('Error getting total user count:', error);
    return 0;
  }
};