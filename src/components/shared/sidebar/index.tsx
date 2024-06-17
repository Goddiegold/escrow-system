import { useEffect, useState } from 'react';
import classes from './styles.module.css';

import { IoMdLogOut } from 'react-icons/io';
import { menuData, removeUserToken } from '@/shared/helpers';
import { useUserContext } from '@/context/UserContext';
import { Action_Type, user_role } from '@/shared/types';
import { Handshake, UsersFour, Wallet } from '@phosphor-icons/react';
import { useLocation, useNavigate } from 'react-router-dom';

export function NavbarSimpleColored() {
  const { user, userDispatch } = useUserContext()
  const [active, setActive] = useState('Billing');
  const [userMenuData, setMenuData] = useState(menuData)
  const navigate = useNavigate()
  const { pathname } = useLocation()


  useEffect(() => {
    const copyData = [...menuData];
    let position: number = 0;
    let newItem: any[];

    if (user?.role === user_role.vendor) {
      position = 1;
      newItem = [
        {
          link: '',
          label: 'Wallet',
          icon: Wallet
        },
      ]
    }

    if (user?.role === user_role.company) {
      position = 1;
      newItem = [
        {
          link: "/dashboard/registered-vendors",
          label: "Registered Vendors",
          icon: Handshake
        },
        // {
        //   icon: UsersFour,
        //   label: "Customers",
        //   link: ""
        // }
      ]
    }
    copyData.splice(position, 0, ...newItem)
    setMenuData(copyData)
  }, [user]);

  useEffect(() => {
    setActive(pathname)
  }, [pathname])

  const links = userMenuData.map((item) => (
    <a
      className={classes.link}
      data-active={item.link === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        navigate(item.link)
        setActive(item.link);
      }}
    >
      {/* {item.icon} */}
      <item.icon size={20} className={`${classes.linkIcon} text-white`} stroke='1.5' />
      <span>{item.label}</span>
    </a>
  ));


  const handleLogout = () => {
    removeUserToken()
    userDispatch({
      type: Action_Type.LOGOUT_USER,
      payload: null
    })
    navigate("/login")
    // window.location.href = "/login"
  }
  return (
    <>
      <nav className={classes.navbar}>
        <div className={classes.navbarMain}>
          {links}
        </div>

        <div className={classes.footer}>

          <a
            href="#"
            className={classes.link}
            onClick={(event) => {
              event.preventDefault()
              handleLogout()
            }}>
            {/* <IconLogout className={classes.linkIcon} stroke={1.5} /> */}
            <IoMdLogOut className={classes.linkIcon} stroke={`1.5`} />
            <span>Logout</span>
          </a>
        </div>
      </nav>
    </>

  );
}