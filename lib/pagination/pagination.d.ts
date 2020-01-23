import { Subject } from "rxjs";
export declare function BuildPagination(): <T extends any>(url: string, headers?: any, forceHttps?: boolean | undefined) => Subject<T>;
