export default interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  isDeleted: number;
  productViewed: number;
  createdDate: Date;
  updatedDate: Date;
  deletedDate: Date | null;
}
