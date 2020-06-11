export declare const Pagination: <T extends any>(url: string, headers?: any, forceHttps?: boolean | undefined, paramConfig?: {
    checkProp: string;
    nextProp: string;
    params?: any;
} | undefined) => import("rxjs").Subject<T>;
