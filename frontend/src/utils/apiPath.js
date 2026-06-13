const BASE_URL='https://expiry-item-tracking.onrender.com/api'

export const API_PATHS = {
    AUTH:{
        REGISTER:`${BASE_URL}/auth/register`,
        LOGIN:`${BASE_URL}/auth/login`
    },
    HOUSEHOLD:{
        CREATE:`${BASE_URL}/households`,
        JOIN:`${BASE_URL}/households/join`,
        MY:`${BASE_URL}/households/me`,
        ALL:(id)=>`${BASE_URL}/households/${id}/members`
    },
    ITEM:{
        GET:`${BASE_URL}/items`,
        CREATE:`${BASE_URL}/items`,
        UPDATE:(id)=>`${BASE_URL}/items/${id}`,
        MARK:(id)=>`${BASE_URL}/items/${id}/status`,
        DELETE:(id)=>`${BASE_URL}/items/${id}`
    },
    DASHBOARD:{
        WASTE:`${BASE_URL}/dashboard/stats`,
        EXPIRING:`${BASE_URL}/dashboard/expiring`
    }
}
