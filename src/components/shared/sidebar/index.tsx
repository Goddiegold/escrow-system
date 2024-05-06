import { useState } from 'react';
import classes from './styles.module.css';
import { Gear, HouseLine, ShoppingCart, Wallet } from '@phosphor-icons/react';
import { IoMdLogOut } from 'react-icons/io';

const data = [
  {
    link: '', label: 'Dashboard',
    icon: <HouseLine
      size={20}
      className={`${classes.linkIcon} text-white`} stroke='1.5' />
  },
  {
    link: '',
    label: 'Orders', icon: <ShoppingCart
      // color='white'
      size={20}
      className={`${classes.linkIcon} text-white`} stroke='1.5' />
  },
  {
    link: '',
    label: 'Wallet',
    icon: <Wallet
      // color='white'
      size={20}
      className={`${classes.linkIcon} text-white`} stroke='1.5' />
  },
  {
    link: '',
    label: 'Settings',
    icon: <Gear
      // color='white'
      size={20} className={`${classes.linkIcon} text-white`} stroke='1.5' />
  },
];

export function NavbarSimpleColored() {
  const [active, setActive] = useState('Billing');

  const links = data.map((item) => (
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
      {/* <item.icon className={classes.linkIcon} stroke={1.5} /> */}
      {item.icon}
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        {links}
      </div>

      <div className={classes.footer}>
        {/* <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <Airplay size={20} />
          <span>Change account</span>
        </a> */}

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
  );
}