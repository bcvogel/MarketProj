import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const fetchStocks = async () => {
    const response = await axios.get(`${API_BASE_URL}/stocks`);
    return response.data;
};

export const buyStock = async (userId, stockId, quantity) => {
    return axios.post(`${API_BASE_URL}/buy`, {
        user_id: userId,
        stock_id: stockId,
        quantity: quantity,
    });
};