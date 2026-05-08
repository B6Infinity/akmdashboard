import { useState, useEffect } from 'react'
import WardMap from './components/Map';
import ReportCard from './components/ReportCard';

function App() {

  // Report Fetch and Show -----------------
  const [allReports, setAllReports] = useState(null);
  useEffect(() => {
    fetch('http://localhost:4000/api/reports')
    .then((response) => response.json())
    .then((data) => {
      setAllReports(data.data)
      console.log('Reports :>> ', data.data[0]);
    })
    .catch((error) => console.error("Failed to load reports:", error))
  }, []);


  // Selected Location state -----------------
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col h-screen">
      <h1 className="text-4xl font-bold">AKM CivicOS</h1><h2>Admin Panel</h2>

      <div className="flex flex-row width-100 flex-1">

        <div className='basis-20 bg-gray-200 grow p-5'>
          <h3 className='text-3xl'>Reports ({allReports && allReports.length})</h3>

          <hr />

          {allReports && allReports.map((report) => {
            // JSON.stringify(report)
            return <ReportCard key={report._id} report={report} setSelectedLocation={setSelectedLocation}/>
          })}
          
        </div>

        <div className='basis-80 grow'>
          <WardMap selectedLocation={selectedLocation} />
        </div>
      </div>

    </div>
  );
}

export default App