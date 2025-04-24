// עדכון תיקיה
const updateFolder = async (folderId, folderData) => {
    const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(folderData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'שגיאה בעדכון התיקיה');
    }

    return await response.json();
};

export default {
    getFolders,
    createFolder,
    deleteFolder,
    updateFolder
}; 