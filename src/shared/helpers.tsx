import { notifications } from "@mantine/notifications";
import { jwtDecode } from "jwt-decode";
import { Gear, Handshake, HouseLine, ShoppingCart, SquaresFour, User as UserIcon, Wallet } from '@phosphor-icons/react';


export const toast = (message: string, title?: string) => {
    return {
        success: () => notifications.show({
            color: "green",
            title: title ? title : 'Success',
            message,
            withBorder: true,
            // autoClose: 5000
        }),
        error: () => notifications.show({
            color: "red",
            title: title ? title : 'Failed',
            message: message ?? "Something went wrong!",
            withBorder: true,
        })
    }
}

export const FRONTEND_URL = "https://delegatecapturepro.pw"

export const imageUrl = "https://delegatecapturepro.pw/img/profile.png"

export const LCPD_ESCROW_SYS_USER_TOKEN = 'LCPD_ESCROW_SYS_USER_TOKEN';

export const userToken = () => localStorage.getItem(LCPD_ESCROW_SYS_USER_TOKEN)
export const removeUserToken = () => localStorage.removeItem(LCPD_ESCROW_SYS_USER_TOKEN)

export function decodeUserToken(token: string) {
    try {
        const decoded: any = { ...jwtDecode(token) }
        if (token) return { ...decoded, token }
        else return null;
    }
    catch (ex) {
        console.log(ex)
    }
}

export function getRandomItems<T>(data: T[], length: number) {
    const shuffledArray = data.slice();
    shuffledArray.sort(() => Math.random() - 0.5);
    return shuffledArray.slice(0, length);

}

export const inputStyles = {
    // backgroundColor: 'rgba(0, 160, 30, 0.25)',
    fontSize: "16px",
    // borderRadius:30,
    // height:50,
    fontWeight: 400,
    ':focus': {
        border: "2px solid rgba(0, 160, 30, 0.25)"
    }
}

export const inputStyles2 = {
    border: "none",
    borderBottom: ".7px solid rgba(204, 204, 204, 1)",
    borderRadius: 0,
    ':focus': {
        borderBottom: "2px solid rgba(0, 160, 30, 0.25)"
    }
}

export function isJSONStringRegex(str: string) {
    return /^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''));
}

export const convertAmount = (amount: number) => amount ? amount.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0

export function getInitials(name: string) {
    const firstName = name.toUpperCase()?.split(" ")[0]
    const lastName = name.toUpperCase()?.split(" ")[1]
    if (firstName && lastName) return firstName[0] + lastName[0];
    return firstName[0] + firstName[1]
}


export const menuData = [
    {
        link: '',
        label: 'Dashboard',
        icon: SquaresFour
    },
    {
        link: '',
        label: 'Orders',
        icon: ShoppingCart
    },
    {
        link: '',
        label: 'Settings',
        icon: Gear
    },
];

