import { useState } from 'react';
import classes from './styles.module.css';

import { IoMdLogOut } from 'react-icons/io';
import { menuData } from '@/shared/helpers';
import { AppShell, ScrollArea } from '@mantine/core';

export function NavbarSimpleColored() {
  const [active, setActive] = useState('Billing');

  const links = menuData.map((item) => (
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