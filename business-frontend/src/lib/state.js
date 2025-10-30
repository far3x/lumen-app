import { getUser, getCompany } from './auth.js';
import api from './api.js';

const state = {
    user: null,
    company: null,
    stats: {
        token_balance: 0,
        current_plan: 'free',
        active_api_key_count: 0,
        team_member_count: 0
    },
    listeners: [],
};

export const stateService = {
    init: () => {
        state.user = getUser();
        state.company = getCompany();
    },

    getState: () => state,

    subscribe: (listener) => {
        state.listeners.push(listener);
        return () => {
            state.listeners = state.listeners.filter(l => l !== listener);
        };
    },

    notify: () => {
        state.listeners.forEach(listener => listener(state));
    },

    setUser: (userData) => {
        state.user = userData;
        stateService.notify();
    },

    setCompany: (companyData) => {
        state.company = companyData;
        stateService.notify();
    },

    setStats: (statsData) => {
        state.stats = statsData;
        if (state.company) {
            state.company.token_balance = statsData.token_balance;
            state.company.plan = statsData.current_plan;
            localStorage.setItem('business_company', JSON.stringify(state.company));
        }
        stateService.notify();
    },

    fetchDashboardStats: async () => {
        try {
            const response = await api.get('/business/dashboard-stats');
            stateService.setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        }
    },
};