import axios from 'axios';

const API_URL = 'http://localhost:9191/invent';
const PROD_URL = 'http://localhost:9191/invent/product';
const STOCK_URL = 'http://localhost:9191/invent/stock';

// Create simple axios instance for product operations (no authentication)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    return Promise.reject(error);
  }
);

// Helper functions for data transformation
const toBackendFormat = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => toBackendFormat(item));
  }
  
  // Convert snake_case to camelCase for backend
  return Object.keys(data).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = data[key];
    return acc;
  }, {});
};

const toFrontendFormat = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => toFrontendFormat(item));
  }
  
  // Convert camelCase to snake_case for frontend
  return Object.keys(data).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = data[key];
    return acc;
  }, {});
};

// Product Service Object
export const ProductService = {
  // Product operations
  getAll: async () => {
    const response = await api.get('/product');
    return { ...response, data: toFrontendFormat(response.data) };
  },
  
  getById: async (id) => {
    const response = await api.get(`/product/${id}`);
    return { ...response, data: toFrontendFormat(response.data) };
  },
  
  create: async (product) => {
    // Send data as-is without field name conversion
    // Backend expects camelCase from frontend
    console.log('Sending product data to backend:', product);
    return api.post('/product', product);
  },
  
  update: async (id, product) => {
    const backendProduct = toBackendFormat(product);
    return api.put(`/product/${id}`, backendProduct);
  },
  
  delete: (id) => api.delete(`/product/${id}`),
  
  // Stock operations
  updateStock: (id, stockData) => {
    return axios.put(`${STOCK_URL}/${id}`, stockData, {
      withCredentials: true
    });
  },
  
  // Price operations
  updatePrice: async (id, priceData) => {
    // First get the current product to preserve other fields
    try {
      const currentProduct = await ProductService.getById(id);
      const fullProductUpdate = {
        ...currentProduct.data,
        purchase_price: priceData.purchase_price,
        sales_price: priceData.sales_price
      };
      const backendData = toBackendFormat(fullProductUpdate);
      return api.put('/product', backendData);
    } catch (error) {
      console.error('Error fetching product for price update:', error);
      throw error;
    }
  },
  
  // ID Generation
  generateId: () => api.get('/id-gen')
};

// For backward compatibility
export const saveNewProduct = (product) => ProductService.create(product);
export const showAProductById = (id) => ProductService.getById(id);
export const getProductById = (id) => ProductService.getById(id);  // Added this export
export const displayAllProducts = async () => {
  try {
    const response = await ProductService.getAll();
    return response;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};


export const editProductPrice = (product) => ProductService.updatePrice(product.product_id, {
  purchase_price: product.purchase_price,
  sales_price: product.sales_price
});

export const editProductStock = (id, stockData) => {
  return ProductService.updateStock(id, stockData);
}

export const deleteAProductById = (id) => ProductService.delete(id);