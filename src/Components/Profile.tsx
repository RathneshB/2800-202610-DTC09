import { useEffect, useState } from 'react';
import { Accessibility, User } from 'lucide-react';

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

    return (
        <div
            className={`
                profile-page
                ${darkMode ? 'darkmode' : ''}
                ${largeText ? 'large-text' : ''}
                ${colorblindMode
                    ? 'colorblind-mode'
                    : ''
                }
            `}>
            <div className="content">
                <br />
                <div
                    className="profile-cont"
                    onClick={() =>
                        setUserMenuOpen(
                            !userMenuOpen
                        )
                    }>
                    <div style={{ flex: 1 }}>
                        <div className="profile-header">
                            <User size={20} />

                            <span className="profile-title">
                                User Profile
                            </span>
                        </div>

                        {userMenuOpen && (
                            <div className="profile-submenu">
                                <div className="profile-item">
                                    Profile settings
                                    coming soon...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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
                                        Dark Mode
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
                                        Larger Text
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
                                        High Contrast
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