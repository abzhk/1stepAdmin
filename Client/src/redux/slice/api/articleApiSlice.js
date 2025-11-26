import { apiSlice } from "../apiSlice";

const Article_URL ='article'

export const articleApiSlice =apiSlice.injectEndpoints({
    endpoints:(builder)=>({

        getPendingArticles:builder.query({
            query:()=>({
                url:`${Article_URL}/pendingarticle`,
                method:'GET',
            })
        }),

    })
})
export const {useGetPendingArticlesQuery} = articleApiSlice;