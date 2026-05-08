import React, { useState } from "react";

const HomeIcon = () => (
    <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 22V12h6v10" />
    </svg>
);

const SearchIcon = () => (
    <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const UserIcon = () => (
    <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

type FooterItem = {
    label: string;
    icon: React.ReactNode;
};

const items: FooterItem[] = [
    {
        label: "Home",
        icon: <HomeIcon />,
    },
    {
        label: "Search",
        icon: <SearchIcon />,
    },
    {
        label: "Profile",
        icon: <UserIcon />,
    },
];

export default function FloatingFooter() {
    const [active, setActive] = useState(0);

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: '#efe7f6',
                borderRadius: '1.5rem',
                padding: '1.5rem 1rem',
                display: 'flex',
                gap: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                {items.map((item, index) => {
                    const isActive = active === index;

                    return (
                        <button
                            key={item.label}
                            onClick={() => setActive(index)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <div
                                style={{
                                    width: '3rem',
                                    height: '3rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    backgroundColor: isActive ? '#d8c9ef' : 'transparent',
                                    color: '#4f465c'
                                }}
                            >
                                {item.icon}
                            </div>

                            <span style={{
                                fontSize: '0.875rem',
                                color: '#4f465c',
                                fontWeight: '500'
                            }}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}