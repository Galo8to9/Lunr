import { NextResponse } from "next/server";
import { PriceServiceConnection} from "@pythnetwork/price-service-client";

const HERMES = "https://hermes.pyth.network";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const ids = url.searchParams.getAll("id");
    if (ids.length === 0 ) return NextResponse.json({erro: "No ids"}, {status: 400});

    const conn = new PriceServiceConnection(HERMES, {timeout: 10_000});
    const latest = await conn.getLatestPriceFeeds(ids);


    return NextResponse.json({ latest}, {headers: {"cash-control": "no-store"}})
}