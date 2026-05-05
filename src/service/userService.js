import { api } from "src/boot/axios";

// view account details
export const viewUserDetails = async(userId) =>{

    return await api.get(`user/view/account/${userId}`)

}

// updating  user credentails role,
export const updateUserAccount = async(payload) =>{

    return await api.post('user/edit',payload)

}

// reset password user
export const resetPassword = async (userId) => {
  return await api.post(`user/reset-password/${userId}`) // ✅ pass userId in URL
}