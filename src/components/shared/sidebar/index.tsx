import { useEffect, useState } from 'react';
import classes from './styles.module.css';

import { IoMdLogOut } from 'react-icons/io';
import { menuData } from '@/shared/helpers';
import { useUserContext } from '@/context/UserContext';
import { user_role } from '@/shared/types';
import { Handshake, UsersFour, Wallet } from '@phosphor-icons/react';

export function NavbarSimpleColored() {
  const { user } = useUserContext()
  const [active, setActive] = useState('Billing');
  const [userMenuData, setMenuData] = useState(menuData)


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
          link: "",
          label: "Registered Vendors",
          icon: Handshake
        },
        {
          icon: UsersFour,
          label: "Customers",
          link: ""
        }
      ]
    }
    copyData.splice(position, 0, ...newItem)
    setMenuData(copyData)
  }, [user]);

  const links = userMenuData.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      {/* {item.icon} */}
      <item.icon size={20} className={`${classes.linkIcon} text-white`} stroke='1.5' />
      <span>{item.label}</span>
    </a>
  ));

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
            onClick={(event) => event.preventDefault()}>
            {/* <IconLogout className={classes.linkIcon} stroke={1.5} /> */}
            <IoMdLogOut className={classes.linkIcon} stroke={`1.5`} />
            <span>Logout</span>
          </a>
        </div>
      </nav>
    </>

  );
}