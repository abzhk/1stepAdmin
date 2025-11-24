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

  })
});
export const {useCreateCategoryMutation} = categoryApiSlice;