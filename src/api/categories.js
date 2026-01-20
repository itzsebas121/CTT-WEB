import api from "./api"

export const getCategoriesEnabled = async () => {
    const response = await api.get("/categories/enabled",{
        headers: {
            "Content-Type": "application/json"
        }
    })
    return response.data
}