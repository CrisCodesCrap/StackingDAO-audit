import { Context, EventBridgeEvent } from "aws-lambda";
import { readFile } from "fs/promises";

async function main() {
    const rawEvent = await readFile("events/scheduled-event.json", "utf-8");
    const event = JSON.parse(rawEvent) as EventBridgeEvent<
        "Scheduled Event",
        any
    >;

    await calculate(event);
}

main();

export async function calculate(
    event: EventBridgeEvent<"Scheduled Event", any>,
): Promise<void> {
    console.log(event);
}
