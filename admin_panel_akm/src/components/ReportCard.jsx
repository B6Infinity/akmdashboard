function ReportCard({ report, setSelectedLocation}) {
    return (
        <div className="p-2 bg-gray-300 hover:bg-gray-400 my-1 rounded-md flex justify-between">
            <div>
                <div>{report.status}</div>
                <button
                className="p-1 bg-gray-100 rounded-md hover:bg-gray-200" 
                onClick={
                    () => {
                        setSelectedLocation(report.location)
                    }

                }>📍</button>
            </div>
            <img className="w-[30%] h-auto object-cover" src={report.photo_url} alt="" />
        </div>
    )
}

export default ReportCard