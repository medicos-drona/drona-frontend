export interface University {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  status: string;
  tier: 'free' | 'pro';
  logo: string;
  contactDetails: string;
  downloadedQuestions: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
}
  
