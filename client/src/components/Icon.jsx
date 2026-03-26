import React from 'react';

import cartIcon from '../assets/icons/cart.svg';
import clipboardIcon from '../assets/icons/clipboard.svg';
import bellIcon from '../assets/icons/bell.svg';
import lightningIcon from '../assets/icons/lightning.svg';
import truckIcon from '../assets/icons/truck.svg';
import userPlusIcon from '../assets/icons/user-plus.svg';
import chartIcon from '../assets/icons/chart.svg';
import usersIcon from '../assets/icons/users.svg';
import searchIcon from '../assets/icons/search.svg';
import editIcon from '../assets/icons/edit.svg';
import trashIcon from '../assets/icons/trash.svg';
import printerIcon from '../assets/icons/printer.svg';
import checkIcon from '../assets/icons/check.svg';
import diceIcon from '../assets/icons/dice.svg';
import copyIcon from '../assets/icons/copy.svg';
import globeIcon from '../assets/icons/globe.svg';
import briefcaseIcon from '../assets/icons/briefcase.svg';
import boxIcon from '../assets/icons/box.svg';
import dollarIcon from '../assets/icons/dollar.svg';
import userIcon from '../assets/icons/user.svg';
import arrowLeftIcon from '../assets/icons/arrow-left.svg';
import logoutIcon from '../assets/icons/logout.svg';
import gridIcon from '../assets/icons/grid.svg';
import menuIcon from '../assets/icons/menu.svg';
import xIcon from '../assets/icons/x.svg';
import sunIcon from '../assets/icons/sun.svg';
import moonIcon from '../assets/icons/moon.svg';

const icons = {
  cart: cartIcon,
  clipboard: clipboardIcon,
  bell: bellIcon,
  lightning: lightningIcon,
  truck: truckIcon,
  'user-plus': userPlusIcon,
  chart: chartIcon,
  users: usersIcon,
  search: searchIcon,
  edit: editIcon,
  trash: trashIcon,
  printer: printerIcon,
  check: checkIcon,
  dice: diceIcon,
  copy: copyIcon,
  globe: globeIcon,
  briefcase: briefcaseIcon,
  box: boxIcon,
  dollar: dollarIcon,
  user: userIcon,
  'arrow-left': arrowLeftIcon,
  logout: logoutIcon,
  grid: gridIcon,
  menu: menuIcon,
  x: xIcon,
  sun: sunIcon,
  moon: moonIcon,
};

const Icon = ({ name, size = 20, color, className = '' }) => {
  const src = icons[name];
  if (!src) return null;

  return (
    <img
      src={src}
      alt={name}
      className={`icon ${className}`}
      width={size}
      height={size}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: color ? undefined : undefined,
      }}
    />
  );
};

export default Icon;
