import { apiSlice } from "../apiSlice";
const Stats_URL = "track";

export const statsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getStats: builder.query({
            query: () => ({
                url: `${Stats_URL}/stats`,
                method:'GET',
            }),
            providesTags: ['Stats'],    
        })
    })
})
export const {useGetStatsQuery} = statsApiSlice;