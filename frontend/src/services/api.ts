export const checkHealth = async (): Promise<{ status: string; db: string; initialized?: boolean }> => {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};