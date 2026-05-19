import Stripe from "stripe";
import { env } from "./env";

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (_stripe) return _stripe;
  // Let the SDK pick its pinned default; no need to hand-set the API version.
  _stripe = new Stripe(env.stripe.secretKey);
  return _stripe;
}
