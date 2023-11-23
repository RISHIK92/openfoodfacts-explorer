import type { PageLoad } from './$types';
import {
	type Brand,
	type Label,
	getTaxo,
	type Store,
	type Category,
	FolksonomyApi,
	ProductsApi
} from '$lib/api';
import { error } from '@sveltejs/kit';
import { PricesApi } from '$lib/api';

export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
	const productsApi = new ProductsApi(fetch);
	const state = await productsApi.getProduct(params.barcode);
	if (state.status === 'failure') {
		throw error(404, { message: 'Failure to load product', errors: state.errors });
	}

	const categories = getTaxo<Category>('categories', fetch);
	const labels = getTaxo<Label>('labels', fetch);
	const stores = getTaxo<Store>('stores', fetch);
	const brands = getTaxo<Brand>('brands', fetch);

	const folkApi = new FolksonomyApi(fetch);
	const tags = folkApi.getProduct(params.barcode);
	const keys = folkApi.getKeys();

	const pricesApi = new PricesApi(fetch);
	const pricesResponse = pricesApi.getPrices({ product_code: params.barcode });

	return {
		state,
		tags,
		keys,
		taxo: {
			categories,
			labels,
			stores,
			brands
		},
		prices: pricesResponse
	};
};
