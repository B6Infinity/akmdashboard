import { useState, useEffect } from 'react'
import Map from './components/Map';
import ReportCard from './components/ReportCard';

function App() {

  // Report Fetch and Show -----------------
  const [allIncidents, setAllIncidents] = useState(null);
  useEffect(() => {
    fetch('http://localhost:4001/db/all_incidents')
      .then((response) => response.json())
      .then((data) => {
        setAllIncidents(data.data)
        console.log('Incidents :>> ', data.data[0]);
      })
      .catch((error) => console.error("Failed to load reports:", error))
  }, []);



  // Selected Location state -----------------

  const [selectedReportTooltipContent, setSelectedReportTooltipContent] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col h-screen">
      <h1 className="text-4xl font-bold">AKM CivicOS</h1><h2>Admin Panel</h2>

      <div className="flex flex-row w-full overflow-hidden width-100 flex-1">

        <div className='basis-20 bg-gray-200 grow p-5 overflow-y-auto h-full'>
          <h3 className='text-3xl'>Reports ({allIncidents && allIncidents.length})</h3>

          <hr />

          {allIncidents && allIncidents.map((report) => {
            // JSON.stringify(report)
            return <ReportCard
              key={report._id}
              report={report}
              setSelectedReportTooltipContent={setSelectedReportTooltipContent}
            />
          })}

        </div>

        <div className='basis-80 grow'>
          <Map
            selectedReportTooltipContent={selectedReportTooltipContent}
            allIncidents={allIncidents}
          />
        </div>
      </div>

    </div>
  );
}

export default App