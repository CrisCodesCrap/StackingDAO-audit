import { Simnet } from "@hirosystems/clarinet-sdk";

import { ExtendedSimnet, TOKENS } from "./interfaces";


export default function SimnetMixin(Base: Simnet): ExtendedSimnet {
    return Object.assign(Base, {
        getBalance(token: keyof typeof TOKENS, address: string): bigint {
            return Base.getAssetsMap()
                .get(TOKENS[token]!)
                ?.get(address) || BigInt(0);
        }
    }) as unknown as ExtendedSimnet
}