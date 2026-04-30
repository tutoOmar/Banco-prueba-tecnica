export interface FinancialProduct {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface ProductsResponse {
  data: FinancialProduct[];
}

export interface ProductMutationResponse {
  message: string;
  data: FinancialProduct;
}

export type CreateProductPayload = FinancialProduct;
export type UpdateProductPayload = Omit<FinancialProduct, 'id'>;
