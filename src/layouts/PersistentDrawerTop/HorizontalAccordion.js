import './HorizontalAccordion.css';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HorizontalAccordion = () => {
  const [expandedItem, setExpandedItem] = useState(null);

  const menuItems = [
    {
      label: 'Objects',
      subItems: ['Stops', 'Points'],
    },
    {
      label: 'Schedules',
      subItems: ['Schedules1', 'Schedules2'],
    },
    {
      label: 'Tools',
      subItems: ['Tools 1', 'Tools 2'],
    },
  ];

  const handleItemClick = (label) => {
    if (expandedItem === label) {
      setExpandedItem(null);
    } else {
      setExpandedItem(label);
    }
  };

  return (
    <div className="horizontal-accordion">
      {menuItems.map((menuItem, index) => (
        <div
          key={index}
          className={`accordion-item ${
            expandedItem === menuItem.label ? 'expanded' : ''
          }`}
        >
          <div
            className="accordion-title"
            onClick={() => handleItemClick(menuItem.label)}
          >
            {menuItem.label}
          </div>
          <div
            className="sub-items"
            style={{
              display: expandedItem === menuItem.label ? 'block' : 'none',
            }}
          >
            {menuItem.subItems.map((subItem, subIndex) => (
              <Link
                to={`/${subItem}`}
                key={subIndex}
                style={{ textDecoration: 'none' }}
              >
                {subItem}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorizontalAccordion;
