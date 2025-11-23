export const formatDateIST = (dateString) => {
    if (!dateString) return '';

    // Ensure the date string is treated as UTC if it doesn't have timezone info
    let utcString = dateString;
    if (!dateString.endsWith('Z') && !dateString.includes('+')) {
        utcString = dateString + 'Z';
    }

    const date = new Date(utcString);
    return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};
