/* eslint-disable react-hooks/exhaustive-deps */
import React, {
    createContext,
    useReducer, useContext,
    ReactNode,
} from 'react';
import { Action_Type, User, UserContextType } from '@/shared/types';
import { useClient } from '@/shared/client';
import { useQuery } from '@tanstack/react-query';
import AppLoader from '../components/shared/AppLoader';
import { LCPD_ESCROW_SYS_USER_TOKEN, removeUserToken, toast, userToken } from '@/shared/helpers';


const UserContext = createContext<UserContextType>({});

const userReducer = (state: any, action: { payload?: any, type: Action_Type }) => {
    switch (action.type) {
        case Action_Type.USER_PROFILE:
            localStorage.setItem(LCPD_ESCROW_SYS_USER_TOKEN,
                action.payload.token ?? state?.token)
            return {
                ...state, ...action.payload,
                isLoggedIn: true
            };
        case Action_Type.LOGOUT_USER:
            removeUserToken()
            return null;
        default:
            return null
    }
}

const UserContextProvider = ({ children }: { children: ReactNode }) => {

    //user info
    const [user, userDispatch] = useReducer(userReducer, null, function () { })

    const contextValue: UserContextType = {
        user,
        isLoggedIn: user?.isLoggedIn,
        userDispatch: userDispatch as React.Dispatch<{ payload?: any; type: Action_Type }>,
    };

    const client = useClient()

    const token = userToken()

    const { data, isLoading } = useQuery({
        queryKey: ["currentuserprofile"],
        queryFn: async () => client().get("/users/profile").then(res => {
            return res.data?.result as User
        }).catch(err => {
            userDispatch({
                type: Action_Type.LOGOUT_USER,
            })
            if (!token) {
                toast(err?.response?.data?.message).error()
            }
        }),
        enabled: !!localStorage.getItem(LCPD_ESCROW_SYS_USER_TOKEN)
    })

    if (data && !user?.name) {
        userDispatch({
            type: Action_Type.USER_PROFILE,
            payload: { ...data as User, token }
        })
    }



    return (
        <UserContext.Provider value={contextValue}>
            {isLoading && <AppLoader />}
            {!isLoading && children}
        </UserContext.Provider>
    )

}

export default UserContextProvider;


export const useUserContext = () => useContext(UserContext);