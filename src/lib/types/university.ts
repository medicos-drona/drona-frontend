export interface University {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  status: string;
  logo: string;
  contactDetails: string;
  downloadedQuestions: {
    current: number;
    total: number;
  };
}
  
