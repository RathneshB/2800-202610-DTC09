import { useEffect, useState } from 'react';
import {
    Accessibility,
    User,
} from 'lucide-react';

import { supabase } from '../supabase';

export default function Profile() {
    const [userMenuOpen, setUserMenuOpen] =
        useState(false);

    const [
        appearanceMenuOpen,
        setAppearanceMenuOpen,
    ] = useState(false);

    const [darkMode, setDarkMode] =
        useState(false);

    const [largeText, setLargeText] =
        useState(false);

    const [colorblindMode, setColorblindMode] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [user, setUser] = useState<any>(null);

    const [
        changePasswordOpen,
        setChangePasswordOpen,
    ] = useState(false);

    const [newPassword, setNewPassword] =
        useState('');

    useEffect(() => {
        const savedDarkMode =
            localStorage.getItem('darkMode') ===
            'true';

        const savedLargeText =
            localStorage.getItem('largeText') ===
            'true';

        const savedColorblind =
            localStorage.getItem(
                'colorblindMode'
            ) === 'true';

        setDarkMode(savedDarkMode);
        setLargeText(savedLargeText);
        setColorblindMode(savedColorblind);

        const fetchUser = async () => {
            const {
                data: { user },
            } =
                await supabase.auth.getUser();

            setUser(user);
        };

        fetchUser();
    }, []);

    const handleDarkModeToggle = () => {
        const newState = !darkMode;

        setDarkMode(newState);

        localStorage.setItem(
            'darkMode',
            String(newState)
        );
    };

    const handleLargeTextToggle = () => {
        const newState = !largeText;

        setLargeText(newState);

        localStorage.setItem(
            'largeText',
            String(newState)
        );
    };

    const handleColorblindToggle = () => {
        const newState = !colorblindMode;

        setColorblindMode(newState);

        localStorage.setItem(
            'colorblindMode',
            String(newState)
        );
    };

    const handleChangePassword =
        async () => {
            if (!user || !newPassword)
                return;

            setLoading(true);

            const { error } =
                await supabase.auth.updateUser(
                    {
                        password:
                            newPassword,
                    }
                );

            setLoading(false);

            if (error) {
                alert(
                    'Error changing password: ' +
                    error.message
                );
            } else {
                alert(
                    'Password changed successfully!'
                );

                setNewPassword('');

                setChangePasswordOpen(
                    false
                );
            }
        };

    return (
        <div
            className={`
                profile-page
                ${darkMode
                    ? 'darkmode'
                    : ''
                }
                ${largeText
                    ? 'large-text'
                    : ''
                }
                ${colorblindMode
                    ? 'colorblind-mode'
                    : ''
                }
            `}
        >
            <div className="content">
                <br />

                {/* USER PROFILE */}
                <div
                    className="profile-cont"
                    onClick={() =>
                        setUserMenuOpen(
                            !userMenuOpen
                        )
                    }
                >
                    <div style={{ flex: 1 }}>
                        <div className="profile-header">
                            <User size={20} />

                            <span className="profile-title">
                                User Profile
                            </span>
                        </div>

                        {userMenuOpen && (
                            <div className="profile-submenu">
                                {user ? (
                                    <>
                                        {/* EMAIL */}
                                        <div className="profile-item">
                                            <label>
                                                Email
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    user.email ||
                                                    ''
                                                }
                                                disabled
                                                className="profile-input disabled-input"
                                            />
                                        </div>

                                        {/* PASSWORD */}
                                        <div className="profile-item">
                                            <label>
                                                Password
                                            </label>

                                            <input
                                                type="password"
                                                value="••••••••••"
                                                disabled
                                                className="profile-input disabled-input"
                                            />
                                        </div>

                                        {/* CHANGE PASSWORD */}
                                        <div className="profile-item">
                                            <button
                                                onClick={(
                                                    e
                                                ) => {
                                                    e.stopPropagation();

                                                    setChangePasswordOpen(
                                                        !changePasswordOpen
                                                    );
                                                }}
                                                className="change-password-button"
                                            >
                                                Change Password
                                            </button>

                                            {changePasswordOpen && (
                                                <div className="change-password-form">
                                                    <input
                                                        type="password"
                                                        value={
                                                            newPassword
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            setNewPassword(
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="New password"
                                                        className="profile-input"
                                                    />

                                                    <button
                                                        onClick={(
                                                            e
                                                        ) => {
                                                            e.stopPropagation();

                                                            void handleChangePassword();
                                                        }}
                                                        disabled={
                                                            loading
                                                        }
                                                        className="save-button"
                                                    >
                                                        {loading
                                                            ? 'Changing...'
                                                            : 'Update Password'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="profile-item">
                                        No user
                                        registered.
                                        Please log
                                        in.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* APPEARANCE */}
                <div
                    className="profile-cont"
                    onClick={() =>
                        setAppearanceMenuOpen(
                            !appearanceMenuOpen
                        )
                    }
                >
                    <div style={{ flex: 1 }}>
                        <div className="profile-header">
                            <Accessibility
                                size={20}
                            />

                            <span className="profile-title">
                                Appearance
                            </span>
                        </div>

                        {appearanceMenuOpen && (
                            <div className="profile-submenu">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={
                                            darkMode
                                        }
                                        onChange={
                                            handleDarkModeToggle
                                        }
                                        onClick={(
                                            e
                                        ) =>
                                            e.stopPropagation()
                                        }
                                    />

                                    <span>
                                        Dark
                                        Mode
                                    </span>
                                </label>

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={
                                            largeText
                                        }
                                        onChange={
                                            handleLargeTextToggle
                                        }
                                        onClick={(
                                            e
                                        ) =>
                                            e.stopPropagation()
                                        }
                                    />

                                    <span>
                                        Larger
                                        Text
                                    </span>
                                </label>

                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={
                                            colorblindMode
                                        }
                                        onChange={
                                            handleColorblindToggle
                                        }
                                        onClick={(
                                            e
                                        ) =>
                                            e.stopPropagation()
                                        }
                                    />

                                    <span>
                                        High
                                        Contrast
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .profile-page {
                    min-height: 100vh;
                    padding-bottom: 80px;
                    background: #f5f5f5;
                    color: #111;
                    transition: all 0.3s ease;
                }

                .content {
                    padding: 16px;
                    max-width: 896px;
                    margin: 0 auto;
                }

                .profile-cont {
                    margin-bottom: 24px;
                    padding: 16px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    cursor: pointer;
                    transition: 0.3s ease;
                }

                .profile-cont:hover {
                    transform: translateY(-2px);
                }

                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .profile-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .profile-submenu {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .profile-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .profile-item label {
                    font-weight: 500;
                }

                .profile-input {
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    font-size: 1rem;
                }

                .disabled-input {
                    background: #e9ecef;
                    opacity: 0.8;
                    cursor: not-allowed;
                }

                .save-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .save-button:hover {
                    background: #0056b3;
                }

                .save-button:disabled {
                    background: #999;
                    cursor: not-allowed;
                }

                .change-password-button {
                    padding: 10px 14px;
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .change-password-button:hover {
                    background: #218838;
                }

                .change-password-form {
                    margin-top: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .darkmode {
                    background: #111;
                    color: white;
                }

                .darkmode .profile-cont {
                    background: #1e1e1e;
                    color: white;
                }

                .darkmode .profile-input {
                    background: #2a2a2a;
                    color: white;
                    border: 1px solid #444;
                }

                .large-text {
                    font-size: 1.2rem;
                }

                .large-text .profile-title {
                    font-size: 1.4rem;
                }

                .large-text .checkbox-label {
                    font-size: 1.1rem;
                }

                .colorblind-mode {
                    filter: contrast(1.25);
                }
            `}</style>
        </div>
    );
}