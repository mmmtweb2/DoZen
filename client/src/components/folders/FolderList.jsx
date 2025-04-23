const handleUpdateFolder = async (folderId, updatedData) => {
    try {
        const updatedFolder = await folderService.updateFolder(folderId, updatedData);
        setFolders(folders.map(folder =>
            folder._id === folderId ? updatedFolder : folder
        ));
    } catch (error) {
        console.error('שגיאה בעדכון התיקיה:', error);
        // אפשר להוסיף הודעת שגיאה למשתמש
    }
}; 