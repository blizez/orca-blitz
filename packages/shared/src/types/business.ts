export interface Business {
  id: string;
  name: string;
  type: string;
  industry: string;
  description: string;
  website: string;
  products: string;
  audience: string;
  competitors: string;
  usp: string;
  painPoints: string;
  monthlyRevenue: string;
  yearEstablished: string;
  channels: string[];
  goals: string[];
  teamSize: string;
}

export interface BusinessData extends Omit<Business, "id"> {}
