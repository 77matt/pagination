import * as request from "request";
import { Subject } from "rxjs";
import { INextHeaders } from "../interfaces/core.interfaces";

export function BuildPagination() {
    return function Pagination<T extends any>(
        url: string,
        headers?: any,
        forceHttps?: boolean,
        paramConfig?: { checkProp: string; nextProp: string; params?: any }
    ): Subject<T> {
        // Create the sub
        const sub: Subject<T> = new Subject();

        // Start the loop
        setTimeout(() =>
            loop(sub, url, headers, true, forceHttps, paramConfig)
        );

        // Return the sub
        return sub;
    };
}

async function loop(
    sub: Subject<any>,
    url: string,
    headers?: any,
    first?: boolean,
    forceHttps?: boolean,
    paramConfig?: { checkProp: string; nextProp: string; params?: any }
) {
    // Make sure we have subscribers
    if (sub.observers.length >= 1 || first) {
        if (!first && forceHttps) {
            url = url.replace("http://", "https://");
        }
        // Make the request
        request(
            {
                url: url,
                headers: headers,
                qs: paramConfig ? paramConfig.params : {}
            },
            (err: Error, res: any, body: any) => {
                if (err) {
                    console.error("Error with request");
                    console.log(err);
                    sub.complete();
                    return;
                }
                // Next the body
                try {
                    const parsedBody = JSON.parse(body);
                    sub.next(parsedBody);

                    if (paramConfig) {
                        const { checkProp, nextProp } = paramConfig;
                        if (!nextProp || !checkProp) {
                            throw new Error("Missing Param Config");
                        }

                        const hasMore = parsedBody[checkProp];
                        const nextValue = parsedBody[nextProp];
                        if (hasMore && nextValue) {
                            if (!paramConfig.params) {
                                paramConfig.params = {};
                            }
                            paramConfig.params[nextProp] = nextValue;
                            loop(
                                sub,
                                url,
                                headers,
                                false,
                                forceHttps,
                                paramConfig
                            );
                        } else {
                            sub.complete();
                            return;
                        }
                    } else {
                        // Get the next headers
                        const nextHeaders = parseNextHeaders(res.headers);

                        if (!nextHeaders) {
                            throw new Error("Not a paginated api");
                        }

                        // Loop again if more records exist
                        if (nextHeaders.next) {
                            loop(
                                sub,
                                nextHeaders.next,
                                headers,
                                false,
                                forceHttps
                            );
                        } else {
                            // If no next page, complete the sub
                            sub.complete();
                        }
                    }
                } catch (e) {
                    console.error(e);
                    sub.complete();
                    return;
                }
            }
        );
    }
}

function parseNextHeaders(headers: request.Headers): INextHeaders | undefined {
    // Get the link header
    const link = headers.link;

    // Validate
    if (!link) {
        return;
    }

    // Create default output
    const nextHeaders: INextHeaders = {
        next: undefined,
        prev: undefined
    };

    // Split into two parts
    const relArray = link.split(", ");

    // Loop through the array
    relArray.forEach((item: string) => {
        // Split
        const split = item.split("; ");

        // Get the url[0]
        const url = split[0].replace("<", "").replace(">", "");

        if (split[1].includes("next")) {
            nextHeaders.next = url;
        } else if (split[1].includes("prev")) {
            nextHeaders.prev = url;
        }
    });

    return nextHeaders;
}
