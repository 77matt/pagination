import * as request from "request";
import { Subject } from "rxjs";
import { INextHeaders } from "../interfaces/core.interfaces";

export function BuildPagination() {
    return function Pagination<T extends any>(
        url: string,
        headers?: any
    ): Subject<T> {
        // Create the sub
        const sub: Subject<T> = new Subject();

        // Start the loop
        setTimeout(() => loop(sub, url, headers, true));

        // Return the sub
        return sub;
    };
}

async function loop(
    sub: Subject<any>,
    url: string,
    headers?: any,
    first?: boolean
) {
    // Make sure we have subscribers
    if (sub.observers.length >= 1 || first) {
        // Make the request
        request(
            {
                url: url,
                headers: headers
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
                    sub.next(JSON.parse(body));
                } catch (e) {
                    console.error("Not a JSON response");
                    console.error("URL", url);
                    console.error("HEADERS", headers);
                    console.error("BODY", body);
                    console.log(e);
                    sub.complete();
                    return;
                }

                // Get the next headers
                const nextHeaders = parseNextHeaders(res.headers);

                if (!nextHeaders) {
                    console.warn("Not a paginated api");
                    sub.complete();
                    return;
                }

                // Loop again if more records exist
                if (nextHeaders.next) {
                    loop(sub, nextHeaders.next, headers);
                } else {
                    // If no next page, complete the sub
                    sub.complete();
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
