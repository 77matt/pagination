// Export the pagination function
// Export all of the interfaces
import * as interfaces from "./interfaces/core.interfaces";
import * as pag from "./pagination/pagination";
import { ShopifyOpts } from "./services/shopify";
// Import and build the pagOpts const
import { WordpressOpts } from "./services/wordpress";
export const Pagination = pag.buildPagination();

export interface IPaginationOptions extends interfaces.IPaginationOptions {}
export interface IPaginationElement extends interfaces.IPaginationElement {}
export interface IPaginationHeaderLink
  extends interfaces.IPaginationHeaderLink {}
export interface IPaginationResponse<T>
  extends interfaces.IPaginationResponse<T> {}

export const pagOpts = {
  wordpress: WordpressOpts,
  shopify: ShopifyOpts
};
