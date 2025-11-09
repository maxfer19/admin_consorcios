export interface Building {
  id: number;
  cuit?: string;
  name: string;
  legal_name?: string;
  address: string;
  city: string;
  province: string;
  postal_code?: string;
  total_units: number;
  building_type: 'residential' | 'commercial' | 'mixed';
  floors?: number;
  year_built?: number;
  admin_id?: number;
  config?: BuildingConfig;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BuildingConfig {
  amenities_enabled: boolean;
  voting_enabled: boolean;
  auto_expense_generation: boolean;
  payment_methods: string[];
  expense_due_day: number;
  late_fee_percentage: number;
}

export interface CreateBuildingDto {
  cuit?: string;
  name: string;
  legal_name?: string;
  address: string;
  city: string;
  province: string;
  postal_code?: string;
  total_units: number;
  building_type: Building['building_type'];
  floors?: number;
  year_built?: number;
  admin_id?: number;
}

export interface UpdateBuildingDto {
  name?: string;
  address?: string;
  city?: string;
  province?: string;
  admin_id?: number;
  config?: Partial<BuildingConfig>;
  is_active?: boolean;
}
