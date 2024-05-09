import { PointSource } from "@repo/database/src/models";

export interface Campaign {
  id: string;
  description?: string;
  enabled: boolean;
  /**
   * @type "one-time-boost" means that the campaign
   * is running from start_block to end_block
   * but the points are only awarded once at
   * the end of the campaign. It also implies
   * that we keep track of a live balance and
   * a snapshot balance for each user.
   *
   * @type "daily" means that the campaign
   * is running from start_block to end_block
   * but the points are awarded each day
   * during the daily points update.
   */
  type: "one-time-boost" | "daily";
  start_block: number;
  end_block: number;
  source: PointSource | "*";
  multiplier: number;
}

export const campaigns: Campaign[] = [
  {
    id: "5x",
    enabled: true,
    type: "one-time-boost",
    start_block: 143630,
    end_block: 143630 + 2100,
    source: "*",
    multiplier: 5,
  },
  {
    id: "Nakamoto 20x",
    enabled: true,
    type: "one-time-boost",
    start_block: 143630,
    end_block: 147290 + 147290 + 2100,
    source: "*",
    multiplier: 20,
  },
  {
    id: "Nakamoto referral 2x",
    enabled: false,
    type: "one-time-boost",
    start_block: 0, //TBD
    end_block: 0, //TBD
    source: "referral",
    multiplier: 2,
  },
];

export function getActiveCampaigns(
  block_height: number,
  type: Campaign["type"],
  sourceFilter?: PointSource[]
): Campaign[] {
  const current = campaigns
    .filter((campaign) => campaign.start_block < block_height && block_height < campaign.end_block)
    .filter((value) => value.enabled && value.type === type);

  if (!sourceFilter) return current;

  return current.filter(
    (value) => value.source === "*" || (sourceFilter.includes(value.source) && value.source !== "migration")
  );
}
