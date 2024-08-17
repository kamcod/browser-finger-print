import './App.css';
import {useState} from "react";
import FingerprintJS from '@fingerprintjs/fingerprintjs';

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
  return (
    <div className="App">
      <button onClick={getFingerPrint}>
        Get Finger Print
      </button>
        {showOutput && <div>
            {loading ? <div>Loading...</div> : <div className="out-put">
                <br/>
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
                <div className="info">
                    <div className="title">User Agent:</div>
                    <div className="value">{navigator?.userAgent}</div>
                </div>

                <div className="info">
                    <div className="title">IP Address:</div>
                    <div className="value">{ipAddress}</div>
                </div>
            </div>}
        </div>}
    </div>
  );
}

export default App;
