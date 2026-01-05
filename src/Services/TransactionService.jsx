import axios from 'axios';

const STOCK_URL = 'http://localhost:9191/invent/stock';
const TRANS_URL = 'http://localhost:9191/invent/trans';
const ANA_URL = 'http://localhost:9191/invent/analytics';



export const saveTransaction = (transaction) => {
            return axios.post(STOCK_URL, transaction, {
                        withCredentials: true
            });
}

export const findTransactionsByProductId = (id) => {
            return axios.get(`${STOCK_URL}/${id}`, {
                        withCredentials: true
            });
}

export const showAllTransactions = () => {
            return axios.get(STOCK_URL, {
                        withCredentials: true
            });
}



export const removeTransaction = (id) => {
            return axios.delete(`${STOCK_URL}/${id}`, {
                        withCredentials: true
            });
}

export const transactionIdGenerator = () => {
            return axios.get(`${TRANS_URL}/generate`, {
                        withCredentials: true
            });
}

export const findTransactionsByType = (type) => {
            return axios.get(`${TRANS_URL}/type/${type}`, {
                        withCredentials: true
            });
}


export const getDemandByProduct = (id) => {
            return axios.get(`${ANA_URL}/${id}`, {
                        withCredentials: true
            });
}