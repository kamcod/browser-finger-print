import './App.css';
import {useEffect, useState} from "react";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {getPlugins} from "./utils/helper";

function App() {
    const [data, setData] = useState({});
    const [ipAddress, setIpAddress] = useState();
    const [time, setTime] = useState();
    const [activeServiceWorkers, setActiveServiceWorkers] = useState([]);
    const [scrollDirection, setScrollDirection] = useState('');
    const [showOutput, setShowOutput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // create and set the fingerprint as soon as
    // the component mounts
    const getFingerPrint = async() => {
        setShowOutput(true);
        setLoading(true);
        try {
            const startTime = Date.now()
            const fp = await FingerprintJS.load();

            const response = await fp.get();
            if(!response) setError(true);
            setLoading(false);

            navigator.getBattery().then(battery => {
                setData({...response, battery});
            });

            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    const totalTime = Date.now() - startTime;
                    setTime(totalTime);
                    setIpAddress(data.ip);
                })
                .catch(error => console.error('Error fetching IP:', error));
        }
        catch (e) {
            setError(true);
            setLoading(false);
        }
    };

    const BrowserPlugins = () => {
        return <ol>
            {getPlugins().map((plugin) => <li key={plugin.name}>
                {`Name: ${plugin.name}`}
                <br/>
                {`Description: ${plugin.description}`}
                <br/>
                mimeTypes: <ol>
                {plugin.mimeTypes.map(e => <li>
                    {`Suffixes: ${e.suffixes}`}
                    <br/>
                    {`Type: ${e.type}`}
                </li>)}
            </ol>
            </li>)}
        </ol>

    }

    const isFontAvailable = (fontName) => {
        const testString = "mmmmmmwwwwww"; // String with characters of similar width in most fonts
        const baseFonts = ["monospace", "sans-serif", "serif"]; // Fallback generic fonts
        const testSize = "72px"; // Large font size to increase measurement accuracy

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Measure the test string width in the default font (e.g., monospace)
        function getTextWidth(font) {
            context.font = `${testSize} ${font}`;
            return context.measureText(testString).width;
        }

        const baseWidths = baseFonts.map(font => getTextWidth(font));
        const testWidth = getTextWidth(`${fontName}, ${baseFonts.join(",")}`);

        // Compare width with each base font; if different, the font is likely available
        return !baseWidths.some(baseWidth => baseWidth === testWidth);
    }

// Example usage
    const fontsToCheck = [
        "Times New Roman", "circular", "cursive",
        "fangsong", "fantasy", "math", "monospace", "Georgia", "Palatino Linotype", "Book Antiqua", "Garamond",
        "Baskerville", "Courier New", "Cambria", "Didot", "Bodoni MT",
        "Arial", "Helvetica", "Verdana", "Tahoma", "Trebuchet MS",
        "Gill Sans", "Century Gothic", "Lucida Sans", "Segoe UI", "Calibri",
        "Lucida Console", "Monaco", "Consolas", "Inconsolata", "Roboto Mono",
        "Fira Code", "Source Code Pro", "Menlo", "Andale Mono",
        "Papyrus", "Impact", "Comic Sans MS", "Luminari", "Chalkduster",
        "Marker Felt", "Trattatello", "Copperplate", "Brush Script MT", "Playbill",
        "Lucida Handwriting", "Zapfino", "Snell Roundhand", "Apple Chancery",
        "Dancing Script", "Pacifico", "Great Vibes", "Segoe Script"
    ];
    const availableFonts = fontsToCheck.filter(font => isFontAvailable(font));
    const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;

    const getTouchSupport = () => {
        const n = navigator

        let maxTouchPoints = 0
        let touchEvent
        if (n.maxTouchPoints !== undefined) {
            maxTouchPoints = +(n.maxTouchPoints)
        } else if (n.msMaxTouchPoints !== undefined) {
            maxTouchPoints = n.msMaxTouchPoints
        }
        try {
            document.createEvent('TouchEvent')
            touchEvent = 'true'
        } catch {
            touchEvent = 'false'
        }
        const touchStart = 'ontouchstart' in window ? 'true' : 'false'
        return {
            maxTouchPoints,
            touchEvent,
            touchStart,
        }
    }

    const touchSupport = getTouchSupport();

    const getLocalStorageData = () => {
        const localStorageData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            localStorageData[key] = value;
        }
        return localStorageData;
    };

    const localStorageData = getLocalStorageData();

    const getAllSessionStorageData = () => {
        const sessionStorageData = {};
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const value = sessionStorage.getItem(key);
            sessionStorageData[key] = value;
        }
        return sessionStorageData;
    }

    const allSessionData = getAllSessionStorageData();

    const getActiveServiceWorkers = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                setActiveServiceWorkers(registrations);
                registrations.forEach(registration => {
                    console.log('Service Worker Registration:', registration);

                    if (registration.active) {
                        console.log('Active Service Worker:', registration.active);
                        console.log('Script URL:', registration.active.scriptURL);
                        console.log('State:', registration.active.state);
                    }

                    if (registration.installing) {
                        console.log('Installing Service Worker:', registration.installing);
                    }

                    if (registration.waiting) {
                        console.log('Waiting Service Worker:', registration.waiting);
                    }

                    // You can also check the scope of the service worker
                    console.log('Scope:', registration.scope);
                });
            } catch (error) {
                console.error('Error fetching service worker registrations:', error);
            }
        } else {
            console.log("Service Workers are not supported in this browser.");
        }
    }

