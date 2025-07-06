import { Platform } from 'react-native';

const API_KEY = 'odEEnDjhQRNTzq4P4zo9Vxi9Ehm6qJ4JHOcg5YnnomaO5PhU5p'; // Replace with your actual API key
const API_ENDPOINT = 'https://api.plant.id/v2/health_assessment';

interface DiagnosisResponse {
  is_healthy: boolean;
  diseases: Array<{
    name: string;
    probability: number;
  }>;
}

export const getDiagnosis = async (imageUri: string): Promise<DiagnosisResponse> => {
  try {
    // Convert image URI to base64
    let base64Image: string;
    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          }
        };
        reader.readAsDataURL(blob);
      });
    } else {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          }
        };
        reader.readAsDataURL(blob);
      });
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY,
      },
      body: JSON.stringify({
        images: [base64Image],
        modifiers: ["crops_fast", "similar_images"],
        language: "en"
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get diagnosis');
    }

    const data = await response.json();
    
    // Transform API response to our interface
    return {
      is_healthy: data.health_assessment.is_healthy,
      diseases: data.health_assessment.diseases.map((disease: any) => ({
        name: disease.name,
        probability: disease.probability
      }))
    };
  } catch (error) {
    console.error('Error getting plant diagnosis:', error);
    throw error;
  }
}; 