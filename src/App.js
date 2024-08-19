import './App.css';
import {useState} from "react";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {getPlugins} from "./utils/helper";

function App() {
    const [data, setData] = useState({});
    const [ipAddress, setIpAddress] = useState();
    const [time, setTime] = useState();
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


            setData(response);

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
        return getPlugins().map((plugin) => <div key={plugin.name}>
            <ul>
                <li>
                    {`Name: ${plugin.name}`}
                    <br />
                    {`Description: ${plugin.description}`}
                    <br />
                    mimeTypes: <ul>
                    {plugin.mimeTypes.map(e => <li>
                        {`Suffixes: ${e.suffixes}`}
                        <br />
                        {`Type: ${e.type}`}
                    </li>)}
                </ul>
                </li>
            </ul>
        </div>)
    }
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
                <br />
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
                                        <span className="list-value">{`${window.screen.width} x ${window.screen.height} px`}</span>
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

            </div>}
        </div>}
    </div>
  );
}

export default App;
