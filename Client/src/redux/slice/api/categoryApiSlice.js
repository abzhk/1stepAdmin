import  {apiSlice} from '../apiSlice';

const Category_URL ='category';

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

 createCategory: builder.mutation({
      query: (data) => ({
        url: `${Category_URL}/addcategory`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
      getAllCategories: builder.query({
      query: (params = {}) => ({
        url: `${Category_URL}/getallcategories`,
        method: 'GET',
        params: params, 
      }),
      providesTags: ['Category'], 
    }),

  })
});
export const {useCreateCategoryMutation,useGetAllCategoriesQuery} = categoryApiSlice;