// Example usage:
    getActiveServiceWorkers();

    const areCookiesEnabled = () => {
        const d = document
        try {
            // Create cookie
            d.cookie = 'cookietest=1; SameSite=Strict;'
            const result = d.cookie.indexOf('cookietest=') !== -1
            // Delete cookie
            d.cookie = 'cookietest=1; SameSite=Strict; expires=Thu, 01-Jan-1970 00:00:01 GMT'
            return result
        } catch (e) {
            return false
        }
    }

    let lastScrollTop = 0;
    let lastScrollLeft = 0;
    useEffect(() => {
        window.addEventListener('scroll', function(e) {
            const scrollTop = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            let scrollLeft = window.scrollX;

            if (scrollTop > lastScrollTop) {
                setScrollDirection('Scrolling Down');
            } else if (scrollTop < lastScrollTop) {
                setScrollDirection('Scrolling Up');
            }

            if (scrollLeft > lastScrollLeft) {
                setScrollDirection('Scrolling Right');
            } else if (scrollLeft < lastScrollLeft) {
                setScrollDirection('Scrolling Left');
            }

            if (scrollTop + clientHeight >= scrollHeight) {
                setScrollDirection('Scrolled to Bottom');
            } else if (scrollTop === 0) {
                setScrollDirection('Scrolled to Top');
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            lastScrollLeft = scrollLeft <= 0 ? 0 : scrollLeft;
        });
    }, []);

    return (
        <div className="App">
            <div className="top-details">
                <button onClick={getFingerPrint}>
                    Get Finger Print
                </button>
            </div>
            {error && <div style={{color: 'red', fontWeight: '800'}}>
                Something went wrong!
                Please try again.
            </div>}
            {showOutput && !error && <div>
                {loading ? <div>Loading...</div> : <div className="out-put">
                    <br/>
                    <div className="top-details">
                        <div className="info">
                            <div className="title">Visitor Identifier Hash:</div>
                            <div className="hash">{data.visitorId}</div>
                        </div>
                        <div className="separator"/>
                        <div className="info">
                            <div className="title">Time took to get the identifier:</div>
                            <div className="value">{time}ms</div>
                        </div>
                        <div className="info">
                            <div className="title">Confidence Score:</div>
                            <div className="value">{data.confidence?.score}</div>
                        </div>
                    </div>

                    <div className="separator"/>
                    <br/>
                    <div className="section">
                        <div className="section-label">
                            Browser and System Information
                        </div>
                        <ul className="section-list">
                            <li>
                                <span className="list-label">User-Agent String:</span>
                                <span className="list-value">{navigator?.userAgent}</span>
                            </li>
                            <li>
                                <span className="list-label">Browser Plugins:</span>
                                <span className="list-value"><BrowserPlugins/></span>
                            </li>
                            <li>
                                <span className="list-label">Language and Locale:</span>
                                <span className="list-value">{navigator?.languages.join(', ')}</span>
                            </li>
                            <li>
                                <span className="list-label">Time Zone:</span>
                                <span className="list-value">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                            </li>
                            <li>
                                <span className="list-label">Screen Resolution:</span>
                                <span className="list-value">
                                <ul>
                                    <li>
                                        <span>Resolution:</span>
                                        <span
                                            className="list-value">{`${window.screen.width} x ${window.screen.height} px`}</span>
                                    </li>
                                    <li>
                                        <span>Color Depth:</span>
                                        <span className="list-value">{window.screen.colorDepth}</span>
                                    </li>
                                    <li>
                                        <span>Pixel Depth:</span>
                                        <span className="list-value">{window.screen.pixelDepth}</span>
                                    </li>
                                </ul>
                            </span>
                            </li>
                            <li>
                                <span className="list-label">Window Size:</span>
                                <span className="list-value">{`${window.innerWidth} x ${window.innerHeight} px`}</span>
                            </li>
                            <li>
                                <span className="list-label">Platform:</span>
                                <span className="list-value">{navigator?.platform}</span>
                            </li>
                        </ul>
                    </div>
                    <div className="section">
                        <div className="section-label">
                            Network Information
                        </div>
                        <ul className="section-list">
                            <li>
                                <span className="list-label">IP Address:</span>
                                <span className="list-value">{ipAddress}</span>
                            </li>
                            <li>
                                <span className="list-label">Protocol:</span>
                                <span className="list-value">{window.location.protocol}</span>
                            </li>
                            <li>
                                <span className="list-label">Connection Quality:</span>
                                <span className="list-value">{navigator.connection.effectiveType}</span>
                            </li>
                        </ul>
                    </div>
                    <div className="section">
                        <div className="section-label">
                            Browser Features and Capabilities
                        </div>
                        <ul className="section-list">
                            <li>
                                <span className="list-label">Available Fonts:</span>
                                <span className="list-value">{availableFonts.join(', ')}</span>
                            </li>
                            <li>
                                <span className="list-label">Touch Support:</span>
                                <span className="list-value">
                                    <ul>
                                        {Object.keys(touchSupport).map(key => <li>
                                            <span>{key}:</span>
                                            <span className="list-value">{touchSupport[key]}</span>
                                        </li>)}
                                    </ul>
                                </span>
                            </li>
                            <li>
                                <span className="list-label">Battery Status:</span>
                                <span className="list-value">
                                    <ul>
                                        <li>
                                            <span>Battery Level:</span>
                                            <span className="list-value">{Number(data.battery?.level * 100).toFixed(2)}%</span>
                                        </li>
                                        <li>
                                            <span>Is Charging:</span>
                                            <span
                                                className="list-value">{data.battery?.charging ? "true" : "false"}</span>
                                        </li>
                                    </ul>
                                </span>
                            </li>

                            <li>
                                <span className="list-label">Do Not Track Settings:</span>
                                <span className="list-value">{dnt === "1" ? "enabled" : "Disabled"}</span>
                            </li>
                        </ul>
                    </div>
                    <div className="section">
                        <div className="section-label">
                            Cookies and Storage
                        </div>
                        <ul className="section-list">
                            <li>
                                <span className="list-label">Cookies Enabled:</span>
                                <span className="list-value">{areCookiesEnabled() ? 'true' : false}</span>
                            </li>
                            <li>
                                <span className="list-label">Local Storage Data:</span>
                                <span className="list-value">
                                    <ul>
                                        {Object.keys(localStorageData).map(key => <li>
                                            <span>{key}:</span>
                                            <span className="list-value">{localStorageData[key]}</span>
                                        </li>)}
                                    </ul>
                                </span>
                            </li>
                            <li>
                                <span className="list-label">Session Storage Data:</span>
                                <span className="list-value">
                                    <ul>
                                        {Object.keys(allSessionData).map(key => <li>
                                            <span>{key}:</span>
                                            <span className="list-value">{allSessionData[key]}</span>
                                        </li>)}
                                    </ul>
                                </span>
                            </li>
                            <li>
                                <span className="list-label">Active Service Workers</span>
                                <span className="list-value">{activeServiceWorkers.length}</span>
                            </li>
                        </ul>
                    </div>
                    <div className="section">
                        <div className="section-label">
                            Input Method
                        </div>
                        <ul className="section-list">
                            <li>
                                <span className="list-label">Scroll Information:</span>
                                <span className="list-value">See on the top right corner of window</span>
                            </li>
                            <li className="scroll-info">
                                <span className="list-label title">Scroll Information:</span>
                                <span className="list-value">
                                    <ul>
                                        <li>
                                            <span className="list-label">Scroll-X:</span>
                                            <span className="list-value">{window.scrollX}</span>
                                        </li>
                                        <li>
                                            <span className="list-label">Scroll-Y:</span>
                                            <span className="list-value">{window.scrollY}</span>
                                        </li>
                                        <li>
                                            <span className="list-label">Scroll Direction:</span>
                                            <span className="list-value">{scrollDirection}</span>
                                        </li>
                                    </ul>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
                }
            </div>}
            </div>
                );
            }

            export default App;
