import { baseApi } from "@/app/baseApi";


export const securityApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getCaptchaUrl: build.query<{url: string}, void>({
            query: () => "security/get-captcha-url",
        })
    })
})

export const {useGetCaptchaUrlQuery} = securityApi