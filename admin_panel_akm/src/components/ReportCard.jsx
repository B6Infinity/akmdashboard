function ReportCard({ report, setSelectedReportTooltipContent }) {
    return (
        <div className={`p-2 bg-gray-300 hover:bg-gray-400 my-1 rounded-md flex justify-between`}>
            <div>Time: <b>{formatReportDate(report.createdAt)}</b></div>
            <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mx-2 ${getCategoryChipCSS(report.type)}`}
                >{report.type}</span>
                
                <button
                    className="p-1 bg-gray-100 rounded-md hover:bg-gray-200"
                    onClick={
                        () => {
                            // setSelectedLocation(report.location);
                            // setSelectedReportPhotoURL(report.photo_url);

                            setSelectedReportTooltipContent({
                                "location": report.location,
                                "photo_url": report.photo_url,
                                "category": report.type,
                                "remarks": report.remarks
                            })
                        }
                    }>📍</button>
            </div>
        </div>
    )
}
function getCategoryChipCSS(category) {
    switch (category) {
        case "garbage":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        case "broken_lamp":
            return "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300";
        case "pothole":
            return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
}
const formatReportDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    // 1. Get the time in "10:02 AM" format
    const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    // 2. Calculate the difference in days
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // 3. Return combined format
    if (diffInDays > 0) {
        return `${timePart}, ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    return timePart;
};


export default ReportCard