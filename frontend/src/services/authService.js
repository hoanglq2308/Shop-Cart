import axios from 'axios';

// Thay đổi localhost:8081 bằng cổng đang chạy Backend Spring Boot của bạn
const API_URL = 'http://localhost:8081/api/users';

export const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Lỗi đăng ký');
      }
      throw new Error('Không thể kết nối đến server');
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Lỗi đăng nhập');
      }
      throw new Error('Không thể kết nối đến server');
    }
  }
